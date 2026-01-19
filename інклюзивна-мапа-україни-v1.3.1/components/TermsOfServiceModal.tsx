
import React from 'react';
import { X, Scale, FileText, AlertCircle, Info, Hammer, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface TermsOfServiceModalProps {
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[7600] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-2 md:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-3xl h-full md:h-[85vh] flex flex-col overflow-hidden animate-in-dialog border border-white/20">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Умови обслуговування</h2>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Публічна оферта v1.0 (UA)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
          <section className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
            <h3 className="flex items-center gap-2 text-sm font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-3">
              <Info size={18} /> 1. Прийняття умов
            </h3>
            <p className="text-sm text-indigo-800/80 dark:text-indigo-400 leading-relaxed font-medium">
              Використовуючи веб-застосунок «Інклюзивна мапа», ви погоджуєтеся з цими Умовами обслуговування. Якщо ви не згодні з будь-яким положенням, ви повинні припинити використання сервісу.
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              <Hammer size={18} className="text-teal-500" /> 2. Опис сервісу
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4">
              Сервіс надає доступ до візуалізованого реєстру соціальних організацій України та інтелектуального асистента на базі Google Gemini AI.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">Пошук організацій</span>
              </div>
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">ШІ-консультації</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              <ShieldAlert size={18} className="text-rose-500" /> 3. Обмеження відповідальності (ШІ)
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Ви визнаєте, що відповіді асистента "Пані Думка" генеруються штучним інтелектом і можуть бути неточними або містити фактичні помилки.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-slate-500 font-bold uppercase tracking-tighter">
                <li>ШІ не є заміною професійної юридичної або медичної консультації.</li>
                <li>Власник сервісу не несе відповідальності за дії користувачів, вчинені на основі відповідей ШІ.</li>
                <li>Використання голосового режиму вимагає стабільного інтернет-з'єднання.</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              <Scale size={18} className="text-teal-500" /> 4. Інтелектуальна власність
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Весь контент, код та алгоритми є власністю <strong>Чернова Іллі Володимировича</strong>. Некомерційне поширення дозволяється лише за умови збереження посилання на оригінал та вказівки авторства.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-start gap-4 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-black text-[10px] text-amber-700 uppercase tracking-widest mb-1">Важлива примітка</h4>
                  <p className="text-[10px] text-amber-900/70 dark:text-amber-400 font-medium leading-relaxed">
                    Сервіс надається за принципом «ЯК Є» (AS IS). Ми докладаємо зусиль для верифікації даних, але не гарантуємо, що кожна організація у базі на цей момент має вільні місця або ресурси для допомоги.
                  </p>
                </div>
             </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Приймаю умови
          </button>
        </div>
      </div>
    </div>
  );
};
