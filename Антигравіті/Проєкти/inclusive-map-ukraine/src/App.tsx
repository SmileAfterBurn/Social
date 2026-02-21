import React, { useState, useMemo } from 'react';
import { MapView } from './components/MapView';
import { TableView } from './components/TableView';
import { GeminiChat } from './components/GeminiChat';
import { FilterModal } from './components/FilterModal';
import { INITIAL_ORGANIZATIONS } from './data/organizations';
import { REGION_CONFIG } from './constants';
import { Organization, RegionName, ViewMode } from './types';
import { Search, Map as MapIcon, List, MessageSquare, Filter, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [organizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Map);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState<{
    region: RegionName | '';
    categories: string[];
  }>({ region: '', categories: [] });

  const categories = useMemo(() => {
    return Array.from(new Set(organizations.map(org => org.category)));
  }, [organizations]);

  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => {
      const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.services.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = !filters.region || org.region === filters.region;
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(org.category);
      return matchesSearch && matchesRegion && matchesCategory;
    });
  }, [organizations, searchQuery, filters]);

  const handleSelectOrg = (id: string | null) => {
    setSelectedOrgId(id);
    if (id && viewMode === ViewMode.Grid) setViewMode(ViewMode.Map);
  };

  const handleToggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const currentRegionLabel = filters.region ? REGION_CONFIG[filters.region].label : 'Вся Україна';

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4 z-[100] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-lg leading-none text-slate-800 uppercase tracking-tight">Інклюзивна Мапа</h1>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Project Ukraine</span>
          </div>
        </div>

        <div className="flex-1 max-w-xl relative group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm font-medium"
            placeholder="Пошук допомоги (пр. Карітас, гуманітарка...)"
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsFilterOpen(true)} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95 relative">
            <Filter size={20} />
            {(filters.region || filters.categories.length > 0) && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full" />}
          </button>
          <div className="h-8 w-px bg-slate-200 mx-1" />
          <button
            onClick={() => setViewMode(viewMode === ViewMode.Map ? ViewMode.Grid : ViewMode.Map)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
          >
            {viewMode === ViewMode.Map ? <><List size={16} /> Список</> : <><MapIcon size={16} /> Карта</>}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex overflow-hidden">
        <div className="flex-1">
          {viewMode === ViewMode.Map ? (
            <MapView
              organizations={filteredOrganizations}
              selectedOrgId={selectedOrgId}
              onSelectOrg={handleSelectOrg}
              center={filters.region ? REGION_CONFIG[filters.region].center : undefined}
              zoom={filters.region ? REGION_CONFIG[filters.region].zoom : undefined}
            />
          ) : (
            <TableView
              organizations={filteredOrganizations}
              selectedOrgId={selectedOrgId}
              onSelectOrg={handleSelectOrg}
            />
          )}
        </div>

        {/* Info Header Overlay */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[400] flex flex-col items-center gap-2 pointer-events-none">
          <div className="px-6 py-2 bg-white/90 backdrop-blur-md border border-white shadow-2xl rounded-full flex items-center gap-3 pointer-events-auto">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{currentRegionLabel}</span>
            <span className="w-px h-3 bg-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">{filteredOrganizations.length} об'єктів</span>
          </div>
        </div>

        {/* Floating AI Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="absolute bottom-6 right-6 z-[450] flex items-center gap-3 px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-2xl shadow-teal-200 transition-all active:scale-95 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="font-black uppercase text-sm tracking-widest">Пані Думка</span>
        </button>
      </main>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        selectedCategories={filters.categories}
        onToggleCategory={handleToggleCategory}
        selectedRegion={filters.region}
        onSelectRegion={(r) => setFilters(prev => ({ ...prev, region: r }))}
        onReset={() => setFilters({ region: '', categories: [] })}
      />

      <GeminiChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        organizations={organizations}
      />
    </div>
  );
};

export default App;
