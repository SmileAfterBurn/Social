"""JESSIE 3.0 — Massive.com market data provider.

REST API integration for stocks, crypto, forex, indices.
Docs: https://massive.com/docs/rest/quickstart

Authentication: Bearer token or ?apiKey= query param.
Base URL: https://api.massive.com/v3
"""
from __future__ import annotations

import json
import logging
import time
import urllib.request
from datetime import date, timedelta
from typing import Optional

from .config import cfg

log = logging.getLogger(__name__)

_BASE = "https://api.massive.com/v3"

# ── Rate-limit & caching ─────────────────────────────────────────────────────

_cache: dict[str, tuple[float, object]] = {}
_CACHE_TTL = 60  # seconds


def _cache_key(url: str) -> str:
    return url


def _get_cached(url: str) -> Optional[object]:
    entry = _cache.get(_cache_key(url))
    if entry and time.time() - entry[0] < _CACHE_TTL:
        return entry[1]
    return None


def _set_cache(url: str, data: object) -> None:
    _cache[_cache_key(url)] = (time.time(), data)


# ── HTTP client ──────────────────────────────────────────────────────────────

def _request(endpoint: str, params: Optional[dict] = None, timeout: int = 10) -> Optional[dict | list]:
    """Make authenticated GET to Massive REST API."""
    api_key = cfg.massive_api_key
    if not api_key:
        log.warning("MASSIVE_API_KEY not set — skipping Massive request")
        return None

    # Build URL with query params
    url = f"{_BASE}{endpoint}"
    if params:
        qs = "&".join(f"{k}={v}" for k, v in params.items() if v is not None)
        url = f"{url}?{qs}" if qs else url

    # Check cache
    cached = _get_cached(url)
    if cached is not None:
        return cached

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "User-Agent": "Jesse3/1.0",
    }

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read())
            _set_cache(url, data)
            return data
    except urllib.error.HTTPError as e:
        log.error("Massive API HTTP %d: %s — %s", e.code, endpoint, e.reason)
        return None
    except (urllib.error.URLError, OSError, json.JSONDecodeError) as e:
        log.error("Massive API error: %s — %s", endpoint, e)
        return None


# ── Crypto endpoints ─────────────────────────────────────────────────────────

def fetch_crypto_snapshot(ticker: str) -> Optional[dict]:
    """Single crypto ticker snapshot.

    ticker: e.g. "X:BTCUSD", "X:DOGEUSD"
    Returns: {ticker, todaysChange, todaysChangePerc, updated, min, day, prevDay, ...}
    """
    return _request(f"/snapshot/locale/global/markets/crypto/tickers/{ticker}")


def fetch_crypto_aggregates(
    ticker: str,
    multiplier: int = 1,
    timespan: str = "day",
    from_date: str = "",
    to_date: str = "",
    limit: int = 120,
) -> Optional[list[dict]]:
    """Crypto OHLCV bars.

    ticker: "X:BTCUSD"
    timespan: minute, hour, day, week, month
    from_date/to_date: YYYY-MM-DD
    Returns list of {o, h, l, c, v, t, vw, n}
    """
    params = {"adjusted": "true", "sort": "desc", "limit": str(limit)}
    if from_date:
        params["from"] = from_date
    if to_date:
        params["to"] = to_date

    data = _request(
        f"/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from_date or (date.today() - timedelta(days=180)).isoformat()}/{to_date or date.today().isoformat()}",
        params,
    )
    if data and isinstance(data, dict) and "results" in data:
        return data["results"]
    return None


def fetch_crypto_trades(ticker: str, limit: int = 50) -> Optional[list[dict]]:
    """Recent crypto trades."""
    data = _request(f"/trades/{ticker}", {"limit": str(limit), "sort": "timestamp", "order": "desc"})
    if data and isinstance(data, dict) and "results" in data:
        return data["results"]
    return None


# ── Stocks endpoints ─────────────────────────────────────────────────────────

def fetch_stock_snapshot(ticker: str) -> Optional[dict]:
    """Single stock ticker snapshot. ticker: e.g. "AAPL" """
    data = _request(f"/snapshot/locale/us/markets/stocks/tickers/{ticker}")
    if data and isinstance(data, dict) and "ticker" in data:
        return data["ticker"]
    return data


def fetch_stock_aggregates(
    ticker: str,
    multiplier: int = 1,
    timespan: str = "day",
    from_date: str = "",
    to_date: str = "",
    limit: int = 120,
) -> Optional[list[dict]]:
    """Stock OHLCV bars."""
    params = {"adjusted": "true", "sort": "desc", "limit": str(limit)}
    data = _request(
        f"/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from_date or (date.today() - timedelta(days=180)).isoformat()}/{to_date or date.today().isoformat()}",
        params,
    )
    if data and isinstance(data, dict) and "results" in data:
        return data["results"]
    return None


def fetch_stock_news(ticker: str = "", limit: int = 10) -> Optional[list[dict]]:
    """Market news, optionally filtered by ticker."""
    params: dict = {"limit": str(limit), "order": "desc", "sort": "published_utc"}
    if ticker:
        params["ticker"] = ticker
    data = _request("/reference/news", params)
    if data and isinstance(data, dict) and "results" in data:
        return data["results"]
    return None


# ── Technical indicators ─────────────────────────────────────────────────────

def fetch_sma(
    ticker: str, timespan: str = "day", window: int = 50, limit: int = 1
) -> Optional[float]:
    """Simple Moving Average from Massive API."""
    data = _request(
        f"/aggs/ticker/{ticker}/range/1/{timespan}/{(date.today() - timedelta(days=180)).isoformat()}/{date.today().isoformat()}/sma",
        {"window": str(window), "limit": str(limit), "series_type": "close"},
    )
    if data and isinstance(data, dict) and "results" in data and "values" in data["results"]:
        vals = data["results"]["values"]
        return vals[0]["value"] if vals else None
    return None


def fetch_ema(
    ticker: str, timespan: str = "day", window: int = 50, limit: int = 1
) -> Optional[float]:
    """Exponential Moving Average from Massive API."""
    data = _request(
        f"/aggs/ticker/{ticker}/range/1/{timespan}/{(date.today() - timedelta(days=180)).isoformat()}/{date.today().isoformat()}/ema",
        {"window": str(window), "limit": str(limit), "series_type": "close"},
    )
    if data and isinstance(data, dict) and "results" in data and "values" in data["results"]:
        vals = data["results"]["values"]
        return vals[0]["value"] if vals else None
    return None


def fetch_rsi(
    ticker: str, timespan: str = "day", window: int = 14, limit: int = 1
) -> Optional[float]:
    """RSI from Massive API."""
    data = _request(
        f"/aggs/ticker/{ticker}/range/1/{timespan}/{(date.today() - timedelta(days=180)).isoformat()}/{date.today().isoformat()}/rsi",
        {"window": str(window), "limit": str(limit), "series_type": "close"},
    )
    if data and isinstance(data, dict) and "results" in data and "values" in data["results"]:
        vals = data["results"]["values"]
        return vals[0]["value"] if vals else None
    return None


def fetch_macd(
    ticker: str,
    timespan: str = "day",
    short_window: int = 12,
    long_window: int = 26,
    signal_window: int = 9,
    limit: int = 1,
) -> Optional[dict[str, float]]:
    """MACD from Massive API. Returns {value, signal, histogram}."""
    data = _request(
        f"/aggs/ticker/{ticker}/range/1/{timespan}/{(date.today() - timedelta(days=180)).isoformat()}/{date.today().isoformat()}/macd",
        {
            "short_window": str(short_window),
            "long_window": str(long_window),
            "signal_window": str(signal_window),
            "limit": str(limit),
            "series_type": "close",
        },
    )
    if data and isinstance(data, dict) and "results" in data and "values" in data["results"]:
        vals = data["results"]["values"]
        if vals:
            v = vals[0]
            return {
                "value": v.get("value", 0),
                "signal": v.get("signal", 0),
                "histogram": v.get("histogram", 0),
            }
    return None


# ── Forex endpoints ──────────────────────────────────────────────────────────

def fetch_forex_snapshot(ticker: str) -> Optional[dict]:
    """Forex pair snapshot. ticker: e.g. "C:EURUSD" """
    return _request(f"/snapshot/locale/global/markets/forex/tickers/{ticker}")


def fetch_forex_conversion(from_curr: str, to_curr: str, amount: float = 1.0) -> Optional[dict]:
    """Currency conversion."""
    data = _request(f"/conversion/{from_curr}/{to_curr}", {"amount": str(amount)})
    return data


# ── Dividends / fundamentals ─────────────────────────────────────────────────

def fetch_dividends(ticker: str = "", limit: int = 20) -> Optional[list[dict]]:
    """Stock dividends."""
    params: dict = {"limit": str(limit), "order": "desc", "sort": "ex_dividend_date"}
    if ticker:
        params["ticker"] = ticker
    data = _request("/reference/dividends", params)
    if data and isinstance(data, dict) and "results" in data:
        return data["results"]
    return None


# ── Market status ────────────────────────────────────────────────────────────

def fetch_market_status() -> Optional[dict]:
    """Current market status (open/closed for each exchange)."""
    return _request("/marketstatus/now")


# ── All tickers search ───────────────────────────────────────────────────────

def search_tickers(
    query: str = "",
    market: str = "crypto",
    active: bool = True,
    limit: int = 20,
) -> Optional[list[dict]]:
    """Search tickers across markets."""
    params: dict = {
        "market": market,
        "active": "true" if active else "false",
        "limit": str(limit),
        "order": "asc",
        "sort": "ticker",
    }
    if query:
        params["search"] = query
    data = _request("/reference/tickers", params)
    if data and isinstance(data, dict) and "results" in data:
        return data["results"]
    return None


# ── Top movers ───────────────────────────────────────────────────────────────

def fetch_top_movers(direction: str = "gainers") -> Optional[list[dict]]:
    """Top market movers: gainers or losers.

    direction: "gainers" or "losers"
    """
    data = _request(f"/snapshot/locale/us/markets/stocks/{direction}")
    if data and isinstance(data, dict) and "tickers" in data:
        return data["tickers"]
    return None


# ── Helper: convert JESSIE symbol to Massive ticker ──────────────────────────

def jessie_to_massive_ticker(symbol: str, market: str = "crypto") -> str:
    """Convert JESSIE symbol format to Massive ticker format.

    "DOGE/USDT" → "X:DOGEUSD"   (crypto)
    "BTC/USDT"  → "X:BTCUSD"    (crypto)
    "AAPL"      → "AAPL"        (stocks)
    "EUR/USD"   → "C:EURUSD"    (forex)
    """
    if market == "crypto":
        base = symbol.split("/")[0].replace("1000", "")
        return f"X:{base}USD"
    elif market == "forex":
        parts = symbol.split("/")
        return f"C:{''.join(parts)}"
    return symbol


# ── Aggregate helper: enrich JESSIE analysis with Massive data ───────────────

def enrich_analysis(symbol: str) -> dict:
    """Fetch supplementary data from Massive to enrich JESSIE analysis.

    Returns dict with available data (may be partial if API key absent).
    """
    if not cfg.massive_api_key:
        return {"available": False}

    ticker = jessie_to_massive_ticker(symbol)
    result: dict = {"available": True, "ticker": ticker}

    # Snapshot
    snapshot = fetch_crypto_snapshot(ticker)
    if snapshot and isinstance(snapshot, dict):
        t = snapshot.get("ticker", snapshot)
        if isinstance(t, dict):
            result["price"] = t.get("lastTrade", {}).get("p") if isinstance(t.get("lastTrade"), dict) else None
            result["change_pct"] = t.get("todaysChangePerc")
            result["volume"] = t.get("day", {}).get("v") if isinstance(t.get("day"), dict) else None

    # Server-side indicators (saves local computation)
    rsi = fetch_rsi(ticker, timespan="hour", window=14)
    if rsi is not None:
        result["rsi_1h"] = round(rsi, 2)

    ema50 = fetch_ema(ticker, timespan="hour", window=50)
    if ema50 is not None:
        result["ema50_1h"] = round(ema50, 8)

    macd = fetch_macd(ticker, timespan="hour")
    if macd:
        result["macd_1h"] = macd

    # News sentiment
    base = symbol.split("/")[0].replace("1000", "")
    news = fetch_stock_news(f"X:{base}USD", limit=5)
    if news:
        result["news"] = [
            {"title": n.get("title", ""), "published": n.get("published_utc", "")}
            for n in news[:3]
        ]

    return result
