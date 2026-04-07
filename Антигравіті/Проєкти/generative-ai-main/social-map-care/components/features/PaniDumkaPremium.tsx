'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdkRunner } from '@/lib/ai/AdkRunner';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';
import { useTimeTheme } from '@/components/theme/TimeThemeProvider';
import { HolographicAssistant } from './HolographicAssistant';
import { useVisionCapture } from '@/hooks/useVisionCapture';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useSignLanguageChat } from '@/hooks/useSignLanguageChat';
import type { VisionAnalysisResponse, VisionGestureAction } from '@/types';
import { getGestureAction } from '@/lib/vision/gestureCommands';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface PaniDumkaPremiumProps {
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  autoGreet?: boolean;
}

const GESTURE_LABELS: Partial<Record<VisionGestureAction, string>> = {
  confirm: 'Підтвердження жестом',
  detail: 'Детальніше',
  'peace-greeting': 'Жест привітання',
  'request-help': 'Потрібна допомога',
};

export const PaniDumkaPremium: React.FC<PaniDumkaPremiumProps> = ({ isOpen = false, onOpen, onClose, autoGreet = false }) => {
  const timeTheme = useTimeTheme();
  const greetingText = useMemo(
    () =>
      `${timeTheme.greeting}! Я — Пані Думка. Окрема цифрова особистість цієї системи. Я не чат підтримки, а жива присутність поряд із мапою: пояснюю контекст, тримаю увагу на людяності та допомагаю знайти наступний крок без хаосу.`,
    [timeTheme.greeting],
  );

  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', role: 'model', text: greetingText }]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [visionState, setVisionState] = useState<{
    summary: string;
    tips: string[];
    gestureLabel?: string;
    confidence?: number | null;
    updatedAt?: string;
  } | null>(null);
  const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);
  const [visionError, setVisionError] = useState<string | null>(null);
  const [lastGestureAction, setLastGestureAction] = useState<string | null>(null);
  const [adk] = useState(() => new AdkRunner('pani-dumka-avatar-dock'));
  const lastGestureActionRef = useRef<string>('');
  const lastVisionRunRef = useRef<number>(0);

  const { videoRef, isCameraActive, error: cameraError, startCamera, stopCamera, captureFrame } = useVisionCapture();
  const { overlayRef, detection, error: trackingError, isTracking, startTracking, stopTracking } = useHandTracking({ videoRef });
  const {
    phraseBuffer,
    currentGesture,
    isThinking: isGestureThinking,
    isSpeaking: isGestureSpeaking,
    speechState,
    speechPulse,
    speechError,
    sendPhrase,
    clearSpeechError,
  } = useSignLanguageChat({ detection });
  const { isListening, interimTranscript, startListening, stopListening } = useAudioTranscription({
    onTranscriptChange: (text) => setInput(text),
    onFinalTranscript: (text) => setInput(text),
  });

  useEffect(() => {
    setMessages((current) => {
      if (current.length === 1 && current[0]?.id === 'welcome') {
        return [{ id: 'welcome', role: 'model', text: greetingText }];
      }

      return current;
    });
  }, [greetingText]);

  const themeRateMap = { dawn: 0.94, day: 0.98, dusk: 0.92, night: 0.88 };
  const themePitchMap = { dawn: 0.4, day: 0.15, dusk: -0.2, night: -0.45 };
  const themeSpeakingRate = themeRateMap[timeTheme.theme];
  const themePitch = themePitchMap[timeTheme.theme];

  const fallbackSpeak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ukrainianVoice = voices.find((voice) => voice.lang.includes('uk') || voice.lang.includes('UA'));

    if (ukrainianVoice) {
      utterance.voice = ukrainianVoice;
    }

    utterance.lang = 'uk-UA';
    utterance.pitch = 0.9;
    utterance.rate = 0.94;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (typeof window === 'undefined') return;

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    setIsSpeaking(true);

    try {
      const res = await fetch('/api/google-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          lang: 'uk',
          speakingRate: themeSpeakingRate,
          pitch: themePitch,
          voiceProfile: 'pani-dumka',
        }),
      });

      if (res.ok) {
        const { audioContent } = (await res.json()) as { audioContent: string };
        const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          setIsSpeaking(false);
          fallbackSpeak(text);
        };
        await audio.play();
        return;
      }
    } catch {
      // Fallback to browser TTS
    }

    fallbackSpeak(text);
  }, [fallbackSpeak, themePitch, themeSpeakingRate]);

  const runVisionAnalysis = useCallback(async () => {
    if (!isCameraActive) {
      return;
    }

    const now = Date.now();
    if (now - lastVisionRunRef.current < 3500) {
      return;
    }

    const frame = captureFrame();
    if (!frame) {
      return;
    }

    lastVisionRunRef.current = now;
    setIsVisionAnalyzing(true);
    setVisionError(null);

    try {
      const response = await fetch('/api/ai/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: frame }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || 'Vision AI тимчасово недоступний.');
      }

      const payload = (await response.json()) as VisionAnalysisResponse;
      setVisionState({
        summary: payload.analysis.summary,
        tips: payload.analysis.accessibilityTips.slice(0, 2),
        gestureLabel: payload.analysis.gestureLabel,
        confidence: payload.analysis.gestureConfidence,
        updatedAt: payload.generatedAt,
      });
    } catch (error) {
      setVisionError(error instanceof Error ? error.message : 'Не вдалося завершити візуальний аналіз.');
    } finally {
      setIsVisionAnalyzing(false);
    }
  }, [captureFrame, isCameraActive]);

  const startEmbodiedMode = useCallback(async () => {
    await startCamera();
    await startTracking();
  }, [startCamera, startTracking]);

  useEffect(() => {
    if (!autoGreet) {
      return;
    }

    if (!isOpen) {
      stopTracking();
      stopCamera();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    void speak(greetingText);
    void startEmbodiedMode();

    return () => {
      stopTracking();
      stopCamera();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [autoGreet, greetingText, isOpen, speak, startEmbodiedMode, stopCamera, stopTracking]);

  useEffect(() => {
    if (!isOpen || !isCameraActive) {
      return;
    }

    void runVisionAnalysis();
    const timer = window.setInterval(() => {
      void runVisionAnalysis();
    }, 9000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isCameraActive, isOpen, runVisionAnalysis]);

  useEffect(() => {
    if (!isOpen || !detection || detection.gesture === 'unknown') {
      return;
    }

    const action = getGestureAction(detection.gesture);
    if (!action) {
      return;
    }

    const token = `${action}:${detection.gesture}`;
    if (lastGestureActionRef.current === token) {
      return;
    }

    lastGestureActionRef.current = token;
    const clearToken = window.setTimeout(() => {
      if (lastGestureActionRef.current === token) {
        lastGestureActionRef.current = '';
      }
    }, 2200);

    setLastGestureAction(GESTURE_LABELS[action] ?? detection.gesture);

    if (action === 'confirm' && phraseBuffer.length > 0) {
      void sendPhrase();
    }

    if (action === 'detail') {
      void runVisionAnalysis();
    }

    if (action === 'peace-greeting') {
      void speak('Я поруч. Бачу ваш жест і тримаю фокус на вас.');
    }

    return () => {
      window.clearTimeout(clearToken);
    };
  }, [detection, isOpen, phraseBuffer.length, runVisionAnalysis, sendPhrase, speak]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmedInput,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');

    try {
      const reply = await adk.runAgentTask({
        id: `pani-dumka-${Date.now()}`,
        type: 'support',
        input: trimmedInput,
        messages: nextMessages.map((message) => ({ role: message.role, content: message.text })),
      });

      const modelMessage: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: reply,
      };

      setMessages((current) => [...current, modelMessage]);
      void speak(reply);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Пані Думка тимчасово не змогла відповісти.';
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: 'model',
          text: `Зараз я не змогла завершити думку. Спробуйте ще раз: ${message}`,
        },
      ]);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  };

  const assistantStatus = cameraError || trackingError || visionError
    ? 'error'
    : isSpeaking || isGestureSpeaking
      ? 'speaking'
      : isListening || isTracking
        ? 'listening'
        : isGestureThinking || isVisionAnalyzing
          ? 'translating'
          : isCameraActive
            ? 'idle'
            : 'offline';

  const assistantIntensity = isSpeaking || isGestureSpeaking
    ? 0.9 + speechPulse * 0.12
    : isListening || isTracking
      ? 0.68 + (detection?.confidence ?? 0) * 0.18
      : isVisionAnalyzing
        ? 0.58
        : 0.34;

  const currentError = cameraError ?? trackingError ?? visionError ?? speechError;

  return (
    <div className="pointer-events-none fixed bottom-4 right-3 z-[80] flex flex-col items-end md:bottom-6 md:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="dialog-shell mb-3 flex h-[min(82vh,680px)] w-[min(460px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[1.5rem] glass-card pointer-events-auto sm:mb-4 sm:rounded-[2rem] lg:h-[680px]"
          >
            <div className="relative overflow-hidden border-b border-white/10 px-5 py-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(var(--primary),0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.01))]" />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Запатентована цифрова особистість</div>
                  <div className="mt-1 text-lg font-black uppercase tracking-[-0.02em] text-white">Пані Думка</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/45">
                    присутність • бачення • голос • карта
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative border-b border-white/10 p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(74,222,128,0.08),transparent_42%)]" />
              <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#091119]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.15),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
                <div className="absolute right-[-10%] top-[12%] h-40 w-56 rounded-full border-[4px] border-primary/40 blur-[2px]" />
                <div className="absolute inset-x-6 top-[18%] h-[2px] bg-primary/40 blur-sm" />
                <div className="absolute bottom-0 left-1/2 h-24 w-[85%] -translate-x-1/2 rounded-[100%] border-t border-primary/25" />

                <div className="relative flex min-h-[220px] items-end justify-between px-6 pb-0 pt-6">
                  <div className="relative w-[48%]">
                    <div className="absolute inset-x-8 bottom-6 h-28 rounded-full bg-primary/20 blur-3xl" />
                    <div className="relative mx-auto aspect-[3/4] w-full max-w-[180px] overflow-hidden rounded-t-[2rem]">
                      <Image
                        src="/assets/pani-dumka-avatar.png"
                        alt="Пані Думка"
                        fill
                        className="object-cover object-top"
                        priority
                      />
                    </div>
                  </div>

                  <div className="w-[48%] pb-6">
                    <div className="relative h-40 overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20">
                      <HolographicAssistant
                        status={assistantStatus}
                        isSpeaking={isSpeaking || isGestureSpeaking}
                        intensity={assistantIntensity}
                        confidence={detection?.confidence ?? null}
                        label="Пані Думка"
                        detail={lastGestureAction ?? 'Окрема присутність поряд із картою'}
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                    <div className="mt-3 text-xs leading-6 text-white/66">
                      Голос, текст, жести й візуальна увага працюють як одна присутність.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-b border-white/10 p-4 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Vision AI</div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isCameraActive) {
                        stopTracking();
                        stopCamera();
                        return;
                      }
                      void startEmbodiedMode();
                    }}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] transition',
                      isCameraActive
                        ? 'border-red-500/30 bg-red-500/12 text-red-300'
                        : 'border-primary/30 bg-primary/12 text-primary',
                    )}
                  >
                    {isCameraActive ? (
                      <>
                        <CameraOff size={12} className="mr-1 inline" />
                        стоп
                      </>
                    ) : (
                      <>
                        <Camera size={12} className="mr-1 inline" />
                        старт
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 relative overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/35 aspect-[4/3]">
                  <video ref={videoRef} className="h-full w-full object-cover" playsInline muted autoPlay />
                  <canvas ref={overlayRef} className="absolute inset-0 h-full w-full" />
                  {!isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                      <div>
                        <Camera size={24} className="mx-auto text-white/20" />
                        <div className="mt-2 text-[11px] text-white/35">Увімкніть камеру для embodied-режиму</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-2 text-xs text-white/62">
                  <div>{visionState?.summary ?? 'Vision AI ще не зібрав повний контекст сцени.'}</div>
                  {visionState?.tips?.map((tip) => (
                    <div key={tip} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="mt-0 space-y-2">
                  {[
                    { label: 'Поточний жест', value: currentGesture ?? 'очікування' },
                    { label: 'Буфер жестів', value: phraseBuffer.length ? `${phraseBuffer.length} активних` : 'порожній' },
                    { label: 'Остання дія', value: lastGestureAction ?? 'ще не було' },
                    { label: 'Голосовий стан', value: isSpeaking || isGestureSpeaking ? 'говорить' : speechState === 'requesting-audio' ? 'готує голос' : 'тиша' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                      <span className="text-[11px] text-white/46">{item.label}</span>
                      <span className="text-[11px] font-semibold text-white/80">{item.value}</span>
                    </div>
                  ))}
                </div>

                {currentError && (
                  <button
                    type="button"
                    onClick={clearSpeechError}
                    className="mt-3 w-full rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-200 transition hover:bg-amber-500/15"
                  >
                    {currentError}
                  </button>
                )}

                <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-[11px] leading-5 text-white/62">
                  Жести вже працюють як керування:
                  <span className="text-white/84"> `thumbs-up` </span>підтверджує,
                  <span className="text-white/84"> `peace` </span>викликає голосове привітання,
                  <span className="text-white/84"> `pinch` </span>оновлює Vision AI.
                </div>
              </div>
            </div>

            <div className="relative flex-1 overflow-y-auto px-4 py-5 scrollbar-hide">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(var(--primary),0.08),transparent_40%)]" />
              <div className="relative space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'max-w-[90%] rounded-[1.4rem] border px-4 py-3 text-sm leading-7 shadow-lg',
                      message.role === 'user'
                        ? 'ml-auto border-white/10 bg-white text-slate-950'
                        : 'mr-auto border-white/10 bg-white/[0.08] text-white/[0.82]',
                    )}
                  >
                    {message.text}
                  </motion.div>
                ))}

                {phraseBuffer.length > 0 && (
                  <div className="rounded-[1.4rem] border border-primary/20 bg-primary/10 px-4 py-3 text-xs text-white/78">
                    Жестовий буфер: {phraseBuffer.map((item) => item.phrase).join(' · ')}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="relative flex items-end gap-2">
                <div className="relative flex-1">
                  <textarea
                    id="pani-dumka-chat-input"
                    name="paniDumkaChatInput"
                    rows={2}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Запитайте Пані Думку про контекст, сервіс, ризик, маршрут або наступний крок..."
                    className={cn(
                      'min-h-[92px] w-full resize-none rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary/50',
                      isListening && 'border-primary/50 ring-2 ring-primary/20',
                    )}
                  />

                  {isListening && interimTranscript && (
                    <div className="absolute -top-14 left-0 right-0 rounded-2xl border border-primary/[0.25] bg-primary/10 px-3 py-2 text-[11px] text-white/80 backdrop-blur-xl">
                      <span className="mr-1 text-white/45">Слухаю:</span>
                      {interimTranscript}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleToggleListening}
                    className={cn(
                      'rounded-2xl border p-3 transition active:scale-95',
                      isListening
                        ? 'border-red-400/30 bg-red-500 text-white shadow-[0_0_24px_rgba(239,68,68,0.3)]'
                        : 'border-white/10 bg-white/5 text-white/50 hover:text-white',
                    )}
                    title={isListening ? 'Зупинити запис' : 'Голосове введення'}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    className="rounded-2xl border border-primary/20 bg-primary/[0.14] p-3 text-primary transition hover:bg-primary/20 active:scale-95"
                    title="Надіслати"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.97 }}
        onClick={onOpen}
        className={cn(
          'dialog-shell relative overflow-hidden glass-card pointer-events-auto transition-all duration-500 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)]',
          'h-[4.5rem] w-[4.5rem] rounded-full p-1.5 sm:h-auto sm:w-[214px] sm:rounded-[1.8rem]',
          isOpen && 'translate-x-4 rotate-6 opacity-0 pointer-events-none',
        )}
        aria-label="Відкрити Пані Думку"
      >
        <div className="relative h-full overflow-hidden rounded-full border border-white/10 bg-[#091119] sm:rounded-[1.3rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />
          <div className="relative h-full w-full sm:h-28">
            <div className="absolute inset-1 overflow-hidden rounded-full sm:inset-y-0 sm:left-3 sm:w-20 sm:rounded-b-none sm:rounded-t-[1rem]">
              <Image
                src="/assets/pani-dumka-avatar.png"
                alt="Пані Думка"
                fill
                className="object-cover object-top"
              />
            </div>
            <div className="absolute right-2 top-2 hidden h-20 w-24 overflow-hidden rounded-[1rem] sm:block">
              <HolographicAssistant
                status={isOpen ? assistantStatus : 'idle'}
                isSpeaking={isOpen && (isSpeaking || isGestureSpeaking)}
                intensity={isOpen ? assistantIntensity : 0.32}
                confidence={detection?.confidence ?? null}
                label="Пані Думка"
                detail={isOpen ? 'Активна присутність' : ''}
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <div className="absolute bottom-1 right-1 rounded-full border border-white/10 bg-black/30 p-1.5 sm:bottom-2 sm:right-2">
              <Sparkles size={12} className="text-primary" />
            </div>
          </div>

            <div className="hidden px-3 pb-3 pt-2 text-left sm:block">
              <div className="text-[13px] font-semibold text-white">Пані Думка</div>
            </div>
        </div>
      </motion.button>
    </div>
  );
};
