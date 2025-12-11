import React, { useState } from 'react';
import { Users, X, Plus, Trash2 } from 'lucide-react';
import * as DataService from '../../services/dataService';

interface NurseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  nursesList: string[];
  setNursesList: (list: string[]) => void;
}

export const NurseManagerModal: React.FC<NurseManagerModalProps> = ({ isOpen, onClose, nursesList, setNursesList }) => {
  const [newNurseName, setNewNurseName] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newNurseName.trim()) {
      const updated = [...nursesList, newNurseName.trim()];
      setNursesList(updated);
      DataService.saveStoredNurses(updated);
      setNewNurseName('');
    }
  };

  const handleRemove = (name: string) => {
    const updated = nursesList.filter(n => n !== name);
    setNursesList(updated);
    DataService.saveStoredNurses(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users size={18} /> Gestionar Enfermeros/as
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              className="flex-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-medical-500 focus:outline-none text-sm"
              placeholder="Nuevo nombre..."
              value={newNurseName}
              onChange={(e) => setNewNurseName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button 
              onClick={handleAdd}
              className="bg-medical-600 hover:bg-medical-700 text-white p-2 rounded transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {nursesList.map(nurse => (
              <div key={nurse} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100 group">
                <span className="text-sm font-medium text-slate-700">{nurse}</span>
                <button 
                  onClick={() => handleRemove(nurse)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium">Cerrar</button>
        </div>
      </div>
    </div>
  );
};