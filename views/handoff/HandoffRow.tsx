import React, { useEffect, useRef } from 'react';
import { PatientData, PatientStatus } from '../../types';
import { Baby, AlertCircle, Clock } from 'lucide-react';
import clsx from 'clsx';
import { formatDateDDMMYYYY } from '../../services/dataService';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Calculate days since admission
 */
export const calculateHospitalizedDays = (admissionDate?: string, currentDate?: string): number | null => {
    if (!admissionDate || !currentDate) return null;
    const start = new Date(admissionDate);
    const end = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = end.getTime() - start.getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    return days >= 0 ? days : 0;
};

// ============================================================================
// HandoffRow Component
// ============================================================================

interface HandoffRowProps {
    bedName: string;
    bedType: string;
    patient: PatientData;
    reportDate: string;
    isSubRow?: boolean;
    onNoteChange: (val: string) => void;
}

export const HandoffRow: React.FC<HandoffRowProps> = ({
    bedName,
    bedType,
    patient,
    reportDate,
    isSubRow = false,
    onNoteChange
}) => {
    const noteRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (noteRef.current) {
            noteRef.current.style.height = 'auto';
            noteRef.current.style.height = `${noteRef.current.scrollHeight}px`;
        }
    }, [patient.handoffNote]);

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        onNoteChange(textarea.value);
    };

    // If bed is blocked (and not a sub-row), show blocked status
    if (!isSubRow && patient.isBlocked) {
        return (
            <tr className="bg-red-50 border-b border-red-200 text-sm">
                <td className="p-3 font-bold text-red-700 text-center align-middle">{bedName}</td>
                <td colSpan={9} className="p-3 text-red-600 flex items-center gap-2 align-middle">
                    <AlertCircle size={16} /> BLOQUEADA: {patient.blockedReason}
                </td>
            </tr>
        );
    }

    const isEmpty = !patient.patientName;
    if (isEmpty) return null;

    const daysHospitalized = calculateHospitalizedDays(patient.admissionDate, reportDate);

    return (
        <tr className={clsx(
            "border-b border-slate-200 hover:bg-slate-50 transition-colors align-top text-sm",
            isSubRow ? "bg-pink-50/40" : "bg-white",
            patient.status === PatientStatus.GRAVE ? "border-l-4 border-l-red-500" : ""
        )}>
            {/* Cama + Días Hosp */}
            <td className="p-2 border-r border-slate-200 text-center w-20">
                <div className="font-bold text-slate-700 text-base">
                    {isSubRow ? '' : bedName}
                </div>
                {!isSubRow && daysHospitalized !== null && (
                    <div className="flex flex-col items-center justify-center mt-1 text-slate-500" title="Días Hospitalizado">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold">{daysHospitalized}d</span>
                    </div>
                )}
            </td>

            {/* Tipo */}
            <td className="p-2 border-r border-slate-200 w-16 text-center align-middle">
                <span className={clsx(
                    "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full border block",
                    isSubRow ? "bg-pink-100 text-pink-700 border-pink-200" :
                        bedType === 'UTI' ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-600 border-blue-200"
                )}>
                    {isSubRow ? 'CUNA' : bedType}
                </span>
            </td>

            {/* Nombre */}
            <td className="p-2 border-r border-slate-200 min-w-[150px] align-middle">
                <div className="font-medium text-slate-800 flex items-center gap-2">
                    {isSubRow && <Baby size={14} className="text-pink-400" />}
                    {patient.patientName}
                </div>
            </td>

            {/* RUT */}
            <td className="p-2 border-r border-slate-200 w-36 font-mono text-xs text-slate-600 align-middle whitespace-nowrap">
                {patient.rut}
            </td>

            {/* Edad */}
            <td className="p-2 border-r border-slate-200 w-12 text-center align-middle">
                {patient.age}
            </td>

            {/* Diagnóstico */}
            <td className="p-2 border-r border-slate-200 w-64 text-slate-700 align-middle">
                <div className="font-medium leading-tight">
                    {patient.pathology}
                </div>
            </td>

            {/* Estado */}
            <td className="p-2 border-r border-slate-200 w-20 align-middle">
                <span className={clsx(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap block text-center",
                    patient.status === PatientStatus.GRAVE ? "bg-red-100 text-red-700" :
                        patient.status === PatientStatus.DE_CUIDADO ? "bg-orange-100 text-orange-700" :
                            "bg-green-100 text-green-700"
                )}>
                    {patient.status}
                </span>
            </td>

            {/* Fecha Ingreso */}
            <td className="p-2 border-r border-slate-200 w-28 text-center text-xs text-slate-600 align-middle">
                {formatDateDDMMYYYY(patient.admissionDate)}
            </td>

            {/* Dispositivos */}
            <td className="p-2 border-r border-slate-200 w-28 text-xs align-middle">
                <div className="flex flex-wrap gap-1">
                    {patient.devices.length > 0 ? patient.devices.map(d => (
                        <span key={d} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                            {d}
                        </span>
                    )) : <span className="text-slate-400">-</span>}
                </div>
            </td>

            {/* Observaciones / Evolución */}
            <td className="p-2 w-full min-w-[300px] align-top">
                <textarea
                    ref={noteRef}
                    className="w-full h-full min-h-[80px] p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-medical-500 focus:outline-none resize-none overflow-hidden bg-yellow-50/30"
                    placeholder="Escriba la evolución..."
                    value={patient.handoffNote || ''}
                    onChange={handleNoteChange}
                />
            </td>
        </tr>
    );
};
