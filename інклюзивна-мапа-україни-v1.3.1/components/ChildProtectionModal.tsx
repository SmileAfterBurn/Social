import React from 'react';
import { X, Shield, Phone, AlertCircle, ExternalLink } from 'lucide-react';
import { Organization } from '../types';
import { REMOTE_SUPPORT_ACTORS } from '../constants';

interface ChildProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
}

export const ChildProtectionModal: React.FC<ChildProtectionModalProps> = ({
  isOpen,
  onClose,
  organizations
}) => {
  if (!isOpen) return null;

  // Filter child protection organizations
  const childProtectionOrgs = organizations.filter(org => org.isChildProtection);
  
  // Filter child protection hotlines
  const childProtectionHotlines = REMOTE_SUPPORT_ACTORS.filter(
    actor => actor.category === 'Захист дітей'
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="child-protection-title"
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6 rounded-t-3xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h2 id="child-protection-title" className="text-2xl font-black">
                Захист дітей
              </h2>
              <p className="text-sm text-white/80">Центри допомоги та гарячі лінії</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-xl transition-all"
            aria-label="Закрити вікно захисту дітей"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Emergency Alert */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-red-900 dark:text-red-300 mb-1">
                Екстрена ситуація?
              </h3>
              <p className="text-sm text-red-800 dark:text-red-400 mb-2">
                Якщо дитина в небезпеці, негайно телефонуйте:
              </p>
              <div className="flex flex-wrap gap-2">
                <a 
                  href="tel:102" 
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all inline-flex items-center gap-2"
                  aria-label="Зателефонувати в поліцію 102"
                >
                  <Phone size={14} />
                  102 (Поліція)
                </a>
                <a 
                  href="tel:116111" 
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all inline-flex items-center gap-2"
                  aria-label="Зателефонувати на дитячу гарячу лінію 116 111"
                >
                  <Phone size={14} />
                  116 111 (Дитяча гаряча лінія)
                </a>
              </div>
            </div>
          </div>

          {/* Hotlines Section */}
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Phone size={20} className="text-rose-500" />
              Національні гарячі лінії
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {childProtectionHotlines.map(hotline => (
                <div 
                  key={hotline.id}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
                >
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                    {hotline.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    {hotline.description}
                  </p>
                  <div className="space-y-2">
                    {hotline.phones.map((phone, idx) => (
                      <a
                        key={idx}
                        href={`tel:${phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
                        aria-label={`Зателефонувати на ${phone}`}
                      >
                        <Phone size={14} />
                        {phone}
                      </a>
                    ))}
                  </div>
                  {hotline.website && (
                    <a
                      href={hotline.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      aria-label={`Відвідати веб-сайт ${hotline.name}`}
                    >
                      <ExternalLink size={12} />
                      Веб-сайт
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Centers Section */}
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-rose-500" />
              Центри захисту дітей ({childProtectionOrgs.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {childProtectionOrgs.map(org => (
                <div 
                  key={org.id}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                      {org.name}
                    </h4>
                    {org.emergencyContact && (
                      <a
                        href={`tel:${org.emergencyContact.replace(/\s/g, '')}`}
                        className="shrink-0 p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                        aria-label={`Екстрений контакт ${org.emergencyContact}`}
                        title="Екстрений контакт"
                      >
                        <Phone size={12} />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    {org.address}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">
                    {org.services}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <a
                      href={`tel:${org.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold hover:text-rose-700 dark:hover:text-rose-300"
                      aria-label={`Зателефонувати в ${org.name}`}
                    >
                      <Phone size={12} />
                      {org.phone}
                    </a>
                    {org.workingHours && (
                      <span className="text-slate-500 dark:text-slate-500">
                        {org.workingHours}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
              Важлива інформація
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Усі звернення конфіденційні та безкоштовні</li>
              <li>Багато гарячих ліній працюють цілодобово</li>
              <li>Ви можете звернутися анонімно</li>
              <li>Фахівці надають психологічну та юридичну підтримку</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
