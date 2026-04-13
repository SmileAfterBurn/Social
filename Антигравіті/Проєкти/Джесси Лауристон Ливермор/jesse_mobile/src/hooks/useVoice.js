import { useState, useRef, useCallback } from "react";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export function useVoice({ lang = "uk-UA", onResult, onError } = {}) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const start = useCallback(() => {
    if (isWeb) {
      // Web: використовуємо Web Speech API
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) { onError?.("Браузер не підтримує розпізнавання мови"); return; }

      const rec = new SpeechRec();
      rec.lang = lang;
      rec.continuous = false;
      rec.interimResults = false;
      recRef.current = rec;

      rec.onstart  = () => setListening(true);
      rec.onend    = () => setListening(false);
      rec.onerror  = (e) => { setListening(false); onError?.(e.error); };
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript.trim();
        onResult?.(transcript);
      };

      rec.start();
    } else {
      // Native: expo-speech не має STT, потрібен серверний Whisper
      // Показуємо повідомлення — голосовий ввід працює через backend /speak endpoint
      onError?.("Голосовий ввід на мобільних — через серверний Whisper (в розробці)");
    }
  }, [lang, onResult, onError]);

  const stop = useCallback(() => {
    if (isWeb && recRef.current) {
      recRef.current.stop();
    }
    setListening(false);
  }, []);

  return { listening, start, stop };
}

/**
 * Парсер голосових команд JESSIE
 * Повертає { action, params } або null
 */
export function parseVoiceCommand(text) {
  const t = text.toLowerCase().trim();

  // ── Навігація ──────────────────────────────────────────────
  if (/дашборд|головна|баланс/.test(t))   return { action: "navigate", screen: "Dashboard" };
  if (/сканер|скан$/.test(t))              return { action: "navigate", screen: "Scan" };
  if (/угод|позиц/.test(t))               return { action: "navigate", screen: "Position" };
  if (/журнал/.test(t) && !/відкрити|закрити|записати/.test(t))
                                           return { action: "navigate", screen: "Journal" };
  if (/налаштув|правила|лівермор/.test(t)) return { action: "navigate", screen: "Settings" };

  // ── Скан символу ───────────────────────────────────────────
  // "сканувати DOGEUSDT" / "просканувати дог"
  const scanMatch = t.match(/скан(?:увати|уй)?\s+([a-zа-яA-ZА-Я]+)/i);
  if (scanMatch) {
    const raw = scanMatch[1].toUpperCase();
    const sym = normalizeSymbol(raw);
    return { action: "scan", symbol: sym };
  }

  // ── Відкрити угоду ─────────────────────────────────────────
  // "відкрити DOGEUSDT 0.091" або "купити DOGEUSDT 0.091"
  const openMatch = t.match(/(?:відкрити|купити|відкрий|купи)\s+([a-zа-яA-ZА-Я]+)\s+([\d.,]+)/i);
  if (openMatch) {
    const sym   = normalizeSymbol(openMatch[1].toUpperCase());
    const price = openMatch[2].replace(",", ".");
    return { action: "open_trade", symbol: sym, price };
  }

  // "відкрити DOGEUSDT" (без ціни)
  const openNoPrice = t.match(/(?:відкрити|купити|відкрий|купи)\s+([a-zа-яA-ZА-Я]+)/i);
  if (openNoPrice) {
    const sym = normalizeSymbol(openNoPrice[1].toUpperCase());
    return { action: "open_trade", symbol: sym, price: "" };
  }

  // ── Закрити угоду ──────────────────────────────────────────
  // "закрити DOGEUSDT 0.095"
  const closeMatch = t.match(/(?:закрити|продати|закрий|продай)\s+([a-zа-яA-ZА-Я]+)\s+([\d.,]+)/i);
  if (closeMatch) {
    const sym   = normalizeSymbol(closeMatch[1].toUpperCase());
    const price = closeMatch[2].replace(",", ".");
    return { action: "close_trade", symbol: sym, price };
  }

  // ── Записати збиток ────────────────────────────────────────
  // "збиток 2.50"
  const lossMatch = t.match(/(?:збиток|записати збиток|втрата)\s+([\d.,]+)/i);
  if (lossMatch) {
    const amount = lossMatch[1].replace(",", ".");
    return { action: "loss", amount };
  }

  return null;
}

// Транслітерація популярних монет
const SYMBOL_MAP = {
  "ДОГ": "DOGE", "ДОГE": "DOGE", "DOGE": "DOGE",
  "RIPPLE": "XRP", "РІПЛ": "XRP", "XRP": "XRP",
  "СОЛ": "SOL", "SOLANA": "SOL", "SOL": "SOL",
  "БТК": "BTC", "BITCOIN": "BTC", "БІТКОІН": "BTC", "BTC": "BTC",
  "ЕТХ": "ETH", "ETHEREUM": "ETH", "ЕФІР": "ETH", "ETH": "ETH",
  "BNB": "BNB", "БІНАНС": "BNB",
  "АДА": "ADA", "CARDANO": "ADA", "ADA": "ADA",
  "MATIC": "MATIC", "МАТІК": "MATIC", "POLYGON": "MATIC",
};

function normalizeSymbol(raw) {
  const base = SYMBOL_MAP[raw] || raw;
  // Додаємо USDT якщо немає
  if (!base.endsWith("USDT") && !base.endsWith("BTC") && !base.endsWith("ETH")) {
    return base + "USDT";
  }
  return base;
}
