
import React from 'react';
import { X, ShieldCheck, Lock, Eye, Server, Globe, UserCheck, Scale } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[7500] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-2 md:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-3xl h-full md:h-[85vh] flex flex-col overflow-hidden animate-in-dialog border border-white/20">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Політика конфіденційності</h2>
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Версія 1.1 (UA)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
          <section>
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              <Eye size={18} className="text-teal-500" /> 1. Загальні положення
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Ми поважаємо вашу приватність. "Інклюзивна мапа" створена для допомоги, а не для стеження. Цей документ пояснює, які дані ми використовуємо для роботи сервісів Google Maps та Gemini AI.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-black text-[10px] text-teal-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Globe size={14} /> Геолокація
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ми запитуємо доступ до ваших координат виключно для того, щоб показати найближчі пункти допомоги на мапі. Ваше місцезнаходження не зберігається на наших серверах після закриття сесії.
              </p>
            </div>
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-black text-[10px] text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Server size={14} /> Голосові дані (AI)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                При використанні голосового чату з Пані Думкою, аудіопотік передається в Google Gemini API для обробки. Дані передаються в зашифрованому вигляді та використовуються тільки для генерації відповіді.
              </p>
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              <Lock size={18} className="text-teal-500" /> 2. Використання сторонніх сервісів
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4">
              Додаток інтегрований з технологіями Google. Використовуючи мапу або чат, ви також погоджуєтесь з політиками конфіденційності Google:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center shrink-0">G</div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase">Google Maps API</p>
                  <p className="text-[9px] text-slate-400">Візуалізація картографічних даних</p>
                </div>
              </li>
              <li className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
                <div className="w-8 h-8 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-lg flex items-center justify-center shrink-0">AI</div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase">Google Gemini (GenAI)</p>
                  <p className="text-[9px] text-slate-400">Інтелектуальний аналіз та обробка мовлення</p>
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              <UserCheck size={18} className="text-teal-500" /> 3. Ваші права
            </h3>
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <p>Згідно з Законом України "Про захист персональних даних", ви маєте право:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Відкликати згоду на використання геолокації у налаштуваннях браузера.</li>
                <li>Вимагати видалення ваших сесійних даних (очистити LocalStorage додатку).</li>
                <li>Знати, як ми обробляємо ваші дані (цей документ).</li>
              </ul>
            </div>
          </section>

          <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-start gap-4 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                <Scale size={20} className="text-amber-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-black text-[10px] text-amber-700 uppercase tracking-widest mb-1">Юридична відповідальність</h4>
                  <p className="text-[10px] text-amber-900/70 dark:text-amber-400 font-medium leading-relaxed">
                    Власник сервісу (Чернов Ілля Володимирович) не несе відповідальності за конфіденційність даних, які ви самостійно передаєте організаціям через телефонні дзвінки або електронні листи.
                  </p>
                </div>
             </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 dark:bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};
