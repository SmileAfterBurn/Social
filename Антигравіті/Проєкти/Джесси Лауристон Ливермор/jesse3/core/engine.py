"""JESSIE 3.0 — Core signal engine: analyze one symbol."""
from __future__ import annotations

import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional

from .config import cfg
from .indicators import (
    calc_rsi, volume_ratio, detect_formation, calc_atr,
    calc_bollinger, detect_fvg,
)
from .strategies import multi_strategy_analysis
from .signal import SignalResult, calc_signal_score, calc_capital_advice, calc_trade_levels
from .market import get_exchange, get_public_exchange, fetch_ohlcv, fetch_derivatives, btc_trend
from .square import fetch_square_sentiment
from .massive import enrich_analysis as massive_enrich

logger = logging.getLogger("jesse3.engine")


# ── Signal flip protection ────────────────────────────────────────────────────
# {symbol: (direction, timestamp)} — пам'ятаємо останній сигнал
_signal_cache: dict[str, tuple[str, float]] = {}
_FLIP_COOLDOWN = 1800  # 30 хв — не фліпаємо напрямок раніше


def _check_flip(symbol: str, new_direction: str) -> bool:
    """True якщо це небезпечний фліп (протилежний сигнал за < 30 хв)."""
    if new_direction == "neutral":
        return False
    prev = _signal_cache.get(symbol)
    if prev is None:
        return False
    old_dir, old_ts = prev
    if old_dir == new_direction or old_dir == "neutral":
        return False
    # Протилежний напрямок — перевіряємо час
    elapsed = time.time() - old_ts
    return elapsed < _FLIP_COOLDOWN


def _record_signal(symbol: str, direction: str) -> None:
    if direction != "neutral":
        _signal_cache[symbol] = (direction, time.time())


def analyze_symbol(
    symbol: str,
    btc_dir: Optional[dict] = None,
    derivatives: Optional[dict] = None,
    exchange=None,
) -> Optional[SignalResult]:
    """Analyze a single futures symbol and return a SignalResult (or None on error)."""
    try:
        ex = exchange or get_public_exchange()
        candles = fetch_ohlcv(symbol, cfg.timeframe, limit=200)
        if len(candles) < 50:
            return None

        # ── Відкидаємо незакриту свічку — рахуємо тільки по закритих ──────
        closed_candles = candles[:-1]  # остання = поточна, ще формується
        closed_closes  = [c["close"]  for c in closed_candles]
        closed_volumes = [c["volume"] for c in closed_candles]
        price   = float(candles[-1]["close"])  # реальна ціна — з останньої (для levels/display)

        # Фільтр ціни монети
        if cfg.max_coin_price > 0 and price > cfg.max_coin_price:
            return None

        # Core indicators — на ЗАКРИТИХ свічках
        rsi   = calc_rsi(closed_closes, cfg.rsi_period)
        vol   = volume_ratio(closed_volumes[-cfg.volume_look - 1:])
        atr   = calc_atr(closed_candles)
        form, f_long, f_short = detect_formation(closed_candles)

        # BTC trend — тепер бонус, НЕ бінарний перемикач
        btc = btc_dir or btc_trend(ex)

        # ── Стратегії обчислюємо ОДИН раз, фільтруємо двічі ──────────────
        ms = multi_strategy_analysis(closed_closes, closed_volumes, closed_candles)

        score_long  = calc_signal_score(rsi, vol, f_long,  ms.long_count,  is_long=True)
        score_short = calc_signal_score(rsi, vol, f_short, ms.short_count, is_long=False)

        # BTC alignment — бонус/штраф замість hard gate
        btc_dir_str = btc.get("direction", "neutral")
        if btc_dir_str == "up":
            score_long  += 8
            score_short -= 12
        elif btc_dir_str == "down":
            score_short += 8
            score_long  -= 12

        score_long  = max(0, min(100, score_long))
        score_short = max(0, min(100, score_short))

        # ── Вибираємо напрямок з вищим скором ─────────────────────────────
        long_valid  = score_long  >= cfg.partial_min and ms.long_count   >= cfg.min_strategies
        short_valid = score_short >= cfg.partial_min and ms.short_count >= cfg.min_strategies

        if long_valid and short_valid:
            # Обидва валідні — беремо сильніший, але тільки якщо різниця > 10
            if score_long - score_short > 10:
                direction = "long"
                score = score_long
                matching_count = ms.long_count
                is_long = True
            elif score_short - score_long > 10:
                direction = "short"
                score = score_short
                matching_count = ms.short_count
                is_long = False
            else:
                # Занадто близькі — конфлікт, не торгуємо
                direction = "neutral"
                score = max(score_long, score_short)
                matching_count = 0
                is_long = True
        elif long_valid:
            direction = "long"
            score = score_long
            matching_count = ms.long_count
            is_long = True
        elif short_valid:
            direction = "short"
            score = score_short
            matching_count = ms.short_count
            is_long = False
        else:
            direction = "neutral"
            score = max(score_long, score_short)
            matching_count = max(ms.long_count, ms.short_count)
            is_long = True

        # ── Anti-flip: не фліпаємо напрямок за 30 хв ─────────────────────
        if _check_flip(symbol, direction):
            direction = "neutral"  # блокуємо фліп
            score = min(score, cfg.partial_min - 1)  # нижче порогу

        # Record signal
        _record_signal(symbol, direction)

        # Derivatives (optional)
        deriv = derivatives
        if deriv is None and score >= cfg.partial_min:
            try:
                deriv = fetch_derivatives(symbol)
            except Exception:
                deriv = {}

        # Square sentiment — ДО розрахунку капіталу
        square = None
        if score >= cfg.partial_min:
            try:
                base = symbol.replace("/USDT", "")
                square = fetch_square_sentiment(base)
                bonus_magnitude = abs(square.signal_bonus)
                if bonus_magnitude > 0:
                    aligned = (
                        (square.label == "bullish" and direction == "long") or
                        (square.label == "bearish" and direction == "short")
                    )
                    contrary = (
                        (square.label == "bullish" and direction == "short") or
                        (square.label == "bearish" and direction == "long")
                    )
                    if aligned:
                        score = min(100, score + bonus_magnitude)
                    elif contrary:
                        score = max(0, score - bonus_magnitude)
            except Exception:
                pass

        # Capital advice — ПІСЛЯ фінального скору
        capital, lev = calc_capital_advice(score, cfg.balance)

        # Trade levels
        levels = calc_trade_levels(price, direction, atr, atr_multiplier_sl=cfg.signal_atr_sl_mult)

        notes = []
        # Показуємо протистояння стратегій
        notes.append(f"📊 L:{ms.long_count} vs S:{ms.short_count}")
        if btc.get("black_swan"):
            notes.append(f"⚠️ BLACK SWAN BTC {btc['pct']:+.1f}%")
        if (deriv or {}).get("funding") and abs((deriv or {}).get("funding", 0)) > 0.05:
            notes.append(f"Funding {deriv['funding']:+.3f}%")
        if square and square.label != "neutral":
            icon = "🟢" if square.label == "bullish" else "🔴"
            notes.append(f"{icon} Square {square.score:+d}")

        fvgs = detect_fvg(candles)
        if fvgs:
            notes.append(f"{len(fvgs)} FVG зон")

        # ── Massive.com enrichment (optional) ────────────────────────────
        try:
            massive = massive_enrich(symbol)
            if massive.get("available"):
                if massive.get("rsi_1h") is not None:
                    notes.append(f"M.RSI={massive['rsi_1h']}")
                if massive.get("news"):
                    notes.append(f"📰 {len(massive['news'])} Massive news")
        except Exception:
            pass  # non-critical enrichment

        funding = (deriv or {}).get("funding")
        ls = (deriv or {}).get("ls_ratio") or {}

        return SignalResult(
            symbol=symbol,
            direction=direction,
            score=score,
            rsi=rsi,
            volume_ratio=vol,
            formation=form,
            formation_score=f_long if is_long else f_short,
            strategy_count=matching_count,
            strategy_long=ms.long_count,
            strategy_short=ms.short_count,
            price=price,
            atr=atr,
            entry=levels["entry"],
            stop_loss=levels["sl"],
            take_profit1=levels["tp1"],
            take_profit2=levels["tp2"],
            take_profit3=levels["tp3"],
            capital_usd=capital,
            leverage_rec=lev,
            position_size=round(capital * lev, 2),
            notes=notes,
            funding=funding,
            ls_long=ls.get("long"),
            ls_short=ls.get("short"),
            square_score=square.score if square else None,
            square_label=square.label if square else None,
        )

    except Exception as e:
        logger.warning("analyze_symbol(%s) failed: %s", symbol, e, exc_info=True)
        return None


def scan_watchlist(
    symbols: Optional[list[str]] = None,
    exchange=None,
) -> list[SignalResult]:
    """Scan multiple symbols concurrently, sorted by score descending.
    
    За замовчуванням використовує SHORT_WATCHLIST (тільки перевірені прибуткові символи).
    Передай symbols=WATCHLIST для повного скану.
    """
    from .config import SHORT_WATCHLIST as DEFAULT_LIST

    target = symbols or DEFAULT_LIST

    btc = btc_trend()
    results = []

    def _analyze(sym: str) -> Optional[SignalResult]:
        return analyze_symbol(sym, btc_dir=btc)

    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = {pool.submit(_analyze, sym): sym for sym in target}
        for fut in as_completed(futures):
            r = fut.result()
            if r is not None:
                results.append(r)

    return sorted(results, key=lambda r: -r.score)
