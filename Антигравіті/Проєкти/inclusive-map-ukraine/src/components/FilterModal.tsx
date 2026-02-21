import React from 'react';
import { X, Filter, Check } from 'lucide-react';
import { RegionName } from '../types';
import { REGION_CONFIG } from '../constants';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    selectedCategories: string[];
    onToggleCategory: (category: string) => void;
    selectedRegion: RegionName | '';
    onSelectRegion: (region: RegionName | '') => void;
    onReset: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    categories,
    selectedCategories,
    onToggleCategory,
    selectedRegion,
    onSelectRegion,
    onReset
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                            <Filter size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-slate-800">Фільтри</h2>
                            <p className="text-xs text-slate-500 font-medium">Налаштуйте пошук підтримки</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    <section>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Регіон</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => onSelectRegion('')}
                                className={`p-3 rounded-2xl text-xs font-bold border transition-all ${selectedRegion === '' ? 'bg-teal-600 text-white border-teal-600 shadow-lg' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                    }`}
                            >
                                Вся Україна
                            </button>
                            {Object.keys(REGION_CONFIG).filter(r => r !== 'All').map((region) => (
                                <button
                                    key={region}
                                    onClick={() => onSelectRegion(region as RegionName)}
                                    className={`p-3 rounded-2xl text-xs font-bold border transition-all ${selectedRegion === region ? 'bg-teal-600 text-white border-teal-600 shadow-lg' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                        }`}
                                >
                                    {REGION_CONFIG[region as RegionName].label.replace(' область', '')}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Категорії послуг</h3>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => {
                                const isSelected = selectedCategories.includes(category);
                                return (
                                    <button
                                        key={category}
                                        onClick={() => onToggleCategory(category)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        {isSelected && <Check size={14} />}
                                        {category}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={onReset}
                        className="flex-1 py-4 px-4 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
                    >
                        Скинути
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-[2] py-4 px-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95"
                    >
                        Застосувати
                    </button>
                </div>
            </div>
        </div>
    );
};
