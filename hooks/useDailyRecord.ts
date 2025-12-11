/**
 * useDailyRecord Hook
 * Central hook for managing daily record state with real-time sync.
 * Uses DailyRecordRepository for all data operations.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { DailyRecord, PatientData, CudyrScore, TransferData, PatientFieldValue } from '../types';
import { useNotification } from '../context/NotificationContext';


// Repository for data access
import {
    DailyRecordRepository,
    getForDate,
    getPreviousDay,
    save,
    subscribe,
    initializeDay
} from '../services/repositories/DailyRecordRepository';
import { saveRecordLocal } from '../services/storage/localStorageService';
import { generateDemoRecord } from '../services/utils/demoDataGenerator';

// Sub-hooks
import { useBedManagement } from './useBedManagement';
import { usePatientDischarges } from './usePatientDischarges';
import { usePatientTransfers } from './usePatientTransfers';
import { useNurseManagement } from './useNurseManagement';
import { useCMA } from './useCMA';

// ============================================================================
// Types
// ============================================================================

export interface DailyRecordContextType {
    record: DailyRecord | null;
    syncStatus: 'idle' | 'saving' | 'saved' | 'error';
    lastSyncTime: Date | null;
    createDay: (copyFromPrevious: boolean) => void;

    // Exposed from useBedManagement
    updatePatient: (bedId: string, field: keyof PatientData, value: PatientFieldValue) => void;
    updatePatientMultiple: (bedId: string, fields: Partial<PatientData>) => void;
    updateClinicalCrib: (bedId: string, field: keyof PatientData | 'create' | 'remove', value?: PatientFieldValue) => void;
    updateClinicalCribMultiple: (bedId: string, fields: Partial<PatientData>) => void;
    updateCudyr: (bedId: string, field: keyof CudyrScore, value: number) => void;
    clearPatient: (bedId: string) => void;
    clearAllBeds: () => void;
    moveOrCopyPatient: (type: 'move' | 'copy', sourceBedId: string, targetBedId: string) => void;
    toggleBlockBed: (bedId: string, reason?: string) => void;
    toggleExtraBed: (bedId: string) => void;

    // Exposed from useNurseManagement
    updateNurse: (index: number, name: string) => void;

    // Exposed from usePatientDischarges
    addDischarge: (bedId: string, status: 'Vivo' | 'Fallecido', cribStatus?: 'Vivo' | 'Fallecido') => void;
    updateDischarge: (id: string, status: 'Vivo' | 'Fallecido') => void;
    deleteDischarge: (id: string) => void;
    undoDischarge: (id: string) => void;

    // Exposed from usePatientTransfers
    addTransfer: (bedId: string, method: string, center: string, centerOther: string, escort?: string) => void;
    updateTransfer: (id: string, updates: Partial<TransferData>) => void;
    deleteTransfer: (id: string) => void;
    undoTransfer: (id: string) => void;

    // Exposed from useCMA
    addCMA: (data: Omit<import('../types').CMAData, 'id' | 'timestamp'>) => void;
    deleteCMA: (id: string) => void;
    updateCMA: (id: string, updates: Partial<import('../types').CMAData>) => void;

    generateDemo: () => void;
    refresh: () => void;
}

// ============================================================================
// Constants
// ============================================================================

// Short debounce - only ignore Firebase "echo" updates immediately after saving
const SYNC_DEBOUNCE_MS = 500;

// ============================================================================
// Hook Implementation
// ============================================================================

export const useDailyRecord = (currentDateString: string): DailyRecordContextType => {
    const [record, setRecord] = useState<DailyRecord | null>(null);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    const { error, success, warning } = useNotification();

    // Refs for sync management
    const isSavingRef = useRef(false);
    const lastLocalChangeRef = useRef<number>(0);

    // ========================================================================
    // Initial Load
    // ========================================================================
    useEffect(() => {
        const existing = getForDate(currentDateString);
        setRecord(existing || null);
    }, [currentDateString]);

    // ========================================================================
    // Real-time Sync Subscription
    // ========================================================================
    useEffect(() => {
        const unsubscribe = subscribe(currentDateString, (remoteRecord) => {
            if (remoteRecord) {
                const now = Date.now();
                const timeSinceLastChange = now - lastLocalChangeRef.current;

                // Only ignore updates if we're actively saving (very short window)
                if (isSavingRef.current && timeSinceLastChange < SYNC_DEBOUNCE_MS) {
                    return; // Ignore echo of our own save
                }

                setRecord(prev => {
                    if (!prev) return remoteRecord;

                    const localTime = prev.lastUpdated ? new Date(prev.lastUpdated).getTime() : 0;
                    const remoteTime = remoteRecord.lastUpdated ? new Date(remoteRecord.lastUpdated).getTime() : 0;

                    // Always accept remote if it's genuinely newer (from another browser)
                    if (remoteTime > localTime + 1000) {
                        return remoteRecord;
                    }

                    // If times are very close, it's likely an echo - keep local if recent change
                    if (timeSinceLastChange < SYNC_DEBOUNCE_MS) {
                        return prev;
                    }

                    // Default: accept remote data
                    return remoteRecord;
                });

                setLastSyncTime(new Date());
                setSyncStatus('saved');
                saveRecordLocal(remoteRecord);
            }
        });

        return () => unsubscribe();
    }, [currentDateString]);

    // ========================================================================
    // Save Handler
    // ========================================================================
    const saveAndUpdate = useCallback(async (updatedRecord: DailyRecord) => {
        isSavingRef.current = true;
        lastLocalChangeRef.current = Date.now();

        setRecord(updatedRecord);
        setSyncStatus('saving');

        try {
            await save(updatedRecord);
            setSyncStatus('saved');
            setLastSyncTime(new Date());
            setTimeout(() => setSyncStatus('idle'), 2000);
        } catch (err) {
            console.error('Save failed:', err);
            setSyncStatus('error');
            error('Error al guardar', 'Verifique su conexión o intente nuevamente.');
        } finally {
            setTimeout(() => {
                isSavingRef.current = false;
            }, SYNC_DEBOUNCE_MS);
        }
    }, [error]);

    // ========================================================================
    // Day Management
    // ========================================================================
    const createDay = useCallback(async (copyFromPrevious: boolean) => {
        let prevDate: string | undefined = undefined;

        if (copyFromPrevious) {
            const prevRecord = getPreviousDay(currentDateString);
            if (prevRecord) {
                prevDate = prevRecord.date;
            } else {
                warning("No se encontró registro anterior", "No hay datos del día previo para copiar.");
                return;
            }
        }

        const newRecord = await initializeDay(currentDateString, prevDate);
        lastLocalChangeRef.current = Date.now();
        setRecord(newRecord);

        success('Día creado', `Se ha inicializado el registro para ${currentDateString}.`);
    }, [currentDateString, warning, success]);

    const generateDemo = useCallback(async () => {
        const demoRecord = generateDemoRecord(currentDateString);
        await save(demoRecord);
        lastLocalChangeRef.current = Date.now();
        setRecord({ ...demoRecord });
    }, [currentDateString]);

    const refresh = useCallback(() => {
        const existing = getForDate(currentDateString);
        setRecord(existing || null);
    }, [currentDateString]);

    // ========================================================================
    // Sub-Hooks
    // ========================================================================
    const bedManagement = useBedManagement(record, saveAndUpdate);
    const dischargeManagement = usePatientDischarges(record, saveAndUpdate);
    const transferManagement = usePatientTransfers(record, saveAndUpdate);
    const nurseManagement = useNurseManagement(record, saveAndUpdate);
    const cmaManagement = useCMA(record, saveAndUpdate);

    // ========================================================================
    // Return API
    // ========================================================================
    return {
        record,
        syncStatus,
        lastSyncTime,
        createDay,

        // Bed Management
        updatePatient: bedManagement.updatePatient,
        updatePatientMultiple: bedManagement.updatePatientMultiple,
        updateClinicalCrib: bedManagement.updateClinicalCrib,
        updateClinicalCribMultiple: bedManagement.updateClinicalCribMultiple,
        updateCudyr: bedManagement.updateCudyr,
        clearPatient: bedManagement.clearPatient,
        clearAllBeds: bedManagement.clearAllBeds,
        moveOrCopyPatient: bedManagement.moveOrCopyPatient,
        toggleBlockBed: bedManagement.toggleBlockBed,
        toggleExtraBed: bedManagement.toggleExtraBed,

        // Nurse Management
        updateNurse: nurseManagement.updateNurse,

        // Discharges
        addDischarge: dischargeManagement.addDischarge,
        updateDischarge: dischargeManagement.updateDischarge,
        deleteDischarge: dischargeManagement.deleteDischarge,
        undoDischarge: dischargeManagement.undoDischarge,

        // Transfers
        addTransfer: transferManagement.addTransfer,
        updateTransfer: transferManagement.updateTransfer,
        deleteTransfer: transferManagement.deleteTransfer,
        undoTransfer: transferManagement.undoTransfer,

        // CMA
        addCMA: cmaManagement.addCMA,
        deleteCMA: cmaManagement.deleteCMA,
        updateCMA: cmaManagement.updateCMA,

        generateDemo,
        refresh
    };
};
