
import React, { useEffect, useRef } from 'react';
import { Organization, UserSession } from '../types';
import { MapPin, Phone, Mail, ChevronRight, Clock, Sparkles, Lock, ShieldCheck } from 'lucide-react';

interface TableViewProps {
  organizations: Organization[];
  selectedOrgId: string | null;
  onSelectOrg: (id: string) => void;
  onVerifyOrgAI?: (org: Organization) => void;
  isDarkMode?: boolean;
  user: UserSession;
}

export const TableView: React.FC<TableViewProps> = ({ 
  organizations, 
  selectedOrgId, 
  onSelectOrg,
  onVerifyOrgAI,
  isDarkMode = false,
  user
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const canVerify = user.role === 'Admin';

  useEffect(() => {
    if (selectedOrgId && tableContainerRef.current) {
      const selectedRow = tableContainerRef.current.querySelector(`[data-id="${selectedOrgId}"]`);
      if (selectedRow) {
        selectedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedOrgId]);

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = listRef.current?.children[index + 1] as HTMLElement;
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = listRef.current?.children[index - 1] as HTMLElement;
      prev?.focus();
    }
  };

  return (
    <div 
      className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-300" 
      ref={tableContainerRef}
      role="region"
      aria-label="Реєстр доступних організацій"
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-4" tabIndex={-1}>
        <ul 
          ref={listRef}
          className="divide-y divide-slate-100 dark:divide-slate-800" 
          role="list"
        >
          {organizations.map((org, index) => {
            const isSelected = selectedOrgId === org.id;
            const cleanPhone = org.phone ? org.phone.replace(/[^\d+]/g, '') : '';

            return (
              <li
                key={org.id}
                data-id={org.id}
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectOrg(org.id);
                  }
                  handleKeyDown(e, index);
                }}
                onClick={() => onSelectOrg(org.id)}
                className={`cursor-pointer transition-all duration-200 group relative p-4 md:p-5 outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset ${isSelected ? 'bg-teal-50/50 dark:bg-teal-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                aria-selected={isSelected}
                aria-label={`${org.name}, Категорія: ${org.category}, Адреса: ${org.address}`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 dark:bg-teal-500 z-10" aria-hidden="true" />
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <h3 className={`font-black text-sm md:text-base leading-tight uppercase tracking-tight transition-colors ${isSelected ? 'text-teal-700 dark:text-teal-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {org.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border flex items-center gap-1 ${
                          org.status === 'Active' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200'
                        }`}>
                          {org.status === 'Active' && <ShieldCheck size={10} />}
                          {org.status === 'Active' ? 'Верифіковано' : 'Архів'}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 uppercase tracking-tighter">
                          {org.category}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 shrink-0 transition-transform ${isSelected ? 'text-teal-500 translate-x-1' : 'text-slate-300 group-hover:text-slate-400'}`} aria-hidden="true" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                      <span className="leading-tight font-medium">{org.address}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {org.phone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest hover:border-teal-400 transition-all shadow-sm active:scale-95"
                          aria-label={`Зателефонувати в ${org.name}: ${org.phone}`}
                        >
                          <Phone size={12} aria-hidden="true" />
                          {org.phone}
                        </a>
                      )}
                      
                      <button
                        disabled={!canVerify}
                        onClick={(e) => { e.stopPropagation(); onVerifyOrgAI?.(org); }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                            canVerify ? 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                        }`}
                        aria-label={`Виконати ШІ-перевірку для ${org.name}`}
                      >
                        {canVerify ? <Sparkles size={12} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}
                        AI Перевірка
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
          
          {organizations.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-4 px-6" aria-live="polite">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-slate-300" aria-hidden="true" />
              </div>
              <div>
                <p className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Нічого не знайдено</p>
                <p className="text-xs text-slate-500 mt-1">Спробуйте змінити фільтри або запит у чаті.</p>
              </div>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};
