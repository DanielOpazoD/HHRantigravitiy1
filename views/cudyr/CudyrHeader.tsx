import React from 'react';
import { ClipboardList, Calculator } from 'lucide-react';
import clsx from 'clsx';

interface CudyrHeaderProps {
    occupiedCount: number;
    categorizedCount: number;
}

export const CudyrHeader: React.FC<CudyrHeaderProps> = ({
    occupiedCount,
    categorizedCount
}) => {
    const categorizationIndex = occupiedCount > 0
        ? Math.round((categorizedCount / occupiedCount) * 100)
        : 0;

    return (
        <header className="mb-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="text-medical-600" />
                Instrumento CUDYR
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                {/* Stats Box */}
                <div className="flex-1 sm:flex-none flex items-center gap-4 text-xs font-bold uppercase bg-blue-50 p-2 rounded border border-blue-200 text-blue-800 shadow-sm whitespace-nowrap">
                    <span className="flex items-center gap-1"><Calculator size={14} /> Resumen:</span>
                    <span className="border-l border-blue-200 pl-3">
                        Ocupadas: <span className="text-lg">{occupiedCount}</span>
                    </span>
                    <span className="border-l border-blue-200 pl-3">
                        Categorizados: <span className="text-lg">{categorizedCount}</span>
                    </span>
                    <span className="border-l border-blue-200 pl-3">
                        Índice: <span className={clsx(
                            "text-lg",
                            categorizationIndex === 100 ? "text-green-600" : "text-blue-800"
                        )}>{categorizationIndex}%</span>
                    </span>
                </div>

                {/* Legend Box */}
                <div className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-4 text-xs font-bold uppercase bg-slate-50 p-2 rounded border border-slate-200 shadow-sm">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-red-600 rounded-full"></span> A: Máximo
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-orange-500 rounded-full"></span> B: Alto
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-yellow-400 rounded-full"></span> C: Medio
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-600 rounded-full"></span> D: Bajo
                    </span>
                </div>
            </div>
        </header>
    );
};
