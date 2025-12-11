import React from 'react';
import { Baby } from 'lucide-react';

export interface DischargeModalProps {
    isOpen: boolean;
    isEditing: boolean;
    status: 'Vivo' | 'Fallecido';

    // New props for Mother + Baby
    hasClinicalCrib?: boolean;
    clinicalCribName?: string;
    clinicalCribStatus?: 'Vivo' | 'Fallecido';
    onClinicalCribStatusChange?: (s: 'Vivo' | 'Fallecido') => void;

    onStatusChange: (s: 'Vivo' | 'Fallecido') => void;
    onClose: () => void;
    onConfirm: () => void;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({
    isOpen, isEditing, status, onStatusChange, onClose, onConfirm,
    hasClinicalCrib, clinicalCribName, clinicalCribStatus, onClinicalCribStatusChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                <h3 className="font-bold text-lg mb-4 text-green-700">Confirmar Alta Médica</h3>

                {/* Main Patient */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Estado Madre / Paciente</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                            <input
                                type="radio" name="status" value="Vivo"
                                checked={status === 'Vivo'}
                                onChange={() => onStatusChange('Vivo')}
                                className="text-medical-600 focus:ring-medical-500"
                            />
                            <span className={status === 'Vivo' ? 'font-bold text-slate-800' : 'text-slate-600'}>Vivo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                            <input
                                type="radio" name="status" value="Fallecido"
                                checked={status === 'Fallecido'}
                                onChange={() => onStatusChange('Fallecido')}
                                className="text-red-600 focus:ring-red-500"
                            />
                            <span className={status === 'Fallecido' ? 'font-bold text-slate-800' : 'text-slate-600'}>Fallecido</span>
                        </label>
                    </div>
                </div>

                {/* Clinical Crib Patient (Baby) */}
                {!isEditing && hasClinicalCrib && onClinicalCribStatusChange && (
                    <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Baby size={16} className="text-pink-500" />
                            <label className="block text-xs font-bold text-pink-700 uppercase">Estado Recién Nacido</label>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 font-medium">{clinicalCribName || 'Recién Nacido'}</p>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio" name="cribStatus" value="Vivo"
                                    checked={clinicalCribStatus === 'Vivo'}
                                    onChange={() => onClinicalCribStatusChange('Vivo')}
                                    className="text-pink-600 focus:ring-pink-500"
                                />
                                Vivo
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio" name="cribStatus" value="Fallecido"
                                    checked={clinicalCribStatus === 'Fallecido'}
                                    onChange={() => onClinicalCribStatusChange('Fallecido')}
                                    className="text-red-600 focus:ring-red-500"
                                />
                                Fallecido
                            </label>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        {isEditing ? 'Guardar Cambios' : 'Confirmar Alta'}
                    </button>
                </div>
            </div>
        </div>
    );
};
