import React, { useMemo } from 'react';
import { useDailyRecordContext } from '../context/DailyRecordContext';
import { BEDS } from '../constants';
import { CudyrScore } from '../types';

// Sub-components
import { CudyrHeader } from './cudyr/CudyrHeader';
import { CudyrRow, VerticalHeader } from './cudyr/CudyrRow';
import { getCategorization } from './cudyr/CudyrScoreUtils';

export const CudyrView: React.FC = () => {
    const { record, updateCudyr } = useDailyRecordContext();

    if (!record) {
        return <div className="p-8 text-center text-slate-500">Seleccione una fecha con registros para ver el CUDYR.</div>;
    }

    // Filter beds to display
    const visibleBeds = useMemo(() => {
        const activeExtras = record.activeExtraBeds || [];
        return BEDS.filter(b => !b.isExtra || activeExtras.includes(b.id));
    }, [record.activeExtraBeds]);

    // Calculate statistics
    const stats = useMemo(() => {
        const occupied = visibleBeds.filter(b => {
            const p = record.beds[b.id];
            return p.patientName && !p.isBlocked;
        });

        const categorized = occupied.filter(b => {
            const p = record.beds[b.id];
            const { isCategorized } = getCategorization(p.cudyr);
            return isCategorized;
        });

        return {
            occupiedCount: occupied.length,
            categorizedCount: categorized.length
        };
    }, [visibleBeds, record.beds]);

    const handleScoreChange = (bedId: string, field: keyof CudyrScore, value: number) => {
        updateCudyr(bedId, field, value);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <CudyrHeader
                    occupiedCount={stats.occupiedCount}
                    categorizedCount={stats.categorizedCount}
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse border border-slate-300 table-fixed min-w-[1200px]">
                        <thead>
                            {/* Group Headers */}
                            <tr>
                                <th colSpan={2} className="bg-slate-100 border border-slate-300 p-2 text-center font-bold text-slate-700">PACIENTE</th>
                                <th colSpan={6} className="bg-blue-50 border border-blue-200 p-2 text-center font-bold text-blue-800">PUNTOS DEPENDENCIA (0-3)</th>
                                <th colSpan={8} className="bg-red-50 border border-red-200 p-2 text-center font-bold text-red-800">PUNTOS DE RIESGO (0-3)</th>
                                <th colSpan={3} className="bg-slate-100 border border-slate-300 p-2 text-center font-bold text-slate-700">RESULTADOS</th>
                            </tr>
                            {/* Column Headers */}
                            <tr className="text-center">
                                {/* Fixed */}
                                <th className="border border-slate-300 p-1 w-12 bg-slate-50 align-middle">CAMA</th>
                                <th className="border border-slate-300 p-1 w-40 bg-slate-50 align-middle">NOMBRE</th>

                                {/* Dep - Vertical */}
                                <VerticalHeader text="Cuidados Cambio Ropa" colorClass="bg-blue-50/50" />
                                <VerticalHeader text="Cuidados de Movilización" colorClass="bg-blue-50/50" />
                                <VerticalHeader text="Cuidados de Alimentación" colorClass="bg-blue-50/50" />
                                <VerticalHeader text="Cuidados de Eliminación" colorClass="bg-blue-50/50" />
                                <VerticalHeader text="Apoyo Psicosocial y Emocional" colorClass="bg-blue-50/50" />
                                <VerticalHeader text="Vigilancia" colorClass="bg-blue-50/50" />

                                {/* Risk - Vertical */}
                                <VerticalHeader text="Medicición Signos Vitales" colorClass="bg-red-50/50" />
                                <VerticalHeader text="Balance Hìdrico" colorClass="bg-red-50/50" />
                                <VerticalHeader text="Cuidados de Oxigenoterapia" colorClass="bg-red-50/50" />
                                <VerticalHeader text="Cuidados diarios de Vía Aérea" colorClass="bg-red-50/50" />
                                <VerticalHeader text="Intervenciones Profesionales" colorClass="bg-red-50/50" />
                                <VerticalHeader text="Cuidados de la Piel y Curaciones" colorClass="bg-red-50/50" />
                                <VerticalHeader text="Administración Tto Farmacológico" colorClass="bg-red-50/50" />
                                <VerticalHeader text="Presencia Elem. Invasivos" colorClass="bg-red-50/50" />

                                {/* Results */}
                                <th className="border border-slate-300 p-1 w-14 bg-slate-50 align-middle">CAT</th>
                                <th className="border border-slate-300 p-1 w-12 bg-slate-50 text-blue-800 align-middle">P.DEP</th>
                                <th className="border border-slate-300 p-1 w-12 bg-slate-50 text-red-800 align-middle">P.RIES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleBeds.map(bed => (
                                <CudyrRow
                                    key={bed.id}
                                    bed={bed}
                                    patient={record.beds[bed.id]}
                                    onScoreChange={handleScoreChange}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
