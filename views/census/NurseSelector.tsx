import React from 'react';
import { Users, Settings } from 'lucide-react';
import { useCensusActions } from './CensusActionsContext';

interface NurseSelectorProps {
    nurses: string[];
    nursesList: string[];
    onUpdateNurse: (index: number, name: string) => void;
}

export const NurseSelector: React.FC<NurseSelectorProps> = ({
    nurses,
    nursesList,
    onUpdateNurse
}) => {
    const { setShowNurseManager } = useCensusActions();

    return (
        <div className="bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center h-full hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-center mb-1 pb-0.5 border-b border-slate-50">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Users size={10} /> Enfermería
                </label>
                <button
                    onClick={() => setShowNurseManager(true)}
                    className="text-slate-300 hover:text-medical-600 transition-colors"
                >
                    <Settings size={10} />
                </button>
            </div>
            <div className="flex flex-col gap-1">
                <select
                    className="py-0.5 px-1.5 border border-slate-100 rounded text-[10px] focus:ring-1 focus:ring-medical-500 focus:outline-none w-full bg-slate-50 text-slate-600 h-6"
                    value={nurses[0]}
                    onChange={(e) => onUpdateNurse(0, e.target.value)}
                >
                    <option value="">-- Enf. 1 --</option>
                    {nursesList.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select
                    className="py-0.5 px-1.5 border border-slate-100 rounded text-[10px] focus:ring-1 focus:ring-medical-500 focus:outline-none w-full bg-slate-50 text-slate-600 h-6"
                    value={nurses[1]}
                    onChange={(e) => onUpdateNurse(1, e.target.value)}
                >
                    <option value="">-- Enf. 2 --</option>
                    {nursesList.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>
        </div>
    );
};
