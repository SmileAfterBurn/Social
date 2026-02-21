import React, { useEffect, useRef } from 'react';
import { Organization } from '../types';
import { MapPin, Phone, ChevronRight } from 'lucide-react';

interface TableViewProps {
    organizations: Organization[];
    selectedOrgId: string | null;
    onSelectOrg: (id: string | null) => void;
}

export const TableView: React.FC<TableViewProps> = ({
    organizations,
    selectedOrgId,
    onSelectOrg
}) => {
    const selectedRowRef = useRef<HTMLTableRowElement>(null);

    useEffect(() => {
        if (selectedOrgId && selectedRowRef.current) {
            selectedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedOrgId]);

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-3 font-bold tracking-wider">Організація та контакти</th>
                            <th className="px-4 py-3 font-bold tracking-wider hidden md:table-cell w-1/3">Послуги</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {organizations.map((org) => {
                            const isSelected = selectedOrgId === org.id;

                            return (
                                <tr
                                    key={org.id}
                                    ref={isSelected ? selectedRowRef : null}
                                    onClick={() => onSelectOrg(org.id)}
                                    className={`cursor-pointer transition-all duration-200 group relative ${isSelected ? 'bg-teal-50/60' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 z-10" />
                                    )}

                                    <td className="px-4 py-5 align-top">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className={`font-bold text-base leading-tight ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                                                        {org.name}
                                                    </h3>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                                                            {org.category}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${org.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                                                            }`}>
                                                            {org.status === 'Active' ? 'Активно' : 'В розробці'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className={isSelected ? 'text-teal-500' : 'text-slate-300'} />
                                            </div>
                                            <div className="flex flex-col gap-1 text-xs text-slate-500">
                                                <div className="flex items-center gap-2"><MapPin size={14} />{org.address}</div>
                                                <div className="flex items-center gap-2 font-bold text-teal-700"><Phone size={14} />{org.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 align-top hidden md:table-cell">
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
                                            {org.services}
                                        </p>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
