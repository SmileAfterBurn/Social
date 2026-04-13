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
    # v3.3: при сильному confluence (3+) зменшуємо контр-штраф,
    # щоб тренд-сигнал не блокувався перепроданістю/перекупленістю
    strong_confluence = strategy_count >= 3
    if is_long:
        if rsi < 20:
            score += 30          # перепродано — відскок
        elif rsi < 30:
            score += 24
        elif rsi < 40:
            score += 16          # помірний oversold — ще є потенціал
        elif rsi < 50:
            score += 8           # нейтраль з нахилом на long
        elif rsi > 70:
            score -= 3 if strong_confluence else 8  # м'якший штраф при сильному тренді
    else:  # short
        if rsi > 80:
            score += 30          # перекуплено — відкат
        elif rsi > 70:
            score += 24
        elif rsi > 60:
            score += 16          # помірний overbought
        elif rsi > 50:
            score += 8           # нейтраль з нахилом на short
        elif rsi < 30:
            score -= 3 if strong_confluence else 8  # тренд важливіший за RSI

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


def calc_capital_advice(score: int, balance: float, min_leverage: int = 20) -> tuple[float, int]:
    """Returns (capital_usd, leverage_recommendation). Min leverage is 20x."""
    from .config import cfg
    base_lev = max(min_leverage, cfg.leverage)
    if score >= 70:
        return round(balance * 0.20, 2), base_lev
    if score >= 50:
        return round(balance * 0.10, 2), base_lev
    return round(balance * 0.05, 2), base_lev


def calc_trade_levels(
    price: float,
    direction: str,
    atr: float,
    atr_multiplier_sl: float = 1.5,
) -> dict[str, float]:
    """Calculate entry, stop-loss, and take-profit levels."""
    if atr == 0:
        atr = price * 0.005  # fallback: 0.5%

    if direction == "long":
        entry = price
        sl = round(price - atr * atr_multiplier_sl, 8)
        tp1 = round(price + atr * 2, 8)
        tp2 = round(price + atr * 4, 8)
        tp3 = round(price + atr * 6, 8)
    elif direction == "short":
        entry = price
        sl = round(price + atr * atr_multiplier_sl, 8)
        tp1 = round(price - atr * 2, 8)
        tp2 = round(price - atr * 4, 8)
        tp3 = round(price - atr * 6, 8)
    else:
        entry = price
        sl = tp1 = tp2 = tp3 = price

    return {"entry": entry, "sl": sl, "tp1": tp1, "tp2": tp2, "tp3": tp3}
