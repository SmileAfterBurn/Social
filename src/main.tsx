import React, { useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { Analytics } from '@vercel/analytics/react';
import { MapView } from '../components/MapView';
import { TableView } from '../components/TableView';
import { FilterModal } from '../components/FilterModal';
import { Organization, RegionName, UserSession } from '../types';
import { INITIAL_ORGANIZATIONS } from '../organizations';

// Dummy user for TableView
const dummyUser: UserSession = {
  id: '1',
  name: 'Guest',
  role: 'Guest',
};

const App: React.FC = () => {
  const organizations: Organization[] = INITIAL_ORGANIZATIONS;

  const [filters, setFilters] = useState<{
    region: RegionName | '';
    services: string[];
    categories: string[];
  }>({ region: '', services: [], categories: [] });

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [view, setView] = useState<'map' | 'table'>('map');

  const categories = useMemo(() => {
    const allCategories = organizations.map(org => org.category);
    return [...new Set(allCategories)];
  }, [organizations]);

  const filteredOrganizations = useMemo(() => {
    let result = organizations;

    if (filters.region) {
      result = result.filter(org => org.region === filters.region);
    }

    if (filters.services.length > 0) {
      result = result.filter(org => filters.services.every(s => org.services.includes(s)));
    }

    if (filters.categories.length > 0) {
      result = result.filter(org => filters.categories.includes(org.category));
    }

    return result;
  }, [organizations, filters]);

  const handleSelectOrg = (id: string | null) => {
    setSelectedOrgId(id);
  };

  const handleShowOnMap = (id: string) => {
    setView('map');
    setSelectedOrgId(id);
  };

  const handleOpenReferral = (org: Organization) => {
    // Placeholder for future functionality
    console.log("Opening referral for:", org.name);
  };

  const handleToggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    setFilters(prevFilters => ({
        ...prevFilters,
        categories: newCategories,
    }));
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans">
      <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold">Інклюзивна карта України</h1>
        <div>
          <button onClick={() => setFilterModalOpen(true)} className="mr-2 p-2 bg-blue-600 rounded-lg">Фільтри</button>
          <button onClick={() => setView(v => v === 'map' ? 'table' : 'map')} className="p-2 bg-gray-700 rounded-lg">
            {view === 'map' ? 'Таблиця' : 'Карта'}
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {view === 'map' ? (
          <MapView
            organizations={filteredOrganizations}
            selectedOrgId={selectedOrgId}
            onSelectOrg={handleSelectOrg}
            onOpenReferral={handleOpenReferral}
          />
        ) : (
          <TableView
            organizations={filteredOrganizations}
            selectedOrgId={selectedOrgId}
            onSelectOrg={handleSelectOrg}
            user={dummyUser}
            onShowOnMap={handleShowOnMap}
          />
        )}
      </main>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        categories={categories}
        selectedCategories={filters.categories}
        onToggleCategory={handleToggleCategory}
      />
      <Analytics />
    </div>
  );
};

export default App;
