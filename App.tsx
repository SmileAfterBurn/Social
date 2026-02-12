
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Sparkles, MapPin, Sun, Moon, Globe, Heart, Database, PhoneForwarded, Key, ExternalLink, ArrowRight, User as UserIcon, Shield, Lock } from 'lucide-react';
import { MapView } from './components/MapView';
import { TableView } from './components/TableView';
import { GeminiChat } from './components/GeminiChat';
import { IntroModal } from './components/IntroModal';
import { RemoteSupportModal } from './components/RemoteSupportModal';
import { ReferralModal } from './components/ReferralModal';
import { AboutModal } from './components/AboutModal';
import { PresentationModal } from './components/PresentationModal';
import { RegistryModal } from './components/RegistryModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsOfServiceModal } from './components/TermsOfServiceModal';
import { INITIAL_ORGANIZATIONS, REGION_CONFIG } from './constants';
import { Organization, RegionName, UserSession, UserRole } from './types';

const App: React.FC = () => {
  const [organizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState<RegionName>('All');
  const [showIntro, setShowIntro] = useState(!localStorage.getItem('hide_intro_annotation'));
  const [isRemoteSupportOpen, setIsRemoteSupportOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [referralOrg, setReferralOrg] = useState<Organization | null>(null);
  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);
  const [mapKey, setMapKey] = useState(0); 
  
  // RBAC State
  const [currentUser, setCurrentUser] = useState<UserSession>({
    id: 'user_1',
    name: 'Гість',
    role: 'Guest'
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(selected);
      } else {
        setIsKeySelected(true); 
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setIsKeySelected(true);
      setMapKey(prev => prev + 1);
    }
  };

  const changeRole = (role: UserRole) => {
    const names: Record<UserRole, string> = {
      'Guest': 'Відвідувач',
      'Partner': 'Партнер проекту',
      'Manager': 'Кейс-менеджер',
      'Admin': 'Адміністратор Платформи'
    };
    setCurrentUser({ ...currentUser, role, name: names[role] });
    setIsProfileOpen(false);
  };

  const filteredOrgs = useMemo(() => {
    return organizations.filter(o => {
      if (activeRegion !== 'All' && o.region !== activeRegion) return false;
      const term = searchTerm.toLowerCase();
      return o.name.toLowerCase().includes(term) || o.address.toLowerCase().includes(term);
    });
  }, [organizations, activeRegion, searchTerm]);

  if (isKeySelected === false) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100 dark:border-slate-800 animate-in-dialog">
          <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-3xl flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-8 shadow-inner">
            <Key size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-4 uppercase tracking-tight">Потрібна активація</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            Для роботи мапи та інтелектуального пошуку необхідно підключити ваш Google Cloud Project з активованим Google Maps API та білінгом.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleSelectKey}
              className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-teal-500/20 active:scale-95"
            >
              Підключити проект <ArrowRight size={16} />
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-teal-600 transition flex items-center justify-center gap-2"
            >
              Документація по білінгу <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
      {showIntro && (
        <IntroModal 
          onComplete={() => setShowIntro(false)} 
          onOpenPrivacy={() => setIsPrivacyOpen(true)} 
          onOpenTerms={() => setIsTermsOpen(true)}
        />
      )}
      {isAboutOpen && (
        <AboutModal 
          onClose={() => setIsAboutOpen(false)} 
          onOpenPresentation={() => setIsPresentationOpen(true)} 
          onOpenPrivacy={() => setIsPrivacyOpen(true)} 
          onOpenTerms={() => setIsTermsOpen(true)}
        />
      )}
      {isPresentationOpen && <PresentationModal onClose={() => setIsPresentationOpen(false)} />}
      {isRegistryOpen && <RegistryModal organizations={organizations} user={currentUser} onClose={() => setIsRegistryOpen(false)} />}
      {isPrivacyOpen && <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} />}
      {isTermsOpen && <TermsOfServiceModal onClose={() => setIsTermsOpen(false)} />}
      {referralOrg && <ReferralModal organization={referralOrg} onClose={() => setReferralOrg(null)} />}
      {isRemoteSupportOpen && <RemoteSupportModal onClose={() => setIsRemoteSupportOpen(false)} />}

      <header className="h-16 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <Heart size={20} fill="currentColor" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-sm uppercase tracking-tight text-slate-800 dark:text-white leading-none">Інклюзивна Мапа</h1>
            <button onClick={() => setIsAboutOpen(true)} className="text-[10px] font-bold text-teal-600 uppercase flex items-center gap-1 mt-1">
              <MapPin size={10} /> {REGION_CONFIG[activeRegion].label}
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-8 relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Пошук допомоги..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/20 transition-all dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-2 p-2 pr-4 rounded-xl border transition-all ${
                currentUser.role === 'Admin' ? 'border-rose-200 bg-rose-50 text-rose-700' :
                currentUser.role === 'Manager' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' :
                currentUser.role === 'Partner' ? 'border-teal-200 bg-teal-50 text-teal-700' :
                'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                currentUser.role === 'Admin' ? 'bg-rose-500' :
                currentUser.role === 'Manager' ? 'bg-indigo-500' :
                currentUser.role === 'Partner' ? 'bg-teal-500' :
                'bg-slate-500'
              } text-white`}>
                <UserIcon size={16} />
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{currentUser.role}</div>
                <div className="text-xs font-bold leading-none">{currentUser.name}</div>
              </div>
            </button>
            
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-800 p-2 z-[100] animate-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 dark:border-slate-800 mb-2">Змінити роль</div>
                {(['Guest', 'Partner', 'Manager', 'Admin'] as UserRole[]).map(role => (
                   <button 
                    key={role} 
                    onClick={() => changeRole(role)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${currentUser.role === role ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/30' : 'text-slate-600 dark:text-slate-400'}`}
                   >
                     {role}
                     {role === 'Admin' && <Shield size={12} className="text-rose-500" />}
                     {currentUser.role === role && <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                   </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all hidden sm:flex">
            {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </button>
          
          <button onClick={() => setIsChatOpen(true)} className="px-5 py-2.5 bg-slate-900 dark:bg-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
             <Sparkles size={14} className="inline mr-2 text-teal-400 dark:text-white" /> AI Чат
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
          <div className="w-[450px] transition-all duration-500 hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-20 overflow-hidden">
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Результати: {filteredOrgs.length}</span>
                <button 
                  onClick={() => setIsRegistryOpen(true)} 
                  className="text-[10px] font-black uppercase text-teal-600 hover:underline flex items-center gap-1"
                >
                  <Database size={10} /> Реєстр
                </button>
             </div>
             <TableView organizations={filteredOrgs} selectedOrgId={selectedOrgId} onSelectOrg={setSelectedOrgId} user={currentUser} />
          </div>

          <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 h-full">
            <MapView 
              key={mapKey}
              organizations={filteredOrgs} 
              selectedOrgId={selectedOrgId} 
              onSelectOrg={setSelectedOrgId} 
              onOpenReferral={setReferralOrg}
              center={REGION_CONFIG[activeRegion].center as [number, number]}
              zoom={REGION_CONFIG[activeRegion].zoom}
              isDarkMode={isDarkMode}
              onResetKey={handleSelectKey}
            />
          </div>

          <GeminiChat 
            organizations={filteredOrgs} 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
            isDarkMode={isDarkMode}
            user={currentUser}
          />
      </main>

      <div className="md:hidden fixed bottom-8 left-8 right-8 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-3xl flex items-center justify-around z-[100] px-4">
        <button onClick={() => setMobileTab('map')} className={`p-2 ${mobileTab === 'map' ? 'text-teal-600' : 'text-slate-400'}`}><Globe size={24} /></button>
        <button onClick={() => setMobileTab('list')} className={`p-2 ${mobileTab === 'list' ? 'text-teal-600' : 'text-slate-400'}`}><Database size={24} /></button>
        <button onClick={() => setIsRemoteSupportOpen(true)} className="p-2 text-slate-400"><PhoneForwarded size={24} /></button>
        <button onClick={() => setIsChatOpen(true)} className="p-3 bg-teal-600 text-white rounded-2xl shadow-lg -translate-y-4 animate-bounce"><Sparkles size={24} /></button>
      </div>
    </div>
  );
};

export default App;
