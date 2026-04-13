"""JESSIE 3.0 — Signal scoring & capital advice."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .square import SquareSentiment


@dataclass
class SignalResult:
    symbol: str
    direction: str          # "long" | "short" | "neutral"
    score: int              # 0–100
    rsi: float
    volume_ratio: float
    formation: str
    formation_score: int
    strategy_count: int
    strategy_long: int
    strategy_short: int
    price: float
    atr: float
    entry: float = 0.0
    stop_loss: float = 0.0
    take_profit1: float = 0.0
    take_profit2: float = 0.0
    take_profit3: float = 0.0
    capital_usd: float = 0.0
    leverage_rec: int = 10
    position_size: float = 0.0
    notes: list[str] = field(default_factory=list)
    # Ф'ючерсні метадані
    funding: Optional[float] = None           # funding rate %
    ls_long: Optional[float] = None           # % лонгів
    ls_short: Optional[float] = None          # % шортів
    square_score: Optional[int] = None        # сентимент -100…+100
    square_label: Optional[str] = None        # bullish | bearish | neutral

    @property
    def strength(self) -> str:
        from .config import cfg
        if self.score >= cfg.strong_min:
            return "strong"
        if self.score >= cfg.partial_min:
            return "partial"
        return "weak"

    @property
    def is_tradeable(self) -> bool:
        from .config import cfg
        return self.score >= cfg.partial_min and self.direction in ("long", "short")


def calc_signal_score(
    rsi: float,
    vol: float,
    formation_score: int,
    strategy_count: int,
    is_long: bool = True,
) -> int:
    """Calculate composite signal score 0–100.
    
    Калібрація для SHORT-TERM (5m): зайшов → вийшов.
    Пріоритет: стратегічна згода > momentum > volume > формація.
    """
    score = 0

    # ── Strategy confluence (max 35) — найважливіше ──────────────────────
    if strategy_count >= 5:
        score += 35
    elif strategy_count >= 4:
        score += 28
    elif strategy_count >= 3:
        score += 22
    elif strategy_count >= 2:
        score += 14
    elif strategy_count >= 1:
        score += 6

    # ── RSI momentum (max 30) — бали навіть для помірних зон ────────────
    # v3.4: mean-reversion (RSI extreme проти напрямку) різко обмежено.
    # Для скальпінгу ловити ножі (RSI<20 → long) — головна причина втрат.
    strong_confluence = strategy_count >= 3
    if is_long:
        if rsi < 30:
            # MEAN-REVERSION ZONE — небезпечно для скальпінгу!
            # Тільки якщо ≥4 стратегії підтверджують (сильний розворот)
            if strategy_count >= 4:
                score += 15          # обережний бонус, було 24-30
            elif strategy_count >= 3:
                score += 8           # мінімальний
            # else: 0 — не даємо балів, ринок падає
        elif rsi < 40:
            score += 16          # помірний oversold — є потенціал
        elif rsi < 55:
            score += 22          # v3.4: sweet spot для trend-long
        elif rsi > 70:
            score -= 3 if strong_confluence else 8
    else:  # short
        if rsi > 70:
            # MEAN-REVERSION ZONE — обережно
            if strategy_count >= 4:
                score += 15
            elif strategy_count >= 3:
                score += 8
        elif rsi > 60:
            score += 16          # помірний overbought
        elif rsi > 45:
            score += 22          # v3.4: sweet spot для trend-short
        elif rsi < 30:
            score -= 3 if strong_confluence else 8

    # ── Volume activity (max 20) — знижені пороги для 5m ────────────────
    if vol >= 2.5:
        score += 20
    elif vol >= 1.8:
        score += 15
    elif vol >= 1.3:
        score += 10
    elif vol >= 1.0:
        score += 5              # навіть середній volume — ОК для 5m
    elif vol >= 0.7:
        score += 2              # ринок живий

    # ── Formation bonus (max 15) ────────────────────────────────────────
    score += min(formation_score * 5, 15)

    return max(0, min(100, score))


def calc_capital_advice(
    score: int,
    balance: float,
    stop_distance_pct: float = 0.0,
) -> tuple[float, int]:
    """Risk-based position sizing: max_risk_per_trade / stop_distance = notional.

    v3.4: позиція рахується від ДОПУСТИМОГО ЗБИТКУ, а не від % балансу.
    Це гарантує однаковий ризик незалежно від ширини стопу.
    """
    from .config import cfg
    lev = cfg.leverage  # без примусового мінімуму — конфіг вирішує

    # Макс ризик на трейд: 1% балансу для strong, 0.5% для partial
    if score >= cfg.strong_min:
        risk_pct = 0.01
    elif score >= cfg.partial_min:
        risk_pct = 0.005
    else:
        risk_pct = 0.003

    max_risk_usd = balance * risk_pct  # $20 × 1% = $0.20

    # Якщо є SL distance — рахуємо позицію від ризику
    if stop_distance_pct > 0:
        # notional = risk / stop_distance
        # capital = notional / leverage
        notional = max_risk_usd / stop_distance_pct
        capital = notional / lev
        # Не більше 10% балансу як hard cap
        capital = min(capital, balance * 0.10)
    else:
        # Fallback: мінімальна позиція
        capital = balance * 0.03

    return round(max(capital, 0.01), 2), lev


def calc_trade_levels(
    price: float,
    direction: str,
    atr: float,
    atr_multiplier_sl: float = 1.5,
) -> dict[str, float]:
    """Calculate entry, stop-loss, and take-profit levels.

    v3.4 (scalping): SL тісніший, TP реалістичніші для 5m.
    TP1 = 1.0 ATR, TP2 = 1.5 ATR, TP3 = 2.0 ATR (було 2/4/6).
    """
    if atr == 0:
        atr = price * 0.005  # fallback: 0.5%

    if direction == "long":
        entry = price
        sl = round(price - atr * atr_multiplier_sl, 8)
        tp1 = round(price + atr * 1.0, 8)
        tp2 = round(price + atr * 1.5, 8)
        tp3 = round(price + atr * 2.0, 8)
    elif direction == "short":
        entry = price
        sl = round(price + atr * atr_multiplier_sl, 8)
        tp1 = round(price - atr * 1.0, 8)
        tp2 = round(price - atr * 1.5, 8)
        tp3 = round(price - atr * 2.0, 8)
    else:
        entry = price
        sl = tp1 = tp2 = tp3 = price

    # stop_distance_pct — для risk-based sizing
    sl_dist = abs(price - sl) / price if price else 0
    return {
        "entry": entry, "sl": sl, "tp1": tp1, "tp2": tp2, "tp3": tp3,
        "sl_distance_pct": sl_dist,
    }
