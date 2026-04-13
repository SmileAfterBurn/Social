"""JESSIE 3.0 — Configuration & environment."""
from __future__ import annotations

import os
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional


def _load_env(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())


# Шукаємо .env у поточному, батьківському або корені проєкту
_here = Path(__file__).parent
for _candidate in (_here / ".env", _here.parent / ".env", _here.parent.parent / ".env"):
    if _candidate.exists():
        _load_env(_candidate)
        break


@dataclass
class Config:
    # Binance
    binance_api_key: str = field(default_factory=lambda: os.environ.get("BINANCE_API_KEY", ""))
    binance_secret: str = field(default_factory=lambda: os.environ.get("BINANCE_SECRET_KEY", ""))

    # API ключі
    cmc_key: str = field(default_factory=lambda: os.environ.get("CMC_KEY", ""))
    cryptopanic_key: str = field(default_factory=lambda: os.environ.get("CRYPTOPANIC_KEY", ""))
    google_api_key: str = field(default_factory=lambda: os.environ.get("GOOGLE_API_KEY", ""))
    hf_token: str = field(default_factory=lambda: os.environ.get("HF_TOKEN", ""))
    telegram_token: str = field(default_factory=lambda: os.environ.get("TELEGRAM_TOKEN", ""))
    telegram_chat_id: str = field(default_factory=lambda: os.environ.get("TELEGRAM_CHAT_ID", ""))

    # Massive.com REST API (market data: stocks, crypto, forex, indices)
    massive_api_key: str = field(default_factory=lambda: os.environ.get("MASSIVE_API_KEY", ""))

    # Рахунок
    balance: float = field(default_factory=lambda: float(os.environ.get("BALANCE", "20.0")))
    leverage: int = field(default_factory=lambda: int(os.environ.get("LEVERAGE", "10")))
    max_daily_loss_pct: float = field(
        default_factory=lambda: float(os.environ.get("MAX_DAILY_LOSS_PCT", "30"))
    )
    max_coin_price: float = field(
        default_factory=lambda: float(os.environ.get("MAX_COIN_PRICE", "1.0"))
    )
    min_volatility_pct: float = field(
        default_factory=lambda: float(os.environ.get("MIN_VOLATILITY_PCT", "1.5"))
    )

    # Таймфрейм та індикатори
    timeframe: str = "5m"
    rsi_period: int = 14
    volume_look: int = 10
    strong_min: int = 55           # ★ "strong" — впевнено торгуємо
    partial_min: int = 42          # ★ v3.2: калібровано під новий скоринг (2 стратегії + RSI moderate = ~30+)
    min_strategies: int = 2        # ★ v3.2: 2 з 6 стратегій повинні підтвердити

    # ── Параметри торгової стратегії (SHORT-TERM: зайшов → вийшов) ────────────
    signal_atr_sl_mult: float = 0.75  # v3.4: SL = ATR × 0.75 — тісний для скальпінгу
    signal_tp_target:   str   = "tp1" # ★ v3.2: "tp1"=ATR×2 — швидкий забір прибутку
    signal_cooldown:    int   = 3     # свічок паузи після SL-удару
    signal_trend_ema:   int   = 200   # EMA-період для визначення тренду

    # Захист
    black_swan_pct: float = 3.0
    liquidation_warn_pct: float = 8.0
    wall_multiplier: float = 5.0
    wall_min_usdt: float = 30_000
    spoof_dist_pct: float = 2.0

    # Файли даних
    journal_file: Path = field(default_factory=lambda: Path.home() / ".jesse_journal.json")
    tdr_file: Path = field(default_factory=lambda: Path.home() / ".jesse_tdr.jsonl")
    daily_loss_file: Path = field(
        default_factory=lambda: Path.home() / ".jesse_daily_loss.json"
    )
    whale_cache_file: Path = field(
        default_factory=lambda: Path.home() / ".jesse_whale_cache.json"
    )
    news_cache_file: Path = field(
        default_factory=lambda: Path.home() / ".jesse_news_cache.json"
    )

    # CMC
    cmc_gainers_limit: int = 15
    cmc_new_listing_days: int = 14

    # ── Binance Ed25519 PEM auth ─────────────────────────────────────────────
    # Шлях до ПРИВАТНОГО ключа (для підпису API-запитів)
    # Публічний ключ реєструється в Binance → API Management
    # Приватний ключ зберігається тільки локально (НЕ комітити!)
    binance_private_key_path: str = field(
        default_factory=lambda: os.environ.get("BINANCE_PRIVATE_KEY_PATH", "")
    )
    # Шлях до публічного ключа (опціонально, тільки для довідки)
    binance_public_key_path: str = field(
        default_factory=lambda: os.environ.get("BINANCE_PUBLIC_KEY_PATH", "")
    )

    # ── Голос (Voice I/O) ────────────────────────────────────────────────────
    # VOICE_ENABLED=true у .env щоб увімкнути
    voice_enabled: bool = field(
        default_factory=lambda: os.environ.get("VOICE_ENABLED", "false").lower() == "true"
    )
    # Модель Whisper: tiny | base | small (tiny — швидко, base — точніше)
    whisper_model: str = field(
        default_factory=lambda: os.environ.get("WHISPER_MODEL", "tiny")
    )
    # Голос TTS: uk-UA-PolinaNeural (українська) або en-US-AriaNeural
    tts_voice: str = field(
        default_factory=lambda: os.environ.get("TTS_VOICE", "uk-UA-PolinaNeural")
    )

    # ── Пам'ять (Memory) ─────────────────────────────────────────────────────
    # Кількість повідомлень у short-term пам'яті per chat_id
    memory_size: int = field(
        default_factory=lambda: int(os.environ.get("MEMORY_SIZE", "20"))
    )
    memory_file: Path = field(
        default_factory=lambda: Path.home() / ".jesse_memory.json"
    )

    # ── Навчання / датасет ───────────────────────────────────────────────────
    # Шлях до dump/outline/ — порожньо якщо відсутній
    dump_path: str = field(
        default_factory=lambda: os.environ.get("DUMP_PATH", "")
    )
    # Мінімальний PnL для автоматичного додавання в few-shot (feedback loop)
    feedback_min_pnl: float = field(
        default_factory=lambda: float(os.environ.get("FEEDBACK_MIN_PNL", "5.0"))
    )
    # Максимум few-shot прикладів у файлі
    few_shots_max: int = field(
        default_factory=lambda: int(os.environ.get("FEW_SHOTS_MAX", "1000"))
    )


# Глобальний синглтон
cfg = Config()

# ── Primary symbol ───────────────────────────────────────────────────────────
# Найкращий за бектестом (7д WR 54.8%, 14д WR 43.3%, 30д PF 1.15)
PRIMARY_SYMBOL = "DOGE/USDT"

# ── Short Watchlist: топ-ліквідні для швидкого скану ─────────────────────────
# Критерій: 24h volume > 100M USDT, ціна ≤ $1
SHORT_WATCHLIST: list[str] = [
    "DOGE/USDT",      # ~500M vol, мем-кінг
    "1000PEPE/USDT",  # ~350M vol
    "ADA/USDT",       # ~150M vol, L1
    "ENA/USDT",       # ~170M vol, DeFi
    "SUI/USDT",       # ~150M vol, L1
    "ARB/USDT",       # ~90M vol, L2
]

# Watchlist — ліквідні ф'ючерси до $1, обʼєм >1M USDT ────────────────────────
WATCHLIST: list[str] = [
    # ── Tier 1: vol > 100M USDT ─────────────────────────────────────────────
    "DOGE/USDT",      "1000PEPE/USDT",  "ADA/USDT",       "SUI/USDT",
    "ENA/USDT",       "ARB/USDT",       "WLD/USDT",       "ENJ/USDT",

    # ── Tier 2: vol 50-100M USDT ────────────────────────────────────────────
    "FTM/USDT",       "FIL/USDT",       "FARTCOIN/USDT",  "LINA/USDT",
    "SXP/USDT",       "LEVER/USDT",

    # ── Tier 3: vol 10-50M USDT, стабільні пари ─────────────────────────────
    "DENT/USDT",      "GALA/USDT",      "CHZ/USDT",       "HOT/USDT",
    "1000FLOKI/USDT", "1000SHIB/USDT",  "1000BONK/USDT",  "JASMY/USDT",
    "GRT/USDT",       "SAND/USDT",      "MANA/USDT",      "ALGO/USDT",
    "HBAR/USDT",      "VET/USDT",       "XLM/USDT",       "TRX/USDT",
    "ROSE/USDT",      "ONE/USDT",       "CKB/USDT",       "ANKR/USDT",
]

# CoinGecko ID для кожного базового символу
COINGECKO_IDS: dict[str, str] = {
    "DOGE": "dogecoin", "TRX": "tron", "XRP": "ripple", "ADA": "cardano",
    "SOL": "solana", "DOT": "polkadot", "LINK": "chainlink", "LTC": "litecoin",
    "VET": "vechain", "XLM": "stellar", "ALGO": "algorand",
    "HBAR": "hedera-hashgraph", "SAND": "the-sandbox", "MANA": "decentraland",
    "GALA": "gala", "CHZ": "chiliz", "HOT": "holo", "ENJ": "enjincoin",
    "1000PEPE": "pepe", "PEPE": "pepe", "1000FLOKI": "floki", "FLOKI": "floki",
    "BOME": "book-of-meme", "ACT": "act-i-the-ai-prophecy",
    "1000NEIRO": "neiro-ethereum", "1000SATS": "1000sats-ordinals",
    "ZIL": "zilliqa", "CKB": "nervos-network", "COTI": "coti",
    "ARPA": "arpa-chain", "LINA": "linear", "STMX": "stormx",
    "TLM": "alien-worlds", "SLP": "smooth-love-potion", "REEF": "reef",
    "BAT": "basic-attention-token", "SFP": "safepal",
}
