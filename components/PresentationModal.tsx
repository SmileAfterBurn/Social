
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Target, Users, Zap, ShieldCheck, Laptop, Heart, TrendingUp, Globe, Award, ExternalLink, Mail, Code, BarChart3 } from 'lucide-react';

interface PresentationModalProps {
  onClose: () => void;
}

const SLIDES = [
  {
    id: 'intro',
    title: "Екосистема солідарності",
    subtitle: "Інклюзивна мапа послуг v1.3",
    content: "Цифровий щит України. Ми об'єднуємо державні служби, волонтерські хаби та міжнародні фонди в єдиний інтелектуальний інтерфейс.",
    icon: <Heart className="w-12 h-12 md:w-16 md:h-16 text-rose-500" fill="currentColor" />,
    gradient: "from-teal-600 to-emerald-700"
  },
  {
    id: 'stats',
    title: "Масштаб та охоплення",
    subtitle: "Проект у цифрах",
    content: "Реєстр, що живе. Ми щоденно верифікуємо дані за допомогою ШІ, щоб кожна точка на мапі була актуальною.",
    icon: <BarChart3 className="w-12 h-12 md:w-16 md:h-16 text-teal-400" />,
    stats: [
      { label: "Організацій", value: "5200+" },
      { label: "Регіонів", value: "Вся Україна" },
      { label: "Час відгуку", value: "<1 сек" }
    ],
    gradient: "from-teal-700 to-blue-800"
  },
  {
    id: 'tech',
    title: "Технологічний стек",
    subtitle: "AI-First підхід",
    content: "Ми використовуємо передові моделі Gemini 3 Pro (Deep Thinking) для складних аналітик та Live API для голосового доступу.",
    icon: <Code className="w-12 h-12 md:w-16 md:h-16 text-indigo-400" />,
    gradient: "from-indigo-600 to-blue-900"
  },
  {
    id: 'impact',
    title: "Інклюзивність 100%",
    subtitle: "Доступ для кожного",
    content: "Голосовий інтерфейс Пані Думки дозволяє літнім людям та особам з порушеннями зору отримувати допомогу без бар'єрів.",
    icon: <Users className="w-12 h-12 md:w-16 md:h-16 text-yellow-400" />,
    gradient: "from-slate-800 to-slate-900"
  },
  {
    id: 'needs',
    title: "Потреби проекту",
    subtitle: "Підтримайте розвиток",
    content: "Для стабільної роботи ШІ та масштабування на деокуповані території нам критично потрібне оновлення обчислювальної бази.",
    icon: <Laptop className="w-12 h-12 md:w-16 md:h-16 text-rose-400" />,
    goal: "158 000.00 ₴",
    gradient: "from-rose-600 to-rose-800"
  },
  {
    id: 'partnership',
    title: "Станьте партнером",
    subtitle: "Соціальна відповідальність",
    content: "Ваша компанія може стати офіційним партнером мапи, допомагаючи тисячам українців знайти шлях до безпеки.",
    icon: <Award className="w-12 h-12 md:w-16 md:h-16 text-amber-400" />,
    gradient: "from-slate-900 to-indigo-900"
  }
];

export const PresentationModal: React.FC<PresentationModalProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const nextSlide = () => setCurrentSlide(prev => (prev < SLIDES.length - 1 ? prev + 1 : prev));
  const prevSlide = () => setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));

  const slide = SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-[7000] bg-slate-900 flex items-center justify-center overflow-hidden font-sans">
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-700 opacity-90`}></div>
      
      <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 z-[7001] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all">
        <X size={20} className="md:w-6 md:h-6" />
      </button>

      <div className="absolute top-0 left-0 w-full h-1.5 flex gap-1 z-[7001]">
        {SLIDES.map((_, idx) => (
          <div key={idx} className={`flex-1 h-full transition-all duration-500 ${idx <= currentSlide ? 'bg-white' : 'bg-white/20'}`} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 md:px-8 flex flex-col items-center text-center text-white">
        <div className="mb-4 md:mb-8 animate-in zoom-in fade-in duration-700">{slide.icon}</div>
        <h3 className="text-xs md:text-xl font-black uppercase tracking-[0.2em] text-white/60 mb-2 animate-in slide-in-from-top-4 duration-500">
          {slide.subtitle}
        </h3>
        <h2 className="text-3xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-8 tracking-tight animate-in slide-in-from-bottom-4 duration-700">
          {slide.title}
        </h2>
        <p className="text-sm md:text-2xl lg:text-3xl font-medium max-w-3xl leading-relaxed text-white/90 animate-in fade-in duration-1000 delay-200">
          {slide.content}
        </p>

        {slide.stats && (
          <div className="grid grid-cols-3 gap-3 md:gap-8 mt-8 md:mt-12 w-full max-w-2xl animate-in fade-in zoom-in duration-700 delay-500">
            {slide.stats.map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-md p-3 md:p-6 rounded-2xl md:rounded-3xl border border-white/10">
                <div className="text-lg md:text-4xl font-black mb-1">{s.value}</div>
                <div className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {slide.goal && (
          <div className="mt-8 md:mt-12 bg-white text-rose-600 px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-3xl shadow-2xl animate-in bounce-in duration-700 delay-500">
             <div className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] mb-1">Ціль збору на обладнання</div>
             <div className="text-2xl md:text-5xl font-black">{slide.goal}</div>
          </div>
        )}

        {currentSlide === SLIDES.length - 1 && (
          <div className="flex flex-col md:flex-row gap-3 mt-8 md:mt-12 w-full max-w-md md:max-w-none animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <button onClick={() => window.open('https://send.monobank.ua/jar/3upLLMPr6P', '_blank')} className="px-6 py-4 md:px-10 md:py-5 bg-white text-slate-900 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-teal-50 transition-all flex items-center justify-center gap-2 shadow-xl">
              <Heart className="w-4 h-4 text-rose-500" fill="currentColor" /> Підтримати проект
            </button>
            <a href="mailto:info@social-map.ua" className="px-6 py-4 md:px-10 md:py-5 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> Стати партнером
            </a>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 md:bottom-12 left-0 w-full px-6 md:px-12 flex justify-between items-center z-[7001]">
        <button onClick={prevSlide} disabled={currentSlide === 0} className={`p-3 md:p-4 rounded-full border border-white/20 transition-all ${currentSlide === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 active:scale-90'}`}>
          <ChevronLeft className="text-white w-6 h-6 md:w-8 md:h-8" />
        </button>
        <div className="text-white/40 text-[10px] md:text-sm font-black tracking-widest">{currentSlide + 1} / {SLIDES.length}</div>
        <button onClick={nextSlide} disabled={currentSlide === SLIDES.length - 1} className={`p-3 md:p-4 rounded-full border border-white/20 transition-all ${currentSlide === SLIDES.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 active:scale-90'}`}>
          <ChevronRight className="text-white w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>
    </div>
  );
};
