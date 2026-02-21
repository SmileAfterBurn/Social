import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Mic, PlayCircle, Heart, X } from 'lucide-react';
import { analyzeData, LiveSession, generateSpeech } from '../services/geminiService';
import { Organization, ChatMessage } from '../types';

const PANI_DUMKA_AVATAR = "https://drive.google.com/thumbnail?id=1CKyZ-yqoy3iEKIqnXkrg07z0GmK-e099&sz=w256";

interface GeminiChatProps {
    organizations: Organization[];
    isOpen: boolean;
    onClose: () => void;
    onOpenPresentation?: () => void;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ organizations, isOpen, onClose, onOpenPresentation }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'model',
            text: 'Вітаю вас, сонечко! Я пані Думка. \n\nЯ допоможу вам знайти підтримку у будь-якому куточку нашої країни. \n\nЧим я можу вам допомогти?',
            timestamp: Date.now()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLargeText, setIsLargeText] = useState(false);
    const [isHighContrast, setIsHighContrast] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    const [isVoiceActive, setIsVoiceActive] = useState(false);

    const liveSessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { scrollToBottom(); }, [messages, isOpen, isLargeText]);

    useEffect(() => {
        return () => {
            if (liveSessionRef.current) liveSessionRef.current.disconnect();
            stopAudioPlayback();
        };
    }, []);

    const stopAudioPlayback = () => {
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.stop(); } catch (e) { }
            sourceNodeRef.current = null;
        }
        setSpeakingMessageId(null);
    };

    const speakText = async (msgId: string, text: string) => {
        if (speakingMessageId === msgId) { stopAudioPlayback(); return; }
        stopAudioPlayback();
        setSpeakingMessageId(msgId);
        try {
            const cleanText = text.replace(/\*\*/g, '').replace(/\n/g, ' ');
            const audioData = await generateSpeech(cleanText);
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const dataInt16 = new Int16Array(audioData);
            const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => { if (speakingMessageId === msgId) setSpeakingMessageId(null); };
            source.start(0);
            sourceNodeRef.current = source;
        } catch {
            setSpeakingMessageId(null);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        try {
            const responseText = await analyzeData(input, organizations);
            const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVoiceChat = async () => {
        if (isVoiceActive) {
            if (liveSessionRef.current) { liveSessionRef.current.disconnect(); liveSessionRef.current = null; }
        } else {
            try {
                liveSessionRef.current = new LiveSession((active) => setIsVoiceActive(active));
                await liveSessionRef.current.connect();
            } catch { alert("Не вдалося запустити голосовий чат."); }
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 md:inset-y-0 md:right-0 md:w-[450px] shadow-2xl z-[500] flex flex-col transition-all overflow-hidden ${isHighContrast ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>
            <div className={`p-4 flex flex-col gap-3 border-b ${isHighContrast ? 'border-yellow-400 bg-slate-900' : 'bg-teal-700 text-white'}`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={PANI_DUMKA_AVATAR} alt="Думка" className="w-12 h-12 rounded-full border-2 border-white bg-white" />
                        <div>
                            <h3 className="font-bold text-lg leading-none uppercase">Пані Думка</h3>
                            <span className="text-[10px] uppercase opacity-80">Цифрова помічниця</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full"><X size={24} /></button>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsLargeText(!isLargeText)} className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold border border-white/20">A+</button>
                    <button onClick={() => setIsHighContrast(!isHighContrast)} className={`px-3 py-1 rounded-lg text-xs font-bold border ${isHighContrast ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white/10 border-white/20'}`}>Контраст</button>
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${isHighContrast ? 'bg-black' : 'bg-slate-50'}`}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${isLargeText ? 'text-lg' : 'text-sm'} ${msg.role === 'user' ? (isHighContrast ? 'bg-yellow-400 text-black' : 'bg-teal-600 text-white') : (isHighContrast ? 'bg-slate-900 text-white border border-yellow-400' : 'bg-white text-slate-800 border border-slate-200')}`}>
                            <div className="flex justify-between items-center mb-1 opacity-60 text-[8px] font-bold uppercase">
                                <span>{msg.role === 'model' ? 'Думка' : 'Ви'}</span>
                                {msg.role === 'model' && <button onClick={() => speakText(msg.id, msg.text)} className="p-1"><Volume2 size={12} /></button>}
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </div>
                    </div>
                ))}
                {isLoading && <div className="animate-pulse text-xs text-slate-400">Пані Думка думає...</div>}
                <div ref={messagesEndRef} />
            </div>

            <div className={`p-4 border-t ${isHighContrast ? 'border-yellow-400 bg-black' : 'bg-white'}`}>
                <div className="flex gap-2 mb-3">
                    <button onClick={onOpenPresentation} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 border border-indigo-100"><PlayCircle size={14} /> Презентація</button>
                    <button onClick={() => setInput("Як підтримати проект?")} className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 border border-rose-100"><Heart size={14} fill="currentColor" /> Підтримати</button>
                </div>
                <div className="flex gap-2 items-center">
                    <button onClick={toggleVoiceChat} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isVoiceActive ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500'}`}><Mic size={20} /></button>
                    <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className={`flex-1 p-2.5 rounded-xl border outline-none ${isHighContrast ? 'bg-slate-900 text-yellow-400 border-yellow-400' : 'bg-slate-50 border-slate-200'}`} placeholder="Запитайте..." />
                    <button onClick={handleSend} className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center"><Send size={18} /></button>
                </div>
            </div>
        </div>
    );
};
