import React, { useState } from 'react';
import { X, Send, AlertCircle, FileText, CheckCircle, ExternalLink, ArrowRight, Copy } from 'lucide-react';
import { Organization } from '../types';
import { REFERRAL_DRIVE_URL } from '../constants';

interface ReferralModalProps {
  organization: Organization;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ organization, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [archiveFileName, setArchiveFileName] = useState('');
  
  const [formData, setFormData] = useState({
    priority: 'Standard', // Standard vs Urgent
    clientName: '',
    clientPhone: '',
    clientDob: '',
    address: '',
    hasConsent: false,
    needs: [] as string[],
    notes: ''
  });

  const needsOptions = [
    'Юридична допомога', 'Психосоціальна підтримка', 'Кейс-менеджмент', 
    'Грошова допомога', 'Житло/Прихисток', 'Гуманітарна допомога',
    'Медична допомога', 'Захист дітей', 'Евакуація'
  ];

  const toggleNeed = (need: string) => {
    setFormData(prev => ({
      ...prev,
      needs: prev.needs.includes(need) 
        ? prev.needs.filter(n => n !== need)
        : [...prev.needs, need]
    }));
  };

  // Logic to generate the specific Case ID: Initials + DOB Digits + City Letter
  const generateCaseId = (name: string, dob: string, address: string) => {
    // 1. Initials (First letter of Name and Surname)
    const nameParts = name.trim().split(/\s+/);
    let initials = '';
    if (nameParts.length > 0) initials += nameParts[0][0] || '';
    if (nameParts.length > 1) initials += nameParts[1][0] || '';
    initials = initials.toUpperCase();

    // 2. Digits of DOB (Remove dashes/dots)
    const dobDigits = dob.replace(/\D/g, '');

    // 3. First Letter of City
    // Try to find "м. City" or just take first letter of address
    const cityMatch = address.match(/[мc]\.\s*([А-Яа-яІіЇїЄєA-Za-z]+)/);
    let cityLetter = 'X';
    if (cityMatch && cityMatch[1]) {
      cityLetter = cityMatch[1][0].toUpperCase();
    } else if (address.length > 0) {
      cityLetter = address.trim()[0].toUpperCase();
    }

    return `${initials}${dobDigits}${cityLetter}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate the coded ID
    const caseId = generateCaseId(formData.clientName, formData.clientDob, formData.address);
    setGeneratedCode(caseId);

    // Generate the descriptive filename for the Archive (Region_Date_Partner)
    const today = new Date().toISOString().split('T')[0];
    const regionName = organization.region || 'Region';
    const descriptiveName = `${regionName}_${today}_${organization.name.replace(/["\s]/g, '_')}`;
    setArchiveFileName(descriptiveName);

    // Construct Email Body
    const subject = `Запит на допомогу: ${caseId}`; // Standard subject with ID
    
    const body = `
КОД СПРАВИ: ${caseId}
(Код згенеровано: перші літери ПІБ + дата народження + літера міста)

МІЖВІДОМЧА ФОРМА ПЕРЕНАПРАВЛЕННЯ

ДО ОРГАНІЗАЦІЇ: ${organization.name}
ПРІОРИТЕТ: ${formData.priority === 'Urgent' ? 'ТЕРМІНОВО (24 год)' : 'Стандартно (3-5 днів)'}

--- ДАНІ КЛІЄНТА ---
ПІБ: ${formData.clientName}
Телефон: ${formData.clientPhone}
Дата народження: ${formData.clientDob}
Адреса: ${formData.address}

--- ПОТРЕБИ ---
${formData.needs.join(', ')}

--- ДОДАТКОВІ ПРИМІТКИ ---
${formData.notes}

--- ЗГОДА ---
[x] Я підтверджую, що клієнт надав згоду на передачу цієї інформації для отримання допомоги.
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:${organization.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.open(mailtoLink, '_blank');
    setIsSubmitted(true);
  };

  const copyFileName = () => {
    navigator.clipboard.writeText(archiveFileName);
    alert('Назву файлу скопійовано!');
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-[6000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 animate-in fade-in zoom-in duration-200 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Лист сформовано!</h2>
          <p className="text-slate-600 mb-4">
            Ваш поштовий клієнт відкрився автоматично.
          </p>
          
          <div className="bg-slate-100 p-3 rounded mb-6 font-mono text-sm border border-slate-200">
            <strong>Код справи в листі:</strong> <span className="text-teal-700">{generatedCode}</span>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              Архівування на Drive
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Збережіть копію форми у папку архіву, використовуючи цю назву:
            </p>
            
            <div className="flex gap-2 mb-3">
              <input 
                readOnly 
                value={archiveFileName} 
                className="w-full text-xs p-2 border border-blue-200 rounded bg-white text-slate-600"
              />
              <button 
                onClick={copyFileName}
                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
                title="Скопіювати назву"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <a 
              href={REFERRAL_DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full p-3 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors group"
            >
              <span className="font-medium text-blue-900">Відкрити папку архіву</span>
              <ExternalLink className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2"
          >
            <span>Завершити роботу</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-800 text-white p-5 flex justify-between items-start rounded-t-xl shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              Запит на перенаправлення
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              Отримувач: <span className="font-bold text-white">{organization.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Priority */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <span className="block text-sm font-bold text-slate-700 mb-2">Пріоритет реагування:</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="priority" 
                  value="Standard"
                  checked={formData.priority === 'Standard'}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span>Стандартно (3-5 днів)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="priority" 
                  value="Urgent"
                  checked={formData.priority === 'Urgent'}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="text-red-600 font-bold">Терміново (24 год)</span>
              </label>
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ПІБ Клієнта *</label>
              <input 
                required
                type="text" 
                placeholder="Прізвище Ім'я"
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                value={formData.clientName}
                onChange={e => setFormData({...formData, clientName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Телефон *</label>
              <input 
                required
                type="tel" 
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                value={formData.clientPhone}
                onChange={e => setFormData({...formData, clientPhone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Дата народження *</label>
              <input 
                required
                type="date" 
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                value={formData.clientDob}
                onChange={e => setFormData({...formData, clientDob: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Адреса проживання (Місто) *</label>
              <input 
                required
                type="text" 
                placeholder="м. Одеса, вул..."
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          {/* Needs */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Потреба у послузі / допомозі:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {needsOptions.map(need => (
                <label key={need} className="flex items-center gap-2 text-sm p-2 border rounded hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.needs.includes(need)}
                    onChange={() => toggleNeed(need)}
                    className="rounded text-teal-600 focus:ring-teal-500" 
                  />
                  {need}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Короткий опис ситуації / Примітки</label>
            <textarea 
              rows={3}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Опишіть деталі, які важливо знати приймаючій організації..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          {/* Consent */}
          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start border border-blue-100">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-sm">
                <input 
                  required
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={formData.hasConsent}
                  onChange={e => setFormData({...formData, hasConsent: e.target.checked})}
                />
                Я підтверджую отримання згоди від клієнта
              </label>
              <p className="text-xs text-slate-600 mt-1">
                Я пояснив процедуру перенаправлення клієнту і отримав дозвіл на передачу його персональних даних цій організації.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
            >
              Скасувати
            </button>
            <button 
              type="submit"
              disabled={!formData.hasConsent}
              className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-4 h-4" />
              Сформувати лист
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};