import React from 'react';
import { Type, Contrast, Eye } from 'lucide-react';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  textSize: 'normal' | 'large' | 'xl';
  onTextSizeChange: (size: 'normal' | 'large' | 'xl') => void;
  highContrast: boolean;
  onHighContrastToggle: () => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isOpen,
  onClose,
  textSize,
  onTextSizeChange,
  highContrast,
  onHighContrastToggle
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <Eye className="text-teal-600 dark:text-teal-400" size={24} />
          </div>
          <h2 id="accessibility-title" className="text-2xl font-black text-slate-800 dark:text-white">
            Доступність
          </h2>
        </div>

        <div className="space-y-6">
          {/* Text Size Control */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
              <Type size={16} />
              Розмір тексту
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'normal' as const, label: 'Звичайний' },
                { value: 'large' as const, label: 'Великий' },
                { value: 'xl' as const, label: 'Дуже великий' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => onTextSizeChange(option.value)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    textSize === option.value
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  aria-pressed={textSize === option.value}
                  aria-label={`Встановити ${option.label.toLowerCase()} розмір тексту`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
              <Contrast size={16} />
              Висока контрастність
            </label>
            <button
              onClick={onHighContrastToggle}
              className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                highContrast
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              aria-pressed={highContrast}
              aria-label={highContrast ? 'Вимкнути високу контрастність' : 'Увімкнути високу контрастність'}
            >
              {highContrast ? 'Увімкнено' : 'Вимкнено'}
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              💡 Ці налаштування покращують читабельність та зручність використання для людей з вадами зору.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all"
          aria-label="Закрити панель доступності"
        >
          Закрити
        </button>
      </div>
    </div>
  );
};
