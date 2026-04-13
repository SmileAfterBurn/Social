"""JESSIE 3.0 — FastAPI Backend."""
from __future__ import annotations

import os
import sys
from pathlib import Path

# Allow running directly
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from typing import Optional, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from jesse3.core import (
    cfg, WATCHLIST, scan_watchlist, analyze_symbol,
    fetch_fear_greed, fetch_global, btc_trend, get_exchange,
    fetch_cheap_altcoins,
    Journal, check_drawdown_guard, record_loss, liquidation_proximity,
    brain, get_knowledge_payload, build_ai_knowledge_brief,
)
from jesse3.core.guard import GuardStatus


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup warm-up: preload BTC trend, Fear&Greed, dataset."""
    import asyncio

    async def _bg():
        await asyncio.sleep(0)
        try:
            await asyncio.to_thread(btc_trend)
            await asyncio.to_thread(fetch_fear_greed)
            await asyncio.to_thread(_ensure_dataset)
        except Exception:
            pass

    asyncio.ensure_future(_bg())
    yield


app = FastAPI(
    title="JESSIE 3.0 API",
    description="Adaptive Signal Engine based on Jesse Livermore principles",
    version="3.0.0",
    lifespan=lifespan,
)

# CORS — дозволені домени (localhost для розробки)
_CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:8001,http://localhost:3000,http://localhost:19006").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve web dashboard at root
_WEB_DIR = Path(__file__).parent.parent / "web"
if _WEB_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(_WEB_DIR)), name="static")

# AI Workflow skills path (configurable via SKILLS_DIR env var)
_SKILLS_DIR = Path(os.environ.get(
    "SKILLS_DIR",
    str(Path(__file__).parent.parent.parent / "skills"),
))

# Few-shot dataset — lazy, завантажується при першому виклику /ai/analyze
from jesse3.core.dataset import few_shot_db as _few_shot_db
_dataset_ready = False


def _ensure_dataset():
    global _dataset_ready
    if not _dataset_ready:
        _few_shot_db.load()
        _dataset_ready = True



@app.get("/", include_in_schema=False)
async def root_html():
    index = _WEB_DIR / "index.html"
    if index.exists():
        return FileResponse(str(index))
    return {"status": "JESSIE 3.0 online", "docs": "/docs", "health": "/health"}


@app.get("/dashboard", include_in_schema=False)
async def dashboard_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/")


@app.get("/ui", include_in_schema=False)
async def ui_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/")


# ── Pydantic models ───────────────────────────────────────────────────────────

class SignalOut(BaseModel):
    symbol: str
    direction: str
    score: int
    rsi: float
    volume_ratio: float
    formation: str
    formation_score: int
    strategy_count: int
    strategy_long: int
    strategy_short: int
    price: float
    atr: float
    entry: float
    stop_loss: float
    take_profit1: float
    take_profit2: float
    take_profit3: float
    capital_usd: float
    leverage_rec: int
    position_size: float
    notes: List[str]
    strength: str
    is_tradeable: bool


class TradeIn(BaseModel):
    symbol: str
    price: float
    amount_usd: float
    direction: str = "long"
    leverage: int = 10


class CloseIn(BaseModel):
    symbol: str
    price: float


class AmountIn(BaseModel):
    amount: float


class LossIn(BaseModel):
    amount: float


class OpenCheckIn(BaseModel):
    symbol: str
    entry_price: Optional[float] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _signal_to_out(r) -> SignalOut:
    return SignalOut(
        symbol=r.symbol,
        direction=r.direction,
        score=r.score,
        rsi=r.rsi,
        volume_ratio=r.volume_ratio,
        formation=r.formation,
        formation_score=r.formation_score,
        strategy_count=r.strategy_count,
        strategy_long=r.strategy_long,
        strategy_short=r.strategy_short,
        price=r.price,
        atr=r.atr,
        entry=r.entry,
        stop_loss=r.stop_loss,
        take_profit1=r.take_profit1,
        take_profit2=r.take_profit2,
        take_profit3=r.take_profit3,
        capital_usd=r.capital_usd,
        leverage_rec=r.leverage_rec,
        position_size=r.position_size,
        notes=r.notes,
        strength=r.strength,
        is_tradeable=r.is_tradeable,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "JESSIE 3.0 online", "docs": "/docs", "version": "3.0.0"}


@app.get("/status")
def status():
    guard = check_drawdown_guard(cfg.daily_loss_file, cfg.balance, cfg.max_daily_loss_pct)
    btc = btc_trend()
    fg = fetch_fear_greed()
    gl = fetch_global()
    return {
        "guard": {
            "blocked": guard.blocked,
            "daily_loss": guard.daily_loss,
            "limit": guard.limit,
            "remaining": guard.remaining,
            "pct_used": guard.pct_used,
        },
        "btc": btc,
        "fear_greed": fg,
        "global": gl,
        "balance": cfg.balance,
    }


@app.get("/scan", response_model=List[SignalOut])
def scan():
    guard = check_drawdown_guard(cfg.daily_loss_file, cfg.balance, cfg.max_daily_loss_pct)
    if guard.blocked:
        raise HTTPException(403, "Торгівля заблокована — денний ліміт збитку досягнуто")
    results = scan_watchlist()
    return [_signal_to_out(r) for r in results]


@app.get("/scan/altcoins", response_model=List[SignalOut])
def scan_altcoins(max_price: float = 1.0, min_volume_usd: float = 1_000_000, limit: int = 60):
    """
    Динамічний скан: знаходить ВСІ Binance USDT-ф'ючерси дешевше max_price
    з достатнім об'ємом та скануює їх на сигнали.
    """
    import asyncio
    guard = check_drawdown_guard(cfg.daily_loss_file, cfg.balance, cfg.max_daily_loss_pct)
    if guard.blocked:
        raise HTTPException(403, "Торгівля заблокована — денний ліміт збитку досягнуто")

    symbols = fetch_cheap_altcoins(max_price=max_price, min_volume_usd=min_volume_usd, limit=limit)
    if not symbols:
        raise HTTPException(503, "Не вдалося отримати список монет з Binance")

    results = scan_watchlist(symbols)
    return [_signal_to_out(r) for r in results]


@app.get("/scan/{symbols}", response_model=List[SignalOut])
def scan_symbols(symbols: str):
    sym_list = []
    for s in symbols.split(","):
        s = s.strip().upper()
        if "/" not in s:
            s = s.replace("USDT", "") + "/USDT" if s.endswith("USDT") else s + "/USDT"
        sym_list.append(s)
    results = scan_watchlist(sym_list)
    return [_signal_to_out(r) for r in results]


@app.get("/open/{symbol}", response_model=SignalOut)
def check_open(symbol: str, entry: Optional[float] = None):
    sym = symbol.upper()
    if "/" not in sym:
        sym = sym.replace("USDT", "") + "/USDT" if sym.endswith("USDT") else sym + "/USDT"

    result = analyze_symbol(sym)
    if result is None:
        raise HTTPException(404, f"Не вдалося отримати дані для {sym}")

    out = _signal_to_out(result)
    if entry:
        prox = liquidation_proximity(entry, result.price, result.direction, cfg.leverage)
        # Add proximity note
        note = f"До ліквідації {prox['pct_to_liq']:.1f}% (ліквідація ~{prox['liq_price']:.6f})"
        if prox["danger"]:
            note = "⚠️ " + note
        out.notes.append(note)
    return out


@app.get("/journal")
def journal():
    j = Journal(cfg.journal_file, cfg.balance)
    return {
        "stats": j.stats(),
        "open_trades": j.open_trades(),
        "recent_closed": j.closed_trades()[-10:],
        "gemini_format": j.gemini_format(),
    }


@app.post("/trade/open")
def open_trade(body: TradeIn):
    j = Journal(cfg.journal_file, cfg.balance)
    trade = j.open_trade(body.symbol, body.price, body.amount_usd, body.direction, body.leverage)
    return {"ok": True, "trade": trade}


@app.post("/trade/close")
def close_trade(body: CloseIn):
    j = Journal(cfg.journal_file, cfg.balance)
    trade = j.close_trade(body.symbol, body.price)
    if trade is None:
        raise HTTPException(404, f"Відкрита угода {body.symbol} не знайдена")
    return {"ok": True, "trade": trade, "new_balance": j.balance}


@app.post("/deposit")
def deposit(body: AmountIn):
    j = Journal(cfg.journal_file, cfg.balance)
    new_bal = j.deposit(body.amount)
    return {"ok": True, "new_balance": new_bal}


@app.post("/withdraw")
def withdraw(body: AmountIn):
    j = Journal(cfg.journal_file, cfg.balance)
    new_bal = j.withdraw(body.amount)
    return {"ok": True, "new_balance": new_bal}


@app.post("/loss")
def loss(body: LossIn):
    guard = record_loss(cfg.daily_loss_file, body.amount)
    return {
        "ok": True,
        "blocked": guard.blocked,
        "daily_loss": guard.daily_loss,
        "remaining": guard.remaining,
    }


@app.get("/rules")
def rules():
    return get_knowledge_payload()


@app.get("/education")
def education():
    return get_knowledge_payload()


@app.get("/ai/dataset")
async def dataset_stats():
    """Статус few-shot датасету DeepSeek Platinum."""
    stats = _few_shot_db.stats
    return {
        "loaded": stats["loaded"],
        "total_examples": stats["total"],
        "unique_symbols": stats["symbols"],
        "data_file": str(_few_shot_db._DATA_FILE if hasattr(_few_shot_db, '_DATA_FILE') else "jesse3/data/few_shots.json"),
        "hint": "Запусти scripts/prepare_dataset.py щоб завантажити датасет" if not stats["loaded"] else "✅ Датасет готовий",
    }


# ── AI Analysis (HuggingFace / Gemini + ai-workflow skills) ──────────────────

# Lazy-load skill prompts on first AI request
_SKILL_MD: str = ""
_FRAMEWORK_MD: str = ""
_skills_loaded = False


def _load_skills() -> tuple[str, str]:
    global _SKILL_MD, _FRAMEWORK_MD, _skills_loaded
    if _skills_loaded:
        return _SKILL_MD, _FRAMEWORK_MD
    ta_skill = _SKILLS_DIR / "technical-analyst" / "SKILL.md"
    ta_ref = _SKILLS_DIR / "technical-analyst" / "references" / "technical_analysis_framework.md"
    market_env = _SKILLS_DIR / "market-environment-analysis" / "SKILL.md"
    _SKILL_MD = ta_skill.read_text(encoding="utf-8")[:3000] if ta_skill.exists() else ""
    _FRAMEWORK_MD = ta_ref.read_text(encoding="utf-8")[:4000] if ta_ref.exists() else ""
    if market_env.exists():
        _SKILL_MD += "\n\n" + market_env.read_text(encoding="utf-8")[:1500]
    _skills_loaded = True
    return _SKILL_MD, _FRAMEWORK_MD


class AIAnalyzeBody(BaseModel):
    symbol: str = "BTCUSDT"
    question: Optional[str] = None


def _build_prompts(sym_raw, price, rsi, vol, price_chg_1h, high_10, low_10, btc, candles, question):
    # Few-shot приклади з датасету DeepSeek Platinum
    _ensure_dataset()
    skill_md, framework_md = _load_skills()
    knowledge_brief = build_ai_knowledge_brief()
    direction = "long" if rsi < 40 else ("short" if rsi > 60 else None)
    few_shots = _few_shot_db.get_few_shots(sym_raw, direction, n=2)
    few_shots_text = _few_shot_db.format_few_shots(few_shots)

    system = f"""Ти — експертний крипто-трейдер ф'ючерсного ринку Binance (принципи Jesse Livermore).
{skill_md}
Технічні основи:
{framework_md}
{knowledge_brief}
{few_shots_text}
ВІДПОВІДАЙ ТІЛЬКИ УКРАЇНСЬКОЮ. Формат відповіді:
Рядок 1: LONG / SHORT / СТОП — впевненість X%
Рядок 2-3: коротке обґрунтування (RSI, тренд, об'єм)
Entry: X.XXXXXX | SL: X.XXXXXX | TP1: X.XXXXXX | TP2: X.XXXXXX"""

    context = f"""Монета: {sym_raw}
Ціна: {price:.6f} USDT
RSI(14): {rsi:.1f}  |  Об'єм: {vol:.2f}x  |  1h: {price_chg_1h:+.2f}%
Макс 50хв: {high_10:.6f}  |  Мін 50хв: {low_10:.6f}
BTC: {btc['direction'].upper()} ({btc['pct']:+.2f}%){'  ⚡ BLACK SWAN!' if btc.get('black_swan') else ''}
Свічок: {len(candles)} × 5m"""

    user = f"{context}\n\n{'Питання: ' + question if question else 'Дай торгову рекомендацію.'}"
    return system, user


async def _call_hf(system: str, user: str, token: str) -> str:
    """Call HuggingFace Inference API (Gemma 4 31B) через офіційний SDK."""
    import asyncio
    from huggingface_hub import InferenceClient

    def _do():
        client = InferenceClient(provider="novita", api_key=token)
        response = client.chat.completions.create(
            model="google/gemma-4-31B-it",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=512,
            temperature=0.3,
        )
        return response.choices[0].message.content

    return await asyncio.to_thread(_do)


async def _call_ner(text: str, token: str) -> list[dict]:
    """NER — розпізнавання сутностей (імена, організації, монети) через BERT."""
    import asyncio
    from huggingface_hub import InferenceClient

    def _do():
        client = InferenceClient(provider="hf-inference", api_key=token)
        results = client.token_classification(text, model="dslim/bert-base-NER")
        # Групуємо підтокени в цілі сутності
        entities = []
        for r in results:
            ent = {"word": r.word, "entity": r.entity_group, "score": round(r.score, 3)}
            if entities and r.word.startswith("##"):
                entities[-1]["word"] += r.word[2:]
            else:
                entities.append(ent)
        return entities

    return await asyncio.to_thread(_do)


async def _call_gemini(system: str, user: str, api_key: str) -> str:
    import asyncio
    from google import genai
    from google.genai import types
    client = genai.Client(api_key=api_key)
    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.0-flash",
        contents=user,
        config=types.GenerateContentConfig(system_instruction=system),
    )
    return response.text


@app.post("/ai/analyze")
async def ai_analyze(body: AIAnalyzeBody):
    """AI analysis: HuggingFace Gemma 4 31B (primary) or Gemini (fallback)."""
    import asyncio
    from jesse3.core import fetch_ohlcv, calc_rsi, volume_ratio

    hf_token = cfg.hf_token or os.environ.get("HF_TOKEN", "")
    gemini_key = cfg.google_api_key or os.environ.get("GOOGLE_API_KEY", "")
    if not hf_token and not gemini_key:
        raise HTTPException(400, "Потрібен HF_TOKEN або GOOGLE_API_KEY у .env")

    sym_raw = body.symbol.upper().replace("/", "")
    sym_ccxt = sym_raw.replace("USDT", "") + "/USDT"

    try:
        candles = await asyncio.to_thread(fetch_ohlcv, sym_ccxt, "5m", 60)
        if len(candles) < 20:
            raise HTTPException(404, f"Недостатньо даних для {sym_raw}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Помилка отримання даних: {e}")

    closes  = [c["close"]  for c in candles]
    volumes = [c["volume"] for c in candles]
    highs   = [c["high"]   for c in candles]
    lows    = [c["low"]    for c in candles]
    price   = closes[-1]
    rsi     = calc_rsi(closes)
    vol     = volume_ratio(volumes[-11:])
    high_10 = max(highs[-10:])
    low_10  = min(lows[-10:])
    price_chg_1h = round((closes[-1] - closes[-12]) / closes[-12] * 100, 2) if len(closes) >= 12 else 0
    btc = await asyncio.to_thread(btc_trend)

    system, user = _build_prompts(sym_raw, price, rsi, vol, price_chg_1h, high_10, low_10, btc, candles, body.question)

    provider = "hf"
    try:
        if hf_token:
            text = await _call_hf(system, user, hf_token)
        else:
            text = await _call_gemini(system, user, gemini_key)
            provider = "gemini"
    except Exception as e:
        if gemini_key and hf_token:
            try:
                text = await _call_gemini(system, user, gemini_key)
                provider = "gemini-fallback"
            except Exception as e2:
                raise HTTPException(500, f"HF: {e} | Gemini: {e2}")
        else:
            raise HTTPException(500, f"Помилка AI: {e}")

    return {
        "ok": True,
        "symbol": sym_raw,
        "price": price,
        "rsi": rsi,
        "vol_ratio": vol,
        "btc_dir": btc["direction"],
        "provider": provider,
        "analysis": text,
    }




# ── Chat endpoint ─────────────────────────────────────────────────────────────

class ChatIn(BaseModel):
    message: str
    history: Optional[List[dict]] = None  # [{role, content}, ...]


@app.post("/chat")
async def chat(body: ChatIn):
    """
    Conversational assistant. Handles commands + free AI questions.
    Returns {type, text, action?, data?}.
    """
    import asyncio
    msg = body.message.strip().lower()

    # ── command shortcuts ────────────────────────────────────────────────────
    REFRESH_KEYS = ["онови", "оновити", "update", "reload", "refresh", "перезавантаж"]
    STATUS_KEYS  = ["статус", "status", "стан", "як справи", "що зараз"]
    PLAN_KEYS    = ["план", "за планом", "все гаразд", "все ок", "прогрес"]
    SCAN_KEYS    = ["скан", "сигнали", "scan", "signals", "що купити", "що торгувати"]
    JOURNAL_KEYS = ["журнал", "journal", "угоди", "trades", "баланс", "balance", "pnl"]
    RULES_KEYS   = ["правила", "rules", "заповіді", "принципи"]
    HELP_KEYS    = ["допомога", "help", "що ти вмієш", "команди"]

    if any(k in msg for k in REFRESH_KEYS):
        return {"type": "action", "action": "refresh", "text": "🔄 Оновлюю дані..."}

    if any(k in msg for k in RULES_KEYS):
        return {"type": "action", "action": "tab_rules", "text": "📜 Відкриваю правила Livermore..."}

    if any(k in msg for k in SCAN_KEYS):
        return {"type": "action", "action": "tab_scan", "text": "📡 Відкриваю сигнали..."}

    if any(k in msg for k in JOURNAL_KEYS):
        return {"type": "action", "action": "tab_journal", "text": "📒 Відкриваю журнал..."}

    if any(k in msg for k in HELP_KEYS):
        return {
            "type": "text",
            "text": (
                "💬 Я можу:\n"
                "• **онови дані** — перезавантажити статус і сигнали\n"
                "• **статус** — поточний стан ринку\n"
                "• **все за планом?** — зведення по журналу\n"
                "• **скан / сигнали** — відкрити вкладку сигналів\n"
                "• **журнал / баланс** — відкрити журнал угод\n"
                "• **правила** — заповіді Livermore\n"
                "• **BTCUSDT аналіз** — AI-аналіз будь-якої монети\n"
                "• Будь-яке вільне питання про ринок → AI відповідь"
            ),
        }

    if any(k in msg for k in STATUS_KEYS) or any(k in msg for k in PLAN_KEYS):
        try:
            guard = check_drawdown_guard(cfg.daily_loss_file, cfg.balance, cfg.max_daily_loss_pct)
            btc   = await asyncio.to_thread(btc_trend)
            fg    = await asyncio.to_thread(fetch_fear_greed)
            j     = Journal(cfg.journal_file, cfg.balance)
            stats = j.stats()

            plan_ok = not guard.blocked and stats["total_trades"] >= 0
            icon = "✅" if plan_ok else "⚠️"
            btc_icon = "🟢" if btc["direction"] == "up" else ("🔴" if btc["direction"] == "down" else "⬜")

            text = (
                f"{icon} **Поточний стан JESSIE 3.0**\n\n"
                f"💰 Баланс: **${stats['balance']:.2f}**  |  PnL: {'+' if stats['total_pnl'] >= 0 else ''}${stats['total_pnl']:.2f}\n"
                f"📊 Угод: {stats['total_trades']}  |  Win Rate: {stats['win_rate']}%\n"
                f"{btc_icon} BTC: {btc['direction'].upper()} ({btc['pct']:+.2f}%)\n"
                f"😱 Fear & Greed: {fg.get('value', '?')} — {fg.get('label', '')}\n"
                f"🛡️ Денний захист: {'🔴 ЗАБЛОКОВАНО' if guard.blocked else f'✅ залишок ${guard.remaining:.2f}'}"
            )
            return {"type": "text", "text": text, "action": "refresh"}
        except Exception as e:
            return {"type": "text", "text": f"⚠️ Не вдалося отримати стан: {e}"}

    # ── AI fallback — free question or symbol analysis ────────────────────────
    hf_token   = cfg.hf_token or os.environ.get("HF_TOKEN", "")
    gemini_key = cfg.google_api_key or os.environ.get("GOOGLE_API_KEY", "")
    if not hf_token and not gemini_key:
        return {"type": "text", "text": "❌ Для AI-відповідей потрібен HF_TOKEN або GOOGLE_API_KEY у .env"}

    # Build context from history
    history_text = ""
    if body.history:
        for h in body.history[-4:]:  # last 4 turns
            role = "Користувач" if h.get("role") == "user" else "JESSIE"
            history_text += f"{role}: {h.get('content', '')}\n"

    skill_md, framework_md = _load_skills()
    brain_ctx = brain.format_working_memory(6)
    system = (
        f"Ти — JESSIE 3.0, торговий асистент (принципи Jesse Livermore, Binance Futures).\n"
        f"{skill_md[:1500]}\n"
        f"{brain_ctx}\n"
        "Відповідай стисло, українською. Якщо питання про монету — давай Entry/SL/TP."
    )
    user_msg = f"{history_text}Користувач: {body.message}" if history_text else body.message

    try:
        if hf_token:
            text = await _call_hf(system, user_msg, hf_token)
            provider = "hf"
        else:
            text = await _call_gemini(system, user_msg, gemini_key)
            provider = "gemini"
    except Exception as e:
        if gemini_key and hf_token:
            try:
                text = await _call_gemini(system, user_msg, gemini_key)
                provider = "gemini-fallback"
            except Exception as e2:
                return {"type": "text", "text": f"❌ AI недоступний: {e} | {e2}"}
        else:
            return {"type": "text", "text": f"❌ AI помилка: {e}"}

    # Додаємо повідомлення в пам'ять brain
    brain.observe(f"Запит: {body.message[:120]}", confidence=0.9)

    return {"type": "text", "text": text, "provider": provider}


# ── Brain endpoints ───────────────────────────────────────────────────────────

@app.get("/brain/status")
async def brain_status():
    """Стан мозку JESSIE — уроки, статистика, думки."""
    return brain.summary()


class BrainObserveBody(BaseModel):
    content: str
    confidence: float = 1.0
    kind: str = "observation"  # observation | hypothesis | warning | decision


@app.post("/brain/observe")
async def brain_observe(body: BrainObserveBody):
    """Додати спостереження до робочої пам'яті мозку."""
    if body.kind == "warning":
        brain.warn(body.content)
    elif body.kind == "hypothesis":
        brain.hypothesize(body.content, body.confidence)
    elif body.kind == "decision":
        brain.decide(body.content, body.confidence)
    else:
        brain.observe(body.content, body.confidence)
    return {"ok": True, "working_thoughts": len(brain.working_memory)}


class BrainReasonBody(BaseModel):
    question: str
    symbol: Optional[str] = None
    direction: Optional[str] = None
    rsi: Optional[float] = None
    vol_ratio: Optional[float] = None
    btc_direction: Optional[str] = None


@app.post("/brain/reason")
async def brain_reason(body: BrainReasonBody):
    """Запустити багатокрокове міркування JESSIE перед рішенням."""
    ctx = {}
    if body.symbol:        ctx["symbol"]       = body.symbol
    if body.direction:     ctx["direction"]     = body.direction
    if body.rsi:           ctx["rsi"]           = body.rsi
    if body.vol_ratio:     ctx["vol_ratio"]     = body.vol_ratio
    if body.btc_direction: ctx["btc_direction"] = body.btc_direction
    thoughts = brain.reason(body.question, ctx)
    return {"ok": True, "thoughts": thoughts}


class BrainLearnBody(BaseModel):
    symbol: str
    direction: str         # "long" | "short"
    pnl_pct: float
    entry_reason: str = ""
    rsi: Optional[float] = None
    vol_ratio: Optional[float] = None
    btc_direction: Optional[str] = None


@app.post("/brain/learn")
async def brain_learn(body: BrainLearnBody):
    """Навчити мозок на результаті угоди (самонавчання)."""
    ctx = {}
    if body.rsi:           ctx["rsi"]           = body.rsi
    if body.vol_ratio:     ctx["vol_ratio"]     = body.vol_ratio
    if body.btc_direction: ctx["btc_direction"] = body.btc_direction
    lesson = brain.learn_from_trade(
        symbol       = body.symbol,
        direction    = body.direction,
        pnl_pct      = body.pnl_pct,
        entry_reason = body.entry_reason,
        context      = ctx,
    )
    return {"ok": True, "lesson": lesson, "summary": brain.summary()}


@app.get("/brain/thoughts")
async def brain_thoughts():
    """Поточна робоча пам'ять (думки в RAM)."""
    return {
        "thoughts": [t.to_dict() for t in brain.working_memory],
        "count":    len(brain.working_memory),
    }


# ── Spam filter (fastc) ───────────────────────────────────────────────────────

_fastc_model = None
_fastc_ready = False


def _get_fastc():
    global _fastc_model, _fastc_ready
    if _fastc_ready:
        return _fastc_model
    try:
        from fastc import Fastc
        _fastc_model = Fastc("braindao/iq-agents-spam-2501.6")
        _fastc_ready = True
    except Exception as e:
        print(f"[fastc] ⚠️ Не вдалося завантажити: {e}")
        _fastc_ready = True  # не повторюємо
    return _fastc_model


class SpamCheckBody(BaseModel):
    text: str


@app.post("/spam/check")
async def spam_check(body: SpamCheckBody):
    """Перевірити текст на спам через fastc (braindao/iq-agents-spam-2501.6)."""
    import asyncio
    model = await asyncio.to_thread(_get_fastc)
    if model is None:
        raise HTTPException(503, "fastc модель недоступна")
    result = await asyncio.to_thread(model.predict_one, body.text)
    label  = result.get("label", "unknown")
    score  = result.get("score", 0.0)
    is_spam = label.lower() in ("spam", "1", "true")
    return {
        "text":    body.text[:100],
        "is_spam": is_spam,
        "label":   label,
        "score":   score,
    }


class NERBody(BaseModel):
    text: str


@app.post("/ner")
async def ner_extract(body: NERBody):
    """NER — розпізнавання сутностей у тексті (імена, організації, локації)."""
    hf_token = cfg.hf_token or os.environ.get("HF_TOKEN", "")
    if not hf_token:
        raise HTTPException(400, "Потрібен HF_TOKEN у .env")
    entities = await _call_ner(body.text, hf_token)
    return {"text": body.text[:200], "entities": entities}


# ── Massive.com market data endpoints ────────────────────────────────────────

@app.get("/api/massive/snapshot/{ticker}")
async def massive_snapshot(ticker: str, market: str = "crypto"):
    """Get real-time snapshot for a ticker via Massive.com API."""
    from jesse3.core.massive import fetch_crypto_snapshot, fetch_stock_snapshot, fetch_forex_snapshot
    if not cfg.massive_api_key:
        raise HTTPException(400, "MASSIVE_API_KEY not set")
    if market == "crypto":
        data = fetch_crypto_snapshot(ticker)
    elif market == "forex":
        data = fetch_forex_snapshot(ticker)
    else:
        data = fetch_stock_snapshot(ticker)
    if data is None:
        raise HTTPException(502, f"Failed to fetch snapshot for {ticker}")
    return data


@app.get("/api/massive/indicators/{ticker}")
async def massive_indicators(ticker: str, timespan: str = "hour", window: int = 14):
    """Get technical indicators (RSI, EMA, MACD) from Massive.com API."""
    from jesse3.core.massive import fetch_rsi, fetch_ema, fetch_macd
    if not cfg.massive_api_key:
        raise HTTPException(400, "MASSIVE_API_KEY not set")
    return {
        "ticker": ticker,
        "timespan": timespan,
        "rsi": fetch_rsi(ticker, timespan, window),
        "ema50": fetch_ema(ticker, timespan, 50),
        "ema200": fetch_ema(ticker, timespan, 200),
        "macd": fetch_macd(ticker, timespan),
    }


@app.get("/api/massive/news")
async def massive_news(ticker: str = "", limit: int = 10):
    """Get market news from Massive.com API."""
    from jesse3.core.massive import fetch_stock_news
    if not cfg.massive_api_key:
        raise HTTPException(400, "MASSIVE_API_KEY not set")
    news = fetch_stock_news(ticker, limit)
    if news is None:
        raise HTTPException(502, "Failed to fetch news")
    return {"count": len(news), "results": news}


@app.get("/api/massive/enrich/{symbol}")
async def massive_enrich_endpoint(symbol: str):
    """Enrich JESSIE symbol analysis with Massive.com data."""
    from jesse3.core.massive import enrich_analysis
    if not cfg.massive_api_key:
        raise HTTPException(400, "MASSIVE_API_KEY not set")
    return enrich_analysis(symbol)


@app.get("/api/massive/movers")
async def massive_movers(direction: str = "gainers"):
    """Get top market movers from Massive.com API."""
    from jesse3.core.massive import fetch_top_movers
    if not cfg.massive_api_key:
        raise HTTPException(400, "MASSIVE_API_KEY not set")
    data = fetch_top_movers(direction)
    if data is None:
        raise HTTPException(502, "Failed to fetch movers")
    return {"direction": direction, "count": len(data), "tickers": data}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
