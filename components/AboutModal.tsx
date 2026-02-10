
import React, { useState } from 'react';
import { X, Heart, Share2, Github, Mail, Globe, Award, Wallet, ArrowRight, Target, Users, ShieldCheck, Briefcase, Copy, ExternalLink, Laptop, PlayCircle, Scale, Terminal, Shield, FileText } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
  onOpenPresentation?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose, onOpenPresentation, onOpenPrivacy, onOpenTerms }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'donate' | 'partners' | 'legal'>('about');
  const [copied, setCopied] = useState(false);

  const MONO_JAR_URL = "https://send.monobank.ua/jar/3upLLMPr6P";
  const GITHUB_URL = "https://github.com/SmileAfterBurn/Social";
  const BUILD_HASH = "f9a2054d-3a92-48b5-af89-f1ccf6664093";

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Посилання на мапу скопійовано!');
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh] border border-white/20">
        
        <div className="h-28 md:h-36 bg-gradient-to-r from-teal-700 to-blue-800 relative flex flex-col items-center justify-center shrink-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10 text-center text-white px-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2 border border-white/30 shadow-lg">
               <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" />
             </div>
             <h2 className="text-lg md:text-2xl font-black drop-shadow-md tracking-tight uppercase">Інклюзивна мапа</h2>
             <p className="text-teal-100 text-[9px] md:text-xs font-black uppercase tracking-widest opacity-90">Соціальна екосистема</p>
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all"><X size={18} /></button>
        </div>

        <div className="flex border-b border-slate-100 shrink-0 bg-slate-50/50 overflow-x-auto no-scrollbar">
          {[
            { id: 'about', label: 'Про проект' },
            { id: 'partners', label: 'Партнери' },
            { id: 'donate', label: 'Підтримати' },
            { id: 'legal', label: 'Правова база' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 min-w-[100px] py-4 text-[9px] md:text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-teal-700 bg-teal-50' : 'text-slate-400 hover:bg-white'}`}>
              {tab.label}
              {activeTab === tab.id && <div className={`absolute bottom-0 left-0 w-full h-1 ${tab.id === 'donate' ? 'bg-rose-500' : 'bg-teal-600'}`}></div>}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1">
           {activeTab === 'about' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <p className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium"><strong>«Інклюзивна мапа»</strong> — це єдиний верифікований реєстр допомоги для ВПО та вразливих груп населення в Україні.</p>
               <button onClick={onOpenPresentation} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-teal-700 transition flex items-center justify-center gap-3 shadow-lg group active:scale-95">
                 <PlayCircle className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" /> Переглянути презентацію
               </button>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  {[
                    { icon: Target, label: 'Швидкість', text: 'Миттєвий пошук допомоги.', color: 'teal' },
                    { icon: Users, label: 'Інклюзія', text: 'Голосовий інтерфейс Думка.', color: 'blue' },
                    { icon: ShieldCheck, label: 'Довіра', text: 'Перевірені організації.', color: 'purple' }
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center flex md:flex-col items-center gap-4 md:gap-3">
                      <div className={`w-10 h-10 bg-${item.color}-100 text-${item.color}-600 rounded-xl flex items-center justify-center shrink-0`}><item.icon size={20} /></div>
                      <div className="text-left md:text-center"><h4 className="font-black text-slate-800 text-[10px] uppercase mb-0.5">{item.label}</h4><p className="text-[10px] text-slate-500 font-medium">{item.text}</p></div>
                    </div>
                  ))}
               </div>
             </div>
           )}

           {activeTab === 'partners' && (
             <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-slate-900 text-white p-5 md:p-6 rounded-[2rem] shadow-xl relative overflow-hidden border border-white/10">
                 <div className="absolute right-[-20px] top-[-20px] opacity-10"><Briefcase size={120} /></div>
                 <h3 className="text-lg md:text-xl font-black mb-2 uppercase tracking-tight relative z-10">Для Бізнесу</h3>
                 <p className="text-slate-300 text-[10px] md:text-sm mb-4 font-medium relative z-10">Пропонуємо стратегічне партнерство та статус соціально-відповідальної компанії.</p>
                 <div className="flex flex-col gap-2 relative z-10">
                   <button onClick={onOpenPresentation} className="w-full py-3 bg-white text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-50 transition active:scale-95 flex items-center justify-center gap-2"><PlayCircle size={16} /> Презентація</button>
                   <a href="mailto:info@social-map.ua" className="w-full py-3 bg-teal-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-700 transition text-center active:scale-95 flex items-center justify-center gap-2"><Mail size={16} /> Зв'язатися</a>
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'donate' && (
             <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
               <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-[2rem] p-5 md:p-7 text-white shadow-xl relative overflow-hidden border border-white/20">
                 <div className="absolute right-[-30px] top-[-30px] opacity-10 rotate-12"><Laptop size={150} /></div>
                 <h3 className="text-lg md:text-2xl font-black mb-3 leading-tight uppercase relative z-10">Підтримка проекту</h3>
                 <p className="text-[10px] md:text-sm text-white/90 font-medium mb-6 relative z-10">Кожен внесок допомагає нам утримувати сервери та актуалізувати базу послуг для людей, що потребують допомоги.</p>
                 <button onClick={() => window.open(MONO_JAR_URL, '_blank')} className="w-full py-4 bg-white text-rose-600 font-black uppercase text-[10px] md:text-xs rounded-xl hover:bg-rose-50 transition active:scale-95">Підтримати проект</button>
               </div>
             </div>
           )}

           {activeTab === 'legal' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center"><Scale size={18} /></div>
                    <h3 className="font-black text-sm uppercase tracking-tight">Юридична інформація</h3>
                  </div>
                  <div className="space-y-4 text-[10px] md:text-xs text-slate-600 leading-relaxed font-medium">
                    <p>Продукт охороняється законодавством України. Власник та засновник: <strong>Чернов Ілля Володимирович</strong> (РНОКПП: 3272112876).</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                       <button onClick={onOpenPrivacy} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 transition-all group">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all"><Shield size={14} /></div>
                             <span className="font-black text-[9px] uppercase tracking-widest text-left">Політика конфіденційності</span>
                          </div>
                          <ArrowRight size={12} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                       </button>

                       <button onClick={onOpenTerms} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 transition-all group">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><FileText size={14} /></div>
                             <span className="font-black text-[9px] uppercase tracking-widest text-left">Умови обслуговування</span>
                          </div>
                          <ArrowRight size={12} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                       </button>

                       <div className="p-4 bg-white rounded-2xl border border-slate-200 col-span-1 sm:col-span-2">
                          <div className="flex items-center gap-2 mb-2 text-indigo-700">
                            <Terminal size={14} />
                            <span className="font-black text-[9px] uppercase tracking-widest">Technical Architecture</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <p className="text-[9px] font-bold text-slate-500">Architecture Style: <span className="text-slate-900">REST API / Live SDK</span></p>
                            <p className="text-[9px] font-bold text-slate-500">Build ID: <span className="font-mono text-slate-900">{BUILD_HASH.substring(0,8)}</span></p>
                          </div>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <p className="font-black text-slate-800 uppercase mb-2">Обмеження:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Заборонено комерційне використання та перепродаж.</li>
                        <li>Заборонено реверс-інжиніринг ШІ-алгоритмів.</li>
                        <li>Дані надаються «Як є» (AS IS).</li>
                      </ul>
                    </div>
                  </div>
                </div>
             </div>
           )}
        </div>

        <div className="p-4 md:p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-2 md:gap-3 bg-slate-50/50 shrink-0">
           <button onClick={handleShare} className="flex-1 py-3.5 bg-white text-teal-700 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-teal-50 transition flex items-center justify-center gap-2 border border-slate-200 active:scale-95 shadow-sm"><Share2 size={16} /> Поділитися</button>
           <a href={GITHUB_URL} target="_blank" className="flex-1 py-3.5 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-800 transition flex items-center justify-center gap-2 active:scale-95 shadow-lg"><Github size={16} /> GitHub</a>
        </div>
      </div>
    </div>
  );
};
