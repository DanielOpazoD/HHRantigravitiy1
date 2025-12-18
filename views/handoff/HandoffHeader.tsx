import React from 'react';
import { MessageSquare } from 'lucide-react';

export const HandoffHeader: React.FC = () => {
    return (
        <header className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="text-medical-600" />
                    Entrega Turno Médicos
                </h2>
                <p className="text-sm text-slate-500">Registro de evolución y novedades clínicas por paciente.</p>
            </div>
        </header>
    );
};
