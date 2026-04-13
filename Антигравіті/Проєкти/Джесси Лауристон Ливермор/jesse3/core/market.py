"""JESSIE 3.0 — Market data: BTC trend, derivatives, order book."""
from __future__ import annotations

import json
import logging
import time
import urllib.request
from typing import Optional

import ccxt

from .config import cfg

log = logging.getLogger(__name__)


# ── Exchange singletons ───────────────────────────────────────────────────────

_public_exchange: Optional[ccxt.binance] = None  # read-only, no auth needed
_private_exchange: Optional[ccxt.binance] = None  # authenticated, for trading


def get_public_exchange() -> ccxt.binance:
    """Public read-only exchange — works without API keys."""
    global _public_exchange
    if _public_exchange is None:
        _public_exchange = ccxt.binance({"options": {"defaultType": "future"}})
    return _public_exchange


def _load_private_key() -> str:
    """Завантажує приватний ключ Ed25519 з PEM-файлу."""
    path = cfg.binance_private_key_path
    if not path:
        return ""
    from pathlib import Path
    p = Path(path)
    if not p.exists():
        return ""
    return p.read_text(encoding="utf-8").strip()


def get_exchange() -> ccxt.binance:
    """Authenticated exchange — Ed25519 PEM → HMAC fallback → public."""
    global _private_exchange
    if _private_exchange is not None:
        return _private_exchange

    params: dict = {"options": {"defaultType": "future"}}

    if cfg.binance_api_key:
        params["apiKey"] = cfg.binance_api_key

        # Ed25519: приватний ключ з PEM-файлу
        private_key_pem = _load_private_key()
        if private_key_pem:
            params["secret"] = private_key_pem
            # ccxt визначає Ed25519 автоматично по заголовку PRIVATE KEY
            params["options"]["defaultType"] = "future"
        elif cfg.binance_secret:
            # Fallback: HMAC-SHA256 (якщо немає PEM)
            params["secret"] = cfg.binance_secret

        _private_exchange = ccxt.binance(params)
    else:
        _private_exchange = get_public_exchange()

    return _private_exchange


# ── OHLCV ─────────────────────────────────────────────────────────────────────

_FAPI = "https://fapi.binance.com"


def _binance_symbol(symbol: str) -> str:
    """Convert ccxt 'BTC/USDT' or 'BTCUSDT' to Binance symbol 'BTCUSDT'."""
    return symbol.replace("/", "").upper()


def fetch_ohlcv(symbol: str, timeframe: str = "5m", limit: int = 200) -> list[dict]:
    """Fetch OHLCV from Binance FAPI directly — no ccxt market-loading overhead."""
    sym = _binance_symbol(symbol)
    url = f"{_FAPI}/fapi/v1/klines?symbol={sym}&interval={timeframe}&limit={limit}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Jesse3/1.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            raw = json.loads(r.read())
        return [
            {"ts": int(row[0]), "open": float(row[1]), "high": float(row[2]),
             "low": float(row[3]), "close": float(row[4]), "volume": float(row[5])}
            for row in raw
        ]
    except Exception:
        return []


# ── BTC trend ─────────────────────────────────────────────────────────────────

def btc_trend(exchange: Optional[ccxt.binance] = None) -> dict[str, object]:
    """BTC trend на основі 1h свічок (12 годин) — стабільний, не фліпає."""
    try:
        # 1h × 12 = 12 годин — стабільний тренд
        url = f"{_FAPI}/fapi/v1/klines?symbol=BTCUSDT&interval=1h&limit=12"
        req = urllib.request.Request(url, headers={"User-Agent": "Jesse3/1.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            candles = json.loads(r.read())
        if len(candles) < 4:
            return {"direction": "neutral", "pct": 0.0, "black_swan": False}

        first = float(candles[0][1])   # open першої свічки
        last  = float(candles[-1][4])  # close останньої
        pct = (last - first) / first * 100

        # EMA-згладжування: середня 3 останніх closes
        recent_closes = [float(c[4]) for c in candles[-3:]]
        smoothed = sum(recent_closes) / len(recent_closes)
        smoothed_pct = (smoothed - first) / first * 100

        # Швидкий black_swan детектор — 15m свічки (не 12h!)
        black_swan = False
        try:
            url_fast = f"{_FAPI}/fapi/v1/klines?symbol=BTCUSDT&interval=15m&limit=4"
            req_fast = urllib.request.Request(url_fast, headers={"User-Agent": "Jesse3/1.0"})
            with urllib.request.urlopen(req_fast, timeout=5) as r2:
                fast_candles = json.loads(r2.read())
            if len(fast_candles) >= 2:
                fast_first = float(fast_candles[0][1])
                fast_last  = float(fast_candles[-1][4])
                fast_pct   = abs((fast_last - fast_first) / fast_first * 100)
                black_swan = fast_pct >= cfg.black_swan_pct
        except Exception:
            pass

        # Поріг 1.0% — ігноруємо мікрорухи
        if smoothed_pct > 1.0:
            direction = "up"
        elif smoothed_pct < -1.0:
            direction = "down"
        else:
            direction = "neutral"

        return {"direction": direction, "pct": round(pct, 2), "black_swan": black_swan}
    except Exception:
        return {"direction": "neutral", "pct": 0.0, "black_swan": False}


# ── Derivatives (funding + long/short ratio) ──────────────────────────────────

def _http_get(url: str, timeout: int = 6) -> Optional[dict]:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Jesse3/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except Exception:
        return None


def fetch_derivatives(binance_symbol: str) -> dict[str, object]:
    """Fetch funding rate and long/short ratio for a futures symbol."""
    # Нормалізація: 'DOGE/USDT' → 'DOGEUSDT', '1000PEPE/USDT' → '1000PEPEUSDT'
    sym = binance_symbol.replace("/", "").upper()
    if not sym.endswith("USDT"):
        sym += "USDT"
    result: dict[str, object] = {"funding": None, "ls_ratio": None, "taker_buy_ratio": None}

    # Funding rate
    url = f"https://fapi.binance.com/fapi/v1/fundingRate?symbol={sym}&limit=1"
    data = _http_get(url)
    if data and isinstance(data, list) and data:
        try:
            result["funding"] = round(float(data[0]["fundingRate"]) * 100, 4)
        except Exception:
            pass

    # Long/short ratio — потребує символ без '1000' префікса для деяких ендпоінтів
    sym_clean = sym.replace("1000", "") if sym.startswith("1000") else sym
    url2 = f"https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol={sym_clean}&period=5m&limit=1"
    data2 = _http_get(url2)
    if not data2 or not isinstance(data2, list) or not data2:
        # Fallback: спробуємо з оригінальним символом
        url2 = f"https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol={sym}&period=5m&limit=1"
        data2 = _http_get(url2)
    if data2 and isinstance(data2, list) and data2:
        try:
            long_pct = round(float(data2[0]["longAccount"]) * 100, 1)
            short_pct = round(float(data2[0]["shortAccount"]) * 100, 1)
            result["ls_ratio"] = {"long": long_pct, "short": short_pct}
        except Exception:
            pass

    # Taker buy/sell ratio
    url3 = f"https://fapi.binance.com/futures/data/takerlongshortRatio?symbol={sym_clean}&period=5m&limit=1"
    data3 = _http_get(url3)
    if not data3 or not isinstance(data3, list) or not data3:
        url3 = f"https://fapi.binance.com/futures/data/takerlongshortRatio?symbol={sym}&period=5m&limit=1"
        data3 = _http_get(url3)
    if data3 and isinstance(data3, list) and data3:
        try:
            result["taker_buy_ratio"] = round(float(data3[0]["buySellRatio"]), 2)
        except Exception:
            pass

    return result


def fetch_funding_all(symbols: list[str]) -> dict[str, float]:
    """Fetch funding rates for multiple symbols at once."""
    url = "https://fapi.binance.com/fapi/v1/premiumIndex"
    data = _http_get(url)
    if not data:
        return {}
    result = {}
    sym_set = {s.replace("/", "").replace("1000", "").upper() for s in symbols}
    for item in data:
        sym = item.get("symbol", "")
        if sym in sym_set or sym.replace("USDT", "") in sym_set:
            try:
                result[sym] = round(float(item["lastFundingRate"]) * 100, 4)
            except Exception:
                pass
    return result


# ── Order book walls ──────────────────────────────────────────────────────────

def detect_order_book_walls(
    symbol: str,
    current_price: float,
    exchange: Optional[ccxt.binance] = None,
) -> dict[str, list[dict]]:
    """Detect large bid/ask walls in order book via direct Binance REST."""
    sym = _binance_symbol(symbol)
    url = f"{_FAPI}/fapi/v1/depth?symbol={sym}&limit=50"
    try:
        data = _http_get(url, timeout=8)
        if not data:
            return {"bid_walls": [], "ask_walls": []}
        bids = [(float(p), float(v)) for p, v in data.get("bids", []) if float(v) > 0]
        asks = [(float(p), float(v)) for p, v in data.get("asks", []) if float(v) > 0]
    except Exception:
        return {"bid_walls": [], "ask_walls": []}

    if not bids or not asks:
        return {"bid_walls": [], "ask_walls": []}

    bid_walls, ask_walls = [], []
    threshold = cfg.wall_multiplier
    min_usdt = cfg.wall_min_usdt

    avg_bid_size = sum(v for _, v in bids) / len(bids)
    avg_ask_size = sum(v for _, v in asks) / len(asks)

    for price, size in bids:
        usdt_val = price * size
        dist_pct = abs(current_price - price) / current_price * 100
        if size > avg_bid_size * threshold and usdt_val > min_usdt and dist_pct < 5:
            bid_walls.append({
                "price": price,
                "size": round(size, 2),
                "usdt": round(usdt_val, 0),
                "dist_pct": round(dist_pct, 2),
            })

    for price, size in asks:
        usdt_val = price * size
        dist_pct = abs(price - current_price) / current_price * 100
        if size > avg_ask_size * threshold and usdt_val > min_usdt and dist_pct < 5:
            ask_walls.append({
                "price": price,
                "size": round(size, 2),
                "usdt": round(usdt_val, 0),
                "dist_pct": round(dist_pct, 2),
            })

    return {
        "bid_walls": sorted(bid_walls, key=lambda x: -x["usdt"])[:3],
        "ask_walls": sorted(ask_walls, key=lambda x: -x["usdt"])[:3],
    }


# ── Dynamic cheap-altcoin discovery ──────────────────────────────────────────

_cheap_cache: tuple[float, list[str]] = (0.0, [])   # (timestamp, symbols)
_CHEAP_CACHE_TTL = 300  # 5 хвилин


def fetch_cheap_altcoins(
    max_price: float = 1.0,
    min_volume_usd: float = 1_000_000,
    limit: int = 60,
) -> list[str]:
    """
    Повертає список символів USDT-ф'ючерсів дешевше max_price
    з денним об'ємом > min_volume_usd, відсортованих за об'ємом.
    Формат: 'DOGE/USDT' (ccxt-сумісний).
    Результат кешується на 5 хвилин.
    """
    global _cheap_cache
    now = time.time()
    if now - _cheap_cache[0] < _CHEAP_CACHE_TTL and _cheap_cache[1]:
        return _cheap_cache[1]

    url = f"{_FAPI}/fapi/v1/ticker/24hr"
    data = _http_get(url, timeout=10)
    if not data or not isinstance(data, list):
        return _cheap_cache[1]  # повертаємо стару версію при помилці

    results = []
    for item in data:
        sym = item.get("symbol", "")
        # Тільки USDT-пари, пропускаємо BTC та ETH (дорогі)
        if not sym.endswith("USDT"):
            continue
        if sym in ("BTCUSDT", "ETHUSDT", "BNBUSDT"):
            continue

        try:
            price = float(item.get("lastPrice", 0))
            vol_usdt = float(item.get("quoteVolume", 0))  # 24h об'єм в USDT
        except (ValueError, TypeError):
            continue

        if price <= 0 or price > max_price:
            continue
        if vol_usdt < min_volume_usd:
            continue

        # Пропускаємо пари без волатильності
        try:
            price_chg = abs(float(item.get("priceChangePercent", 0)))
        except (ValueError, TypeError):
            price_chg = 0
        if price_chg < 0.5:
            continue

        # Конвертуємо в ccxt-формат
        base = sym[:-4]  # прибираємо 'USDT'
        results.append((vol_usdt, f"{base}/USDT"))

    # Сортуємо за об'ємом, беремо топ limit
    results.sort(reverse=True)
    symbols = [s for _, s in results[:limit]]

    _cheap_cache = (now, symbols)
    return symbols


# ── Відстеження аккаунту (Ed25519 auth) ──────────────────────────────────────

_PAPI = "https://papi.binance.com"


def _papi_signed(path: str, params: dict | None = None) -> dict | list:
    """Підписаний запит до Portfolio Margin API (/papi/v1/)."""
    import hashlib
    import hmac as _hmac

    api_key = cfg.binance_api_key
    secret  = cfg.binance_secret
    if not api_key or not secret:
        raise ValueError("BINANCE_API_KEY або BINANCE_SECRET_KEY не вказано в .env")

    p = dict(params or {})
    p["timestamp"] = int(time.time() * 1000)
    query = "&".join(f"{k}={v}" for k, v in p.items())
    sig = _hmac.new(secret.encode(), query.encode(), hashlib.sha256).hexdigest()

    url = f"{_PAPI}{path}?{query}&signature={sig}"
    req = urllib.request.Request(url, headers={"X-MBX-APIKEY": api_key})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())


def fetch_futures_balance() -> dict:
    """
    Баланс Portfolio Margin рахунку (USDT).
    Повертає: { "total_usdt": float, "available": float, "pnl": float, "ok": bool }
    """
    try:
        data = _papi_signed("/papi/v1/balance")
        usdt = next((x for x in data if x.get("asset") == "USDT"), {})
        total = float(usdt.get("totalWalletBalance") or 0)
        avail = float(usdt.get("crossMarginFree") or 0)
        pnl   = float(usdt.get("umUnrealizedPNL") or 0)

        return {
            "total_usdt": round(total, 4),
            "available":  round(avail, 4),
            "pnl":        round(pnl, 4),
            "ok": True,
        }
    except Exception as e:
        return {"total_usdt": 0.0, "available": 0.0, "pnl": 0.0, "ok": False, "error": str(e)}


def fetch_open_positions() -> list[dict]:
    """
    Список відкритих позицій у Portfolio Margin (USDⓈ-M).
    Повертає список: [{ symbol, side, size, entry, mark, pnl, pnl_pct, leverage }, ...]
    """
    try:
        data = _papi_signed("/papi/v1/um/positionRisk")
        result = []
        for pos in data:
            amt = float(pos.get("positionAmt") or 0)
            if amt == 0:
                continue

            entry        = float(pos.get("entryPrice") or 0)
            mark         = float(pos.get("markPrice") or 0)
            pnl          = float(pos.get("unRealizedProfit") or 0)
            leverage     = int(float(pos.get("leverage") or 1))
            notional     = abs(amt) * mark
            margin_used  = notional / leverage if leverage else 0

            pnl_pct = (pnl / margin_used * 100) if margin_used else 0.0
            side    = "long" if amt > 0 else "short"

            result.append({
                "symbol":   pos.get("symbol", ""),
                "side":     side,
                "size":     abs(amt),
                "entry":    round(entry, 8),
                "mark":     round(mark, 8),
                "pnl":      round(pnl, 4),
                "pnl_pct":  round(pnl_pct, 2),
                "leverage": leverage,
                "notional": round(notional, 2),
            })

        result.sort(key=lambda x: x["pnl"], reverse=True)
        return result

    except Exception as e:
        return [{"error": str(e)}]


def fetch_account_summary() -> dict:
    """
    Зведення аккаунту: баланс + відкриті позиції.
    Використовується для /status і Telegram-алертів.
    """
    balance   = fetch_futures_balance()
    positions = fetch_open_positions()

    total_pnl = sum(p.get("pnl", 0) for p in positions if "error" not in p)
    has_error = not balance["ok"] or (
        len(positions) == 1 and "error" in positions[0]
    )

    return {
        "balance":        balance,
        "positions":      positions,
        "total_open_pnl": round(total_pnl, 4),
        "positions_count": len([p for p in positions if "error" not in p]),
        "auth_ok":        not has_error,
    }


def check_auth() -> tuple[bool, str]:
    """
    Перевіряє чи HMAC-автентифікація до Portfolio Margin API працює.
    Повертає (ok: bool, message: str).
    """
    if not cfg.binance_api_key:
        return False, "BINANCE_API_KEY не вказано в .env"
    if not cfg.binance_secret:
        return False, "BINANCE_SECRET_KEY не вказано в .env"

    try:
        result = fetch_futures_balance()
        if result["ok"]:
            return True, f"✅ Portfolio Margin OK | Баланс: ${result['total_usdt']} USDT"
        return False, f"❌ API помилка: {result.get('error', 'невідомо')}"
    except Exception as e:
        return False, f"❌ {e}"

