"""JESSIE 3.0 — Multi-strategy analysis module."""
from __future__ import annotations

from typing import Sequence

from .indicators import (
    Candle,
    calc_ema,
    calc_ema_series,
    calc_bollinger,
    calc_macd,
    calc_supertrend,
    calc_stoch_rsi,
    calc_rsi,
    calc_atr,
    volume_ratio,
)


# ── Strategy result ───────────────────────────────────────────────────────────

class StrategyResult:
    def __init__(self, name: str, signal: str, score: float, note: str = ""):
        self.name = name
        self.signal = signal    # "long" | "short" | "neutral"
        self.score = score      # 0.0–1.0
        self.note = note

    def __repr__(self) -> str:
        return f"<{self.name}: {self.signal} {self.score:.0%} — {self.note}>"


# ── Individual strategies ─────────────────────────────────────────────────────

def strategy_ema_trend(closes: Sequence[float], candles: list[Candle]) -> StrategyResult:
    """EMA 9/21/50 trend alignment."""
    if len(closes) < 55:
        return StrategyResult("EMA Trend", "neutral", 0.0, "insufficient data")

    ema9  = calc_ema(closes, 9)
    ema21 = calc_ema(closes, 21)
    ema50 = calc_ema(closes, 50)
    price = closes[-1]

    # Perfect bullish stack
    if price > ema9 > ema21 > ema50:
        return StrategyResult("EMA Trend", "long", 1.0, f"9>{ema9:.4f}>21>{ema21:.4f}>50>{ema50:.4f}")
    if price < ema9 < ema21 < ema50:
        return StrategyResult("EMA Trend", "short", 1.0, "bearish stack")

    # Partial alignment
    if price > ema21 > ema50:
        return StrategyResult("EMA Trend", "long", 0.6, "partial bullish")
    if price < ema21 < ema50:
        return StrategyResult("EMA Trend", "short", 0.6, "partial bearish")

    # Price vs EMA50 only
    if price > ema50:
        return StrategyResult("EMA Trend", "long", 0.3, "above EMA50")
    return StrategyResult("EMA Trend", "short", 0.3, "below EMA50")


def strategy_bollinger(closes: Sequence[float], candles: list[Candle]) -> StrategyResult:
    """Bollinger Band squeeze + breakout."""
    if len(closes) < 22:
        return StrategyResult("Bollinger", "neutral", 0.0, "insufficient data")

    bb = calc_bollinger(closes, 20, 2.0)
    price = closes[-1]
    prev  = closes[-2]

    squeeze = bb["width"] < 0.02

    if prev <= bb["lower"] and price > bb["lower"]:
        score = 1.0 if squeeze else 0.7
        return StrategyResult("Bollinger", "long", score, f"bounce from lower {bb['lower']:.6f}")
    if prev >= bb["upper"] and price < bb["upper"]:
        score = 1.0 if squeeze else 0.7
        return StrategyResult("Bollinger", "short", score, f"rejection upper {bb['upper']:.6f}")

    # Inside band momentum
    if price < bb["middle"] and closes[-3] > bb["middle"]:
        return StrategyResult("Bollinger", "short", 0.4, "crossed below middle")
    if price > bb["middle"] and closes[-3] < bb["middle"]:
        return StrategyResult("Bollinger", "long", 0.4, "crossed above middle")

    return StrategyResult("Bollinger", "neutral", 0.0, f"width={bb['width']:.3f}")


def strategy_macd(closes: Sequence[float]) -> StrategyResult:
    """MACD crossover."""
    if len(closes) < 40:
        return StrategyResult("MACD", "neutral", 0.0, "insufficient data")

    curr = calc_macd(closes)
    prev = calc_macd(closes[:-1])

    if prev["hist"] < 0 < curr["hist"]:
        strength = min(abs(curr["hist"]) / (abs(curr["macd"]) + 1e-9), 1.0)
        return StrategyResult("MACD", "long", 0.5 + 0.5 * strength, "bullish crossover")
    if prev["hist"] > 0 > curr["hist"]:
        strength = min(abs(curr["hist"]) / (abs(curr["macd"]) + 1e-9), 1.0)
        return StrategyResult("MACD", "short", 0.5 + 0.5 * strength, "bearish crossover")

    if curr["hist"] > 0 and curr["macd"] > 0:
        return StrategyResult("MACD", "long", 0.4, "bullish zone")
    if curr["hist"] < 0 and curr["macd"] < 0:
        return StrategyResult("MACD", "short", 0.4, "bearish zone")

    return StrategyResult("MACD", "neutral", 0.0, f"hist={curr['hist']:.6f}")


def strategy_supertrend(candles: list[Candle]) -> StrategyResult:
    """Supertrend direction."""
    if len(candles) < 12:
        return StrategyResult("Supertrend", "neutral", 0.0, "insufficient data")

    st = calc_supertrend(candles)
    if st["direction"] == "bullish":
        return StrategyResult("Supertrend", "long", 0.8, f"support {st['value']:.6f}")
    if st["direction"] == "bearish":
        return StrategyResult("Supertrend", "short", 0.8, f"resistance {st['value']:.6f}")
    return StrategyResult("Supertrend", "neutral", 0.0)


def strategy_stoch_rsi(closes: Sequence[float]) -> StrategyResult:
    """Stochastic RSI oversold/overbought."""
    if len(closes) < 35:
        return StrategyResult("StochRSI", "neutral", 0.0, "insufficient data")

    sr = calc_stoch_rsi(closes)
    k, d = sr["k"], sr["d"]

    if k < 20 and d < 20 and k > d:
        return StrategyResult("StochRSI", "long", 0.9, f"K={k} D={d} oversold+cross")
    if k > 80 and d > 80 and k < d:
        return StrategyResult("StochRSI", "short", 0.9, f"K={k} D={d} overbought+cross")
    if k < 30:
        return StrategyResult("StochRSI", "long", 0.5, f"oversold K={k}")
    if k > 70:
        return StrategyResult("StochRSI", "short", 0.5, f"overbought K={k}")

    return StrategyResult("StochRSI", "neutral", 0.0, f"K={k}")


def strategy_breakout(
    closes: Sequence[float], volumes: Sequence[float], candles: list[Candle]
) -> StrategyResult:
    """Volume breakout from recent range."""
    if len(closes) < 22:
        return StrategyResult("Breakout", "neutral", 0.0, "insufficient data")

    high_20 = max(c["high"] for c in candles[-21:-1])
    low_20  = min(c["low"]  for c in candles[-21:-1])
    vol_ratio = volume_ratio(list(volumes[-11:]))
    price = closes[-1]

    if price > high_20 and vol_ratio >= 1.5:
        score = min(0.5 + vol_ratio * 0.1, 1.0)
        return StrategyResult("Breakout", "long", score, f"above {high_20:.6f} vol×{vol_ratio:.1f}")
    if price < low_20 and vol_ratio >= 1.5:
        score = min(0.5 + vol_ratio * 0.1, 1.0)
        return StrategyResult("Breakout", "short", score, f"below {low_20:.6f} vol×{vol_ratio:.1f}")

    return StrategyResult("Breakout", "neutral", 0.0, f"range [{low_20:.6f},{high_20:.6f}]")


def strategy_vwap(closes: Sequence[float], candles: list[Candle]) -> StrategyResult:
    """VWAP trend — ціна відносно VWAP визначає інтрадей-bias."""
    from .indicators import calc_vwap
    if len(candles) < 10:
        return StrategyResult("VWAP", "neutral", 0.0, "insufficient data")

    vwap = calc_vwap(candles[-50:])
    price = closes[-1]
    prev = closes[-2]
    dist_pct = (price - vwap) / vwap if vwap else 0

    # Crossover
    if prev < vwap and price > vwap:
        return StrategyResult("VWAP", "long", 0.9, f"cross above {vwap:.6f}")
    if prev > vwap and price < vwap:
        return StrategyResult("VWAP", "short", 0.9, f"cross below {vwap:.6f}")

    # Trend zone
    if price > vwap and dist_pct < 0.02:
        return StrategyResult("VWAP", "long", 0.5, f"above +{dist_pct*100:.1f}%")
    if price < vwap and dist_pct > -0.02:
        return StrategyResult("VWAP", "short", 0.5, f"below {dist_pct*100:.1f}%")

    # Extended — ціна далеко від VWAP, mean-reversion зона
    if dist_pct > 0.02:
        return StrategyResult("VWAP", "short", 0.3, f"extended +{dist_pct*100:.1f}%")
    if dist_pct < -0.02:
        return StrategyResult("VWAP", "long", 0.3, f"extended {dist_pct*100:.1f}%")

    return StrategyResult("VWAP", "neutral", 0.0, f"VWAP={vwap:.6f}")


def strategy_adx(candles: list[Candle]) -> StrategyResult:
    """ADX trend strength — підтверджує наявність тренду."""
    from .indicators import calc_adx
    if len(candles) < 30:
        return StrategyResult("ADX", "neutral", 0.0, "insufficient data")

    adx = calc_adx(candles)
    adx_val = adx["adx"]
    plus_di = adx["plus_di"]
    minus_di = adx["minus_di"]

    # Сильний тренд (ADX > 25)
    if adx_val >= 25:
        if plus_di > minus_di:
            score = min(0.5 + (adx_val - 25) * 0.02, 1.0)
            return StrategyResult("ADX", "long", score, f"ADX={adx_val:.0f} +DI>{minus_di:.0f}")
        else:
            score = min(0.5 + (adx_val - 25) * 0.02, 1.0)
            return StrategyResult("ADX", "short", score, f"ADX={adx_val:.0f} -DI>{plus_di:.0f}")

    # Помірний тренд (ADX 20-25)
    if adx_val >= 20:
        if plus_di > minus_di:
            return StrategyResult("ADX", "long", 0.3, f"ADX={adx_val:.0f} weak trend")
        else:
            return StrategyResult("ADX", "short", 0.3, f"ADX={adx_val:.0f} weak trend")

    # Без тренду — chop
    return StrategyResult("ADX", "neutral", 0.0, f"ADX={adx_val:.0f} no trend")


# ── Multi-strategy aggregator ─────────────────────────────────────────────────

class MultiStrategyResult:
    def __init__(
        self,
        strategies: list[StrategyResult],
        direction: str,
        long_count: int,
        short_count: int,
        avg_score: float,
    ):
        self.strategies = strategies
        self.direction = direction
        self.long_count = long_count
        self.short_count = short_count
        self.avg_score = avg_score

    @property
    def is_valid(self) -> bool:
        from .config import cfg
        return (
            self.long_count >= cfg.min_strategies or self.short_count >= cfg.min_strategies
        ) and self.avg_score >= 0.4


def multi_strategy_analysis(
    closes: Sequence[float],
    volumes: Sequence[float],
    candles: list[Candle],
    is_long: bool | None = None,
) -> MultiStrategyResult:
    """Compute all strategies once; derive long/short counts from single pass.
    
    If is_long is None (default), returns counts for both directions.
    If is_long is True/False, returns matching direction for backward compatibility.
    """
    strategies = [
        strategy_ema_trend(closes, candles),
        strategy_bollinger(closes, candles),
        strategy_macd(closes),
        strategy_supertrend(candles),
        strategy_stoch_rsi(closes),
        strategy_breakout(closes, volumes, candles),
        strategy_vwap(closes, candles),
        strategy_adx(candles),
    ]

    long_count  = sum(1 for s in strategies if s.signal == "long"  and s.score > 0)
    short_count = sum(1 for s in strategies if s.signal == "short" and s.score > 0)

    if is_long is None:
        # New mode: return both counts, direction based on majority
        if long_count > short_count and long_count >= 2:
            direction = "long"
            matching = [s for s in strategies if s.signal == "long" and s.score > 0]
        elif short_count > long_count and short_count >= 2:
            direction = "short"
            matching = [s for s in strategies if s.signal == "short" and s.score > 0]
        else:
            direction = "neutral"
            matching = []
    else:
        target = "long" if is_long else "short"
        matching = [s for s in strategies if s.signal == target and s.score > 0]
        direction = target if len(matching) >= 2 else "neutral"

    avg_score = sum(s.score for s in matching) / len(matching) if matching else 0.0

    return MultiStrategyResult(
        strategies=strategies,
        direction=direction,
        long_count=long_count,
        short_count=short_count,
        avg_score=avg_score,
    )
