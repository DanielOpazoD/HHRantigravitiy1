import React, { useState, useMemo, useEffect } from 'react';
import { getStoredNurses } from '../services/storage/localStorageService';
import { getPreviousDay } from '../services/repositories/DailyRecordRepository';
import { calculateStats } from '../services/calculations/statsCalculator';
import { useDailyRecordContext } from '../context/DailyRecordContext';
import { SummaryCard } from '../components/SummaryCard';
import { AnalyticsView } from './AnalyticsView';

// Census Sub-components
import {
    CensusActionsProvider,
    EmptyDayPrompt,
    NurseSelector,
    CensusTable,
    DischargesSection,
    TransfersSection,
    CMASection,
    CensusModals
} from './census';

type ViewMode = 'REGISTER' | 'ANALYTICS';

interface CensusViewProps {
    viewMode: ViewMode;
    selectedDay: number;
    selectedMonth: number;
    currentDateString: string;
    onOpenBedManager: () => void;
    showBedManagerModal: boolean;
    onCloseBedManagerModal: () => void;
}

export const CensusView: React.FC<CensusViewProps> = ({
    viewMode,
    selectedDay,
    selectedMonth,
    currentDateString,
    showBedManagerModal,
    onCloseBedManagerModal
}) => {
    const {
        record,
        createDay,
        clearAllBeds,
        updateNurse,
        undoDischarge,
        deleteDischarge,
        undoTransfer,
        deleteTransfer
    } = useDailyRecordContext();

    // Nurse management state
    const [nursesList, setNursesList] = useState<string[]>([]);

    useEffect(() => {
        setNursesList(getStoredNurses());
    }, []);

    // Computed values
    const previousRecordAvailable = useMemo(
        () => getPreviousDay(currentDateString),
        [currentDateString]
    );

    const safeNurses = record
        ? (record.nurses && record.nurses.length === 2 ? record.nurses : [record.nurseName || "", ""])
        : ["", ""];

    const stats = record ? calculateStats(record.beds) : null;

    // Show Analytics view if selected
    if (viewMode === 'ANALYTICS') {
        return <AnalyticsView />;
    }

    // Show empty day prompt if no record exists
    if (!record) {
        return (
            <EmptyDayPrompt
                selectedDay={selectedDay}
                selectedMonth={selectedMonth}
                previousRecordAvailable={previousRecordAvailable}
                onCreateDay={createDay}
            />
        );
    }

    // Main Register View
    return (
        <CensusActionsProvider>
            <div className="space-y-3 print:space-y-4 animate-fade-in pb-12">
                {/* Header for Report (Print Only) */}
                <div className="hidden print:block mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 text-center uppercase">
                        Reporte Diario Hospital Hanga Roa
                    </h2>
                    <p className="text-center text-slate-600">Fecha: {currentDateString}</p>
                </div>

                {/* Context Header for the Day - Centered and Compact */}
                <div className="flex justify-center print:hidden -mt-2">
                    <div className="flex flex-row items-stretch gap-2 max-w-5xl w-full">
                        {/* Nurse Selector - Fixed Width */}
                        <div className="w-32 flex-shrink-0">
                            <NurseSelector
                                nurses={safeNurses}
                                nursesList={nursesList}
                                onUpdateNurse={updateNurse}
                            />
                        </div>

                        {/* Summary Card - Flexible but Constrained */}
                        {stats && (
                            <div className="flex-1 min-w-0">
                                <SummaryCard
                                    stats={stats}
                                    discharges={record.discharges}
                                    transfers={record.transfers}
                                    cmaCount={record.cma?.length || 0}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Patients Table */}
                <CensusTable
                    record={record}
                    currentDateString={currentDateString}
                    onClearAllBeds={clearAllBeds}
                />

                {/* Discharges Section */}
                <DischargesSection
                    discharges={record.discharges || []}
                    onUndoDischarge={undoDischarge}
                    onDeleteDischarge={deleteDischarge}
                />

                {/* Transfers Section */}
                <TransfersSection
                    transfers={record.transfers || []}
                    onUndoTransfer={undoTransfer}
                    onDeleteTransfer={deleteTransfer}
                />

                {/* CMA Section */}
                <CMASection />

                {/* All Modals */}
                <CensusModals
                    nursesList={nursesList}
                    setNursesList={setNursesList}
                    showBedManagerModal={showBedManagerModal}
                    onCloseBedManagerModal={onCloseBedManagerModal}
                />
            </div>
        </CensusActionsProvider>
    );
};
