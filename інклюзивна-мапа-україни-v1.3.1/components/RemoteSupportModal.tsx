import React, { useState } from 'react';
import { Phone, Search, X, Headphones, Scale, Info, ShieldAlert, PhoneForwarded, Globe } from 'lucide-react';
import { REMOTE_SUPPORT_ACTORS } from '../constants';

interface RemoteSupportModalProps {
  onClose: () => void;
}

export const RemoteSupportModal: React.FC<RemoteSupportModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Derive categories
  const categories = ['All', ...Array.from(new Set(REMOTE_SUPPORT_ACTORS.map(a => a.category)))];

  const filteredActors = REMOTE_SUPPORT_ACTORS.filter(actor => {
    const matchesSearch = actor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          actor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || actor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    if (category.includes('Юридична')) return <Scale className="w-4 h-4" />;
    if (category.includes('Психологічна')) return <Headphones className="w-4 h-4" />;
    if (category.includes('насиль')) return <ShieldAlert className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-teal-700 p-6 text-white flex justify-between items-start shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <PhoneForwarded className="w-6 h-6" />
              Дистанційна підтримка будь-де
            </h2>
            <p className="text-teal-100 mt-1 opacity-90">
              Гарячі лінії, юридичні консультації та психологічна допомога онлайн
            </p>
          </div>
          <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук служби..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors border ${
                  selectedCategory === cat 
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'All' ? 'Всі категорії' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActors.map(actor => (
              <div key={actor.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-200 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                    actor.category.includes('Юридична') ? 'bg-blue-50 text-blue-700' :
                    actor.category.includes('Психологічна') ? 'bg-purple-50 text-purple-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {getCategoryIcon(actor.category)}
                    {actor.category}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 mb-2">{actor.name}</h3>
                <p className="text-sm text-slate-600 mb-4 flex-1">{actor.description}</p>
                
                <div className="mt-auto space-y-2 pt-3 border-t border-slate-100">
                   {/* Website / Online Chat Button */}
                   {actor.website && (
                     <a 
                       href={actor.website}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors shadow-sm"
                     >
                       <Globe className="w-4 h-4" />
                       Сайт / Чат
                     </a>
                   )}

                   {/* Phones */}
                   {actor.phones.map((phone, idx) => (
                     <a 
                       key={idx}
                       href={`tel:${phone.replace(/[^\d+]/g, '')}`} 
                       className="flex items-center justify-center gap-2 w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-lg transition-colors border border-teal-200"
                     >
                       <Phone className="w-4 h-4" />
                       {phone}
                     </a>
                   ))}
                </div>
              </div>
            ))}

            {filteredActors.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Нічого не знайдено за вашим запитом</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};