
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Volume2, VolumeX, Play, CheckCircle, Loader2, Sparkles, Heart, Shield, Map, X, FastForward, ShieldCheck, FileText, Brain, Mic } from 'lucide-react';
import { generateSpeech } from './geminiService';

interface IntroModalProps {
  onComplete: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

const SLIDES = [
  {
    icon: <Heart className="w-16 h-16 text-rose-500" fill="currentColor" />,
    title: "Турбота у кожному кліку",
    text: "Вітаю, сонечко! Я — пані Думка. Я допоможу тобі знайти прихисток, гарячу їжу або ліки серед 5200+ перевірених організацій по всій Україні.",
    bg: "from-rose-50 to-white"
  },
  {
    icon: <Brain className="w-16 h-16 text-indigo-500" />,
    title: "Глибоке розуміння потреб",
    text: "Завдяки моделі Gemini 3 Pro, я можу розбиратися у складних юридичних та психологічних питаннях. Просто напиши свою історію — я знайду вихід.",
    bg: "from-indigo-50 to-white"
  },
  {
    icon: <Mic className="w-16 h-16 text-teal-500" />,
    title: "Голос, що дарує надію",
    text: "Натисни на мікрофон у чаті, і ми зможемо поговорити наживо. Це найзручніший спосіб знайти допомогу, якщо важко писати або бачити екран.",
    bg: "from-teal-50 to-white"
  }
];

export const IntroModal: React.FC<IntroModalProps> = ({ onComplete, onOpenPrivacy, onOpenTerms }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      stopAudio();
      audioContextRef.current?.close();
    };
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch(e) {}
      sourceNodeRef.current = null;
    }
  };

  const playCurrentSlide = async () => {
    stopAudio();
    if (isMuted) return;
    setIsLoadingAudio(true);
    try {
      const textToSpeak = SLIDES[currentStep].text; 
      const audioData = await generateSpeech(textToSpeak);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      const buffer = await decodeAudioData(audioData, audioContextRef.current);
      if (isMuted) { setIsLoadingAudio(false); return; }
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
      sourceNodeRef.current = source;
    } catch (e: any) {
      console.error("Audio error", e);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const decodeAudioData = async (data: ArrayBuffer, ctx: AudioContext): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const handleStart = () => {
    setHasStarted(true);
    playCurrentSlide();
  };

  const handleNext = () => {
    if (currentStep < SLIDES.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  useEffect(() => {
    if (hasStarted) playCurrentSlide();
  }, [currentStep]);

  useEffect(() => {
    if (isMuted) stopAudio();
    else if (hasStarted) playCurrentSlide();
  }, [isMuted]);

  const handleComplete = () => {
    stopAudio();
    localStorage.setItem('hide_intro_annotation', 'true');
    onComplete();
  };

  const content = SLIDES[currentStep];

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 font-sans">
      <div className={`bg-gradient-to-br ${content.bg} rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden relative flex flex-col animate-in-dialog border border-white/50 transition-all duration-500`}>
        
        {/* Top Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
           <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-100 text-slate-500 hover:text-teal-600 transition-all active:scale-95"
           >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className={isLoadingAudio ? 'animate-pulse' : ''} />}
           </button>

           <button 
              onClick={handleComplete}
              className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all active:scale-95 flex items-center gap-2"
           >
              Пропустити <FastForward size={14} />
           </button>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 flex">
          {SLIDES.map((_, idx) => (
            <div key={idx} className={`flex-1 transition-all duration-700 ${idx <= currentStep ? 'bg-teal-500' : 'bg-slate-200'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center text-center px-8 py-20 relative">
          <div className="mb-10 p-6 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center relative group">
             <div className="absolute -inset-4 bg-teal-500/5 rounded-full blur-2xl animate-pulse"></div>
             {content.icon}
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-700">
            {content.title}
          </h2>
          <div className="min-h-[100px] flex items-center justify-center relative">
             {isLoadingAudio ? (
                <div className="flex flex-col items-center gap-3 text-teal-600 font-bold animate-pulse">
                   <div className="flex gap-1">
                      <div className="w-1 h-4 bg-teal-400 animate-bounce"></div>
                      <div className="w-1 h-4 bg-teal-400 animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-4 bg-teal-400 animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                   <span className="text-[10px] uppercase tracking-widest">Пані Думка замислилась...</span>
                </div>
             ) : (
                <p className="text-slate-600 font-medium leading-relaxed animate-in fade-in duration-1000">
                   {content.text}
                </p>
             )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 pt-0 flex flex-col gap-4">
          {!hasStarted ? (
            <button 
              onClick={handleStart}
              className="w-full py-5 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-teal-700 transition shadow-lg shadow-teal-500/30 flex items-center justify-center gap-3 active:scale-95 group"
            >
              <Play fill="currentColor" size={18} className="group-hover:scale-110 transition-transform" /> Почати знайомство
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition shadow-xl flex items-center justify-center gap-3 active:scale-95 group"
            >
              {currentStep === SLIDES.length - 1 ? 'Допомогти мені' : 'Продовжити'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-2">
            <button onClick={onOpenPrivacy} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-teal-600 transition-colors flex items-center justify-center gap-1.5">
               <ShieldCheck size={12} /> Конфіденційність
            </button>
            <span className="hidden sm:inline w-1 h-1 bg-slate-200 rounded-full"></span>
            <button onClick={onOpenTerms} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5">
               <FileText size={12} /> Умови обслуговування
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
