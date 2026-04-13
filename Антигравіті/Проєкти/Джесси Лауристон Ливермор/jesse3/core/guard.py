"""JESSIE 3.0 — Risk management & drawdown guard."""
from __future__ import annotations

import json
import logging
from datetime import date
from pathlib import Path
from dataclasses import dataclass

log = logging.getLogger(__name__)


@dataclass
class GuardStatus:
    blocked: bool
    daily_loss: float
    limit: float
    remaining: float
    pct_used: float
    date: str


def _today() -> str:
    return date.today().isoformat()


def _load(path: Path) -> dict:
    if path.exists():
        try:
            return json.loads(path.read_text())
        except (json.JSONDecodeError, OSError) as e:
            log.warning("guard: failed to load %s: %s", path, e)
    return {}


def _save(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2))


def check_drawdown_guard(daily_loss_file: Path, balance: float, max_pct: float) -> GuardStatus:
    data = _load(daily_loss_file)
    today = _today()
    if data.get("date") != today:
        data = {"date": today, "loss": 0.0}

    limit = balance * max_pct / 100
    loss = abs(data.get("loss", 0.0))
    blocked = loss >= limit
    remaining = max(0.0, limit - loss)
    pct_used = round(loss / limit * 100, 1) if limit > 0 else 0.0

    return GuardStatus(
        blocked=blocked,
        daily_loss=round(loss, 2),
        limit=round(limit, 2),
        remaining=round(remaining, 2),
        pct_used=pct_used,
        date=today,
    )


def record_loss(daily_loss_file: Path, amount_usd: float) -> GuardStatus:
    """Record a loss and return updated guard status."""
    from .config import cfg

    data = _load(daily_loss_file)
    today = _today()
    if data.get("date") != today:
        data = {"date": today, "loss": 0.0}

    data["loss"] = data.get("loss", 0.0) + abs(amount_usd)
    _save(daily_loss_file, data)
    return check_drawdown_guard(daily_loss_file, cfg.balance, cfg.max_daily_loss_pct)


def liquidation_proximity(
    entry_price: float,
    current_price: float,
    direction: str,
    leverage: int,
) -> dict[str, object]:
    """Calculate how close to liquidation we are."""
    if entry_price <= 0:
        return {"pct_to_liq": 100.0, "danger": False}

    liq_pct = 100 / leverage  # approximate

    if direction == "long":
        liq_price = entry_price * (1 - liq_pct / 100)
        pct_to_liq = (current_price - liq_price) / current_price * 100
    else:
        liq_price = entry_price * (1 + liq_pct / 100)
        pct_to_liq = (liq_price - current_price) / current_price * 100

    danger = pct_to_liq < 8.0

    return {
        "liq_price": round(liq_price, 8),
        "pct_to_liq": round(pct_to_liq, 2),
        "danger": danger,
    }
