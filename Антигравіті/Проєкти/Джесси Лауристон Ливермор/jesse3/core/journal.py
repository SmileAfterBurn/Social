"""JESSIE 3.0 — Trade journal."""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional

log = logging.getLogger(__name__)


@dataclass
class Trade:
    symbol: str
    direction: str       # "long" | "short"
    entry_price: float
    close_price: float
    amount_usd: float
    leverage: int
    pnl: float
    pnl_pct: float
    opened_at: str
    closed_at: str
    status: str          # "open" | "closed"


@dataclass
class JournalData:
    balance: float
    trades: list[dict] = field(default_factory=list)
    deposits: list[dict] = field(default_factory=list)
    withdrawals: list[dict] = field(default_factory=list)
    version: str = "3.0"


class Journal:
    def __init__(self, path: Path, initial_balance: float = 20.0):
        self.path = path
        self.initial_balance = initial_balance
        self._data = self._load()

    def _load(self) -> dict:
        if self.path.exists():
            try:
                return json.loads(self.path.read_text())
            except (json.JSONDecodeError, OSError) as e:
                log.warning("journal: failed to load %s: %s", self.path, e)
        return {"balance": self.initial_balance, "trades": [], "deposits": [], "withdrawals": []}

    def _save(self) -> None:
        self.path.write_text(json.dumps(self._data, indent=2, ensure_ascii=False))

    @property
    def balance(self) -> float:
        return self._data.get("balance", self.initial_balance)

    def open_trade(self, symbol: str, price: float, amount_usd: float, direction: str = "long", leverage: int = 10) -> dict:
        now = datetime.now(timezone.utc).isoformat()
        trade = {
            "id": len(self._data["trades"]) + 1,
            "symbol": symbol.upper(),
            "direction": direction,
            "entry_price": price,
            "close_price": None,
            "amount_usd": amount_usd,
            "leverage": leverage,
            "pnl": None,
            "pnl_pct": None,
            "opened_at": now,
            "closed_at": None,
            "status": "open",
        }
        self._data["trades"].append(trade)
        self._save()
        return trade

    def close_trade(self, symbol: str, close_price: float) -> Optional[dict]:
        symbol = symbol.upper()
        for trade in reversed(self._data["trades"]):
            if trade["symbol"] == symbol and trade["status"] == "open":
                now = datetime.now(timezone.utc).isoformat()
                entry = trade["entry_price"]
                if entry <= 0:
                    log.error("journal: entry_price is 0 for %s, skipping PnL", symbol)
                    return None
                lev = trade.get("leverage", 10)
                amount = trade["amount_usd"]

                if trade["direction"] == "long":
                    pnl_pct = (close_price - entry) / entry * 100 * lev
                else:
                    pnl_pct = (entry - close_price) / entry * 100 * lev

                pnl = round(amount * pnl_pct / 100, 2)
                self._data["balance"] = round(self._data["balance"] + pnl, 2)

                trade.update({
                    "close_price": close_price,
                    "pnl": pnl,
                    "pnl_pct": round(pnl_pct, 2),
                    "closed_at": now,
                    "status": "closed",
                })
                self._save()
                return trade
        return None

    def deposit(self, amount: float) -> float:
        now = datetime.now(timezone.utc).isoformat()
        self._data["balance"] = round(self._data["balance"] + amount, 2)
        self._data.setdefault("deposits", []).append({"amount": amount, "at": now})
        self._save()
        return self._data["balance"]

    def withdraw(self, amount: float) -> float:
        now = datetime.now(timezone.utc).isoformat()
        self._data["balance"] = round(self._data["balance"] - amount, 2)
        self._data.setdefault("withdrawals", []).append({"amount": amount, "at": now})
        self._save()
        return self._data["balance"]

    def open_trades(self) -> list[dict]:
        return [t for t in self._data["trades"] if t["status"] == "open"]

    def closed_trades(self) -> list[dict]:
        return [t for t in self._data["trades"] if t["status"] == "closed"]

    def stats(self) -> dict:
        closed = self.closed_trades()
        if not closed:
            return {
                "balance": self.balance,
                "total_trades": 0,
                "win_rate": 0.0,
                "total_pnl": 0.0,
                "best_trade": None,
                "worst_trade": None,
                "open_trades": len(self.open_trades()),
            }
        wins = [t for t in closed if (t.get("pnl") or 0) > 0]
        total_pnl = sum((t.get("pnl") or 0) for t in closed)
        best = max(closed, key=lambda t: t.get("pnl") or 0)
        worst = min(closed, key=lambda t: t.get("pnl") or 0)
        return {
            "balance": self.balance,
            "total_trades": len(closed),
            "win_rate": round(len(wins) / len(closed) * 100, 1),
            "total_pnl": round(total_pnl, 2),
            "best_trade": best,
            "worst_trade": worst,
            "open_trades": len(self.open_trades()),
        }

    def gemini_format(self) -> str:
        """Compact string for pasting into AI chat."""
        parts = [f"BALANCE:${self.balance:.2f}"]
        for t in self._data["trades"][-5:]:
            dt = (t["opened_at"] or "")[:10]
            sym = t["symbol"].replace("/USDT", "").replace("1000", "")
            entry = t["entry_price"]
            if t["status"] == "closed":
                pnl = t.get("pnl", 0)
                sign = "+" if pnl >= 0 else ""
                parts.append(f"{dt} {t['direction'].upper()} {sym} ${entry} → ${t['close_price']} {sign}{pnl}$")
            else:
                parts.append(f"{dt} OPEN {sym} ${entry} ${t['amount_usd']}")
        return " | ".join(parts)
