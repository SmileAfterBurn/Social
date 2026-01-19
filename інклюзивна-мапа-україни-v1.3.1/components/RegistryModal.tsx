
import React, { useState, useMemo } from 'react';
import { X, Search, Building2, Database, Download, Terminal, Lock, Wallet, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Organization, UserSession } from '../types';
import { REGION_CONFIG, DRIVE_URL } from '../constants';

interface RegistryModalProps {
  organizations: Organization[];
  onClose: () => void;
  user: UserSession;
}

const ITEMS_PER_PAGE = 50;

export const RegistryModal: React.FC<RegistryModalProps> = ({ organizations, onClose, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const isPrivileged = user.role === 'Admin' || user.role === 'Manager';
  const canExport = user.role !== 'Guest';

  const filteredData = useMemo(() => {
    return organizations.filter(org => 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizations, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handleDownloadCSV = () => {
    if (!canExport) return;
    const headers = ['ID', 'Назва', 'Регіон', 'Адреса', 'Телефон', 'Категорія'];
    if (isPrivileged) headers.push('Бюджет');
    
    const csvContent = [
      headers.join(','),
      ...filteredData.map(org => {
        const regionLabel = REGION_CONFIG[org.region]?.label || org.region;
        const row = [
          org.id,
          `"${org.name.replace(/"/g, '""')}"`,
          `"${regionLabel}"`,
          `"${org.address.replace(/"/g, '""')}"`,
          `"${org.phone}"`,
          `"${org.category}"`
        ];
        if (isPrivileged) row.push(org.budget.toString());
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registry_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-2 md:p-6 font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-7xl h-full md:h-[90vh] flex flex-col overflow-hidden animate-in-dialog border border-white/10">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white shrink-0 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-900/50">
              <Database size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black uppercase tracking-tight">Глобальний Реєстр</h2>
                <div className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-[8px] font-black tracking-widest text-teal-400 flex items-center gap-1">
                  <Terminal size={10} /> {user.role}
                </div>
              </div>
              <p className="text-teal-400/60 text-[10px] font-black uppercase tracking-widest">
                Всього в базі: {organizations.length} записів
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10">
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Пошук за назвою, областю, адресою..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              disabled={!canExport}
              onClick={handleDownloadCSV}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shadow-lg w-full md:w-auto justify-center border ${
                canExport ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <Download size={14} /> Експорт CSV
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-x-auto custom-scrollbar bg-slate-100 dark:bg-slate-950">
          <table className="w-full border-collapse min-w-[1000px]" role="grid">
            <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-4 text-left">Організація</th>
                <th className="p-4 text-left">Область</th>
                <th className="p-4 text-left">Контакти</th>
                <th className="p-4 text-right">Статус / Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedData.map((org) => (
                <tr key={org.id} className="hover:bg-white dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-800">
                        <Building2 size={18} />
                      </div>
                      <div className="max-w-[300px]">
                        <div className="font-black text-slate-800 dark:text-white text-sm truncate uppercase tracking-tight">{org.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase truncate">{org.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                      {REGION_CONFIG[org.region]?.label.replace(' область', '') || org.region}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{org.address}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400">{org.phone}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{org.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {isPrivileged ? (
                        <>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl text-indigo-700 dark:text-indigo-300">
                            <Wallet size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{org.budget} ₴</span>
                          </div>
                          <a href={DRIVE_URL} target="_blank" className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-teal-600 hover:text-white transition">
                            <FolderOpen size={16} />
                          </a>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-300 tracking-widest italic border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-xl">
                          <Lock size={12} /> Protected
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
              <Database size={64} className="opacity-10 mb-4" />
              <p className="font-black uppercase tracking-widest">Нічого не знайдено</p>
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Показано {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} з {filteredData.length}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-20 hover:bg-white dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">
              Стор. {currentPage} / {totalPages || 1}
            </div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-20 hover:bg-white dark:hover:bg-slate-800 transition"
            >
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
