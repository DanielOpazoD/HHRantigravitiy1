import React, { useMemo } from 'react';
import { useDailyRecordContext } from '../context/DailyRecordContext';
import { BEDS } from '../constants';

// Sub-components
import { HandoffHeader } from './handoff/HandoffHeader';
import { HandoffRow } from './handoff/HandoffRow';

export const HandoffView: React.FC = () => {
    const { record, updatePatient, updateClinicalCrib } = useDailyRecordContext();

    if (!record) {
        return <div className="p-8 text-center text-slate-500 font-sans">Seleccione una fecha para ver la Entrega de Turno.</div>;
    }

    const visibleBeds = useMemo(() => {
        const activeExtras = record.activeExtraBeds || [];
        return BEDS.filter(bed => !bed.isExtra || activeExtras.includes(bed.id));
    }, [record.activeExtraBeds]);

    const hasAnyPatients = useMemo(() => {
        return visibleBeds.some(b => record.beds[b.id].patientName || record.beds[b.id].isBlocked);
    }, [visibleBeds, record.beds]);

    return (
        <div className="space-y-6 animate-fade-in pb-20 font-sans">
            <HandoffHeader />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider font-bold">
                                <th className="p-2 border-r border-slate-700 text-center w-20">Cama</th>
                                <th className="p-2 border-r border-slate-700 text-center w-16">Tipo</th>
                                <th className="p-2 border-r border-slate-700 min-w-[150px]">Nombre Paciente</th>
                                <th className="p-2 border-r border-slate-700 w-36">RUT</th>
                                <th className="p-2 border-r border-slate-700 w-12 text-center">Edad</th>
                                <th className="p-2 border-r border-slate-700 w-64">Diagnóstico</th>
                                <th className="p-2 border-r border-slate-700 w-20">Estado</th>
                                <th className="p-2 border-r border-slate-700 w-28 text-center">F. Ingreso</th>
                                <th className="p-2 border-r border-slate-700 w-28">Dispositivos</th>
                                <th className="p-2 min-w-[300px]">Observaciones (Evolución)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleBeds.map(bed => {
                                const patient = record.beds[bed.id];

                                return (
                                    <React.Fragment key={bed.id}>
                                        <HandoffRow
                                            bedName={bed.name}
                                            bedType={bed.type}
                                            patient={patient}
                                            reportDate={record.date}
                                            onNoteChange={(val) => updatePatient(bed.id, 'handoffNote', val)}
                                        />

                                        {patient.clinicalCrib && patient.clinicalCrib.patientName && (
                                            <HandoffRow
                                                bedName={bed.name}
                                                bedType="Cuna"
                                                patient={patient.clinicalCrib}
                                                reportDate={record.date}
                                                isSubRow={true}
                                                onNoteChange={(val) => updateClinicalCrib(bed.id, 'handoffNote', val)}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}

                            {/* If no occupied beds found */}
                            {!hasAnyPatients && (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-slate-400 italic text-sm">
                                        No hay pacientes registrados en este turno.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
