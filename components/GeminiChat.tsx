
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Loader2, Mic, MicOff, Volume2, PlayCircle, X, StopCircle, Headphones, MessageSquare, Info, Heart, ShieldAlert, ExternalLink, MapPin, Brain, Ear, Globe, Search, RefreshCw, BarChart, Lock, AlertCircle, ChevronDown, UserRound } from 'lucide-react';
import { analyzeData, generateSpeech, LiveSession, AnalyzeResult, getIntelligentSummary, PANI_DUMKA_VOICES, GeminiVoice } from './geminiService';
import { Organization, ChatMessage, UserSession } from '../types';

const PANI_DUMKA_AVATAR = "https://drive.google.com/thumbnail?id=1CKyZ-yqoy3iEKIqnXkrg07z0GmK-e099&sz=w256";
const MAX_MESSAGE_LENGTH = 2000;

interface ExtendedChatMessage extends ChatMessage {
  groundingLinks?: { uri: string; title: string; type: 'web' | 'map' }[];
}

interface GeminiChatProps {
  organizations: Organization[];
  isOpen: boolean;
  onClose: () => void;
  onOpenPresentation?: () => void;
  prefillPrompt?: string | null;
  isDarkMode?: boolean;
  user: UserSession;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ organizations, isOpen, onClose, onOpenPresentation, prefillPrompt, isDarkMode = false, user }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    { id: 'welcome', role: 'model', text: 'Вітаю вас, рідненькі! Я — пані Думка. Я можу знайти будь-яку допомогу на карті, актуалізувати контакти або просто вислухати. Що вас турбує?', timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<GeminiVoice>('Kore');
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | undefined>();
  const [showValidationError, setShowValidationError] = useState(false);
  
  const liveSessionRef = useRef<LiveSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const canUseThinking = user.role === 'Admin' || user.role === 'Manager';

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Location access denied")
      );
      if (prefillPrompt) handleSend(prefillPrompt);
    }
  }, [isOpen, prefillPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (input.trim().length > 0) {
      setShowValidationError(false);
    }
  }, [input]);

  const handleSend = async (text: string = input) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      setShowValidationError(true);
      return;
    }
    if (trimmedText.length > MAX_MESSAGE_LENGTH) {
      alert(`Повідомлення занадто довге (макс. ${MAX_MESSAGE_LENGTH} символів)`);
      return;
    }
    if (isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: trimmedText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowValidationError(false);
    setIsLoading(true);
    
    try {
      const result: AnalyzeResult = await analyzeData(trimmedText, organizations, userLoc, isThinkingMode && canUseThinking);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: result.text, timestamp: Date.now(), groundingLinks: result.groundingLinks }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: 'Вибачте, серденько, щось я замислилася занадто глибоко. Спробуйте ще раз.', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummary = async () => {
    setIsLoading(true);
    try {
      const summary = await getIntelligentSummary(organizations);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: summary, timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: 'Не вдалося зробити огляд, сонечко.', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLiveMode = async () => {
    if (isLiveMode) {
      liveSessionRef.current?.disconnect();
      setIsLiveMode(false);
    } else {
      liveSessionRef.current = new LiveSession(
        (active) => setIsLiveMode(active),
        (text, role) => {
          if (text.trim()) {
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === role && last.id.startsWith('live-')) {
                return [...prev.slice(0, -1), { ...last, text: last.text + ' ' + text }];
              }
              return [...prev, { id: `live-${Date.now()}`, role, text, timestamp: Date.now() }];
            });
          }
        },
        selectedVoice
      );
      await liveSessionRef.current.connect();
    }
  };

  const speakText = async (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      sourceNodeRef.current?.stop();
      setSpeakingMessageId(null);
      return;
    }
    setSpeakingMessageId(msgId);
    try {
      const audioData = await generateSpeech(text, selectedVoice);
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const int16 = new Int16Array(audioData);
      const buffer = audioContextRef.current.createBuffer(1, int16.length, 24000);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < int16.length; i++) data[i] = int16[i] / 32768.0;
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setSpeakingMessageId(null);
      source.start(0);
      sourceNodeRef.current = source;
    } catch (e) { setSpeakingMessageId(null); }
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.includes('✅ Підтверджено')) return <div key={i} className="my-2 p-3 bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-500 rounded-r-xl font-bold text-emerald-900 dark:text-emerald-100">{line}</div>;
      if (line.includes('⚠️ Потребує уваги')) return <div key={i} className="my-2 p-3 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-r-xl font-bold text-amber-900 dark:text-amber-100">{line}</div>;
      if (line.includes('🕊️ Порада від пані Думки')) return <div key={i} className="mt-4 pt-4 border-t border-teal-100 dark:border-teal-800 italic text-teal-800 dark:text-teal-400 font-medium flex items-center gap-2"><Heart size={14} className="text-rose-400" /> {line}</div>;
      if (line.startsWith('* ')) return <li key={i} className="ml-4 mb-1 list-disc text-slate-700 dark:text-slate-300">{line.substring(2)}</li>;
      if (line.startsWith('### ')) return <h3 key={i} className="font-black text-slate-900 dark:text-white mt-4 mb-2 uppercase text-xs tracking-widest">{line.substring(4)}</h3>;
      return <p key={i} className="mb-2 leading-relaxed text-slate-700 dark:text-slate-300">{line}</p>;
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[5500] flex flex-col md:w-[450px] md:left-auto md:right-6 md:top-6 md:bottom-6 md:rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden animate-in-dialog transition-colors duration-300`}>
      <div className={`shrink-0 p-6 bg-gradient-to-r transition-colors duration-500 ${isThinkingMode ? 'from-indigo-600 to-violet-700' : (isDarkMode ? 'from-teal-800 to-emerald-900' : 'from-teal-600 to-emerald-700')} text-white flex justify-between items-center z-10`}>
        <div className="flex items-center gap-4">
           <div className={`w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 p-1 relative ${isLiveMode ? 'scale-110 shadow-lg' : ''}`}>
             <img src={PANI_DUMKA_AVATAR} alt="Думка" className="w-full h-full object-cover rounded-full" />
             {(isLiveMode || isLoading) && <div className="absolute -inset-1.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>}
           </div>
           <div>
             <h3 className="font-black text-lg uppercase tracking-wider">Пані Думка</h3>
             
             {/* Voice Selection Toggle */}
             <div className="relative">
                <button 
                  onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg hover:bg-white/20 transition-all border border-white/10"
                >
                  <UserRound size={10} /> Голос: {PANI_DUMKA_VOICES.find(v => v.id === selectedVoice)?.label} <ChevronDown size={10} className={showVoiceMenu ? 'rotate-180' : ''} />
                </button>
                
                {showVoiceMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                    {PANI_DUMKA_VOICES.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => { setSelectedVoice(voice.id); setShowVoiceMenu(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors group flex items-center justify-between ${selectedVoice === voice.id ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'}`}
                      >
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-wider">{voice.label}</span>
                           <span className="text-[8px] opacity-60 truncate max-w-[100px]">{voice.desc}</span>
                        </div>
                        {selectedVoice === voice.id && <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                      </button>
                    ))}
                  </div>
                )}
             </div>
           </div>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"><X size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar transition-colors duration-300">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-400`}>
            <div className={`max-w-[92%] p-5 rounded-[2.2rem] shadow-sm text-sm ${msg.role === 'user' ? 'bg-teal-600 dark:bg-teal-700 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-sm shadow-inner'}`}>
               {renderFormattedText(msg.text)}
            </div>

            {msg.groundingLinks && (
              <div className="mt-3 w-full flex flex-col gap-2 pl-4">
                {msg.groundingLinks.map((link, idx) => (
                  <a key={idx} href={link.uri} target="_blank" className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-teal-400 dark:hover:border-teal-500 transition-all group">
                    <div className="w-8 h-8 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center shrink-0"><Globe size={14} /></div>
                    <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate uppercase tracking-widest">{link.title}</span>
                    <ExternalLink size={12} className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-teal-500" />
                  </a>
                ))}
              </div>
            )}
            
            {msg.role === 'model' && (
                <button onClick={() => speakText(msg.id, msg.text)} className="mt-2 ml-3 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all">
                    {speakingMessageId === msg.id ? <div className="flex gap-0.5"><div className="w-1 h-3 bg-rose-400 animate-bounce"></div><div className="w-1 h-3 bg-rose-400 animate-bounce [animation-delay:0.1s]"></div><div className="w-1 h-3 bg-rose-400 animate-bounce [animation-delay:0.2s]"></div></div> : <Volume2 size={16} />}
                    {speakingMessageId === msg.id ? 'Стоп' : 'Голос'}
                </button>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-4 transition-colors duration-300">
        {!isLiveMode && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
             <button onClick={handleSummary} className="whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-800 transition shadow-sm">
               <BarChart size={12} /> Огляд регіону
             </button>
             <button onClick={() => setInput("Актуалізуй контакти найближчих хабів")} className="whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800 text-[10px] font-black uppercase tracking-widest hover:bg-teal-100 dark:hover:bg-teal-800 transition shadow-sm">
               <RefreshCw size={12} /> Актуалізувати дані
             </button>
             <button 
                disabled={!canUseThinking}
                onClick={() => setIsThinkingMode(!isThinkingMode)} 
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    !canUseThinking ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800 text-slate-300' :
                    isThinkingMode ? 'bg-slate-900 dark:bg-indigo-600 text-white border-transparent shadow-lg' : 
                    'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
                title={!canUseThinking ? "Доступно лише для менеджерів" : "Deep Thinking Mode"}
             >
               {canUseThinking ? <Brain size={12} /> : <Lock size={10} />} Deep Think
             </button>
          </div>
        )}
        <div className="relative flex flex-col gap-2">
            {showValidationError && (
              <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest px-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
                <AlertCircle size={10} /> Будь ласка, введіть повідомлення
              </div>
            )}
            <div className="relative flex items-center gap-3">
                <button onClick={toggleLiveMode} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isLiveMode ? 'bg-rose-500 text-white' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50'}`}>
                    {isLiveMode ? <Headphones size={24} /> : <Ear size={24} />}
                </button>
                <div className="flex-1 relative">
                  <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                    disabled={isLiveMode || isLoading} 
                    maxLength={MAX_MESSAGE_LENGTH}
                    placeholder={isLiveMode ? "Я слухаю..." : "Запитайте пані Думку..."} 
                    className={`w-full h-14 bg-slate-50 dark:bg-slate-800 border ${showValidationError ? 'border-rose-300 dark:border-rose-900 ring-4 ring-rose-500/5' : 'border-slate-200 dark:border-slate-700'} rounded-2xl px-5 pr-14 text-sm font-semibold outline-none focus:ring-4 ${showValidationError ? 'focus:ring-rose-500/10' : 'focus:ring-teal-500/10'} transition-all shadow-inner dark:text-white dark:placeholder-slate-500`} 
                  />
                  <button onClick={() => handleSend()} disabled={isLoading} className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 ${!input.trim() ? 'bg-slate-200 dark:bg-slate-700 text-slate-400' : 'bg-teal-600 dark:bg-teal-500 text-white shadow-lg hover:bg-teal-700 dark:hover:bg-teal-600'} rounded-xl flex items-center justify-center transition-all active:scale-90`}><Send size={18} /></button>
                </div>
            </div>
            {input.length > 0 && (
              <div className={`text-[8px] font-bold self-end uppercase tracking-widest ${input.length > MAX_MESSAGE_LENGTH - 100 ? 'text-rose-500' : 'text-slate-400'}`}>
                {input.length} / {MAX_MESSAGE_LENGTH}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
