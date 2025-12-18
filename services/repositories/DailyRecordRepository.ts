/**
 * Daily Record Repository
 * Provides a unified interface for accessing and persisting daily records.
 * Abstracts localStorage and Firestore operations.
 * Supports demo mode with isolated storage.
 */

import { CudyrScore, DailyRecord, PatientData } from '../../types';
import { BEDS } from '../../constants';
import {
    saveRecordLocal,
    getRecordForDate as getRecordFromLocal,
    getPreviousDayRecord,
    getStoredRecords,
    // Demo storage functions
    saveDemoRecord,
    getDemoRecordForDate,
    getPreviousDemoDayRecord,
    getDemoRecords
} from '../storage/localStorageService';
import {
    saveRecordToFirestore,
    subscribeToRecord
} from '../firestoreService';
import { createEmptyPatient, clonePatient } from '../factories/patientFactory';

const CUDYR_FIELDS: (keyof CudyrScore)[] = [
    'changeClothes', 'mobilization', 'feeding', 'elimination', 'psychosocial', 'surveillance',
    'vitalSigns', 'fluidBalance', 'oxygenTherapy', 'airway', 'proInterventions', 'skinCare',
    'pharmacology', 'invasiveElements'
];

const resetCudyrScores = (patient: PatientData): PatientData => {
    let updatedPatient: PatientData = patient;

    if (patient.cudyr) {
        const clearedScores = CUDYR_FIELDS.reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {} as CudyrScore);

        updatedPatient = { ...updatedPatient, cudyr: clearedScores };
    }

    if (patient.clinicalCrib) {
        updatedPatient = {
            ...updatedPatient,
            clinicalCrib: resetCudyrScores(patient.clinicalCrib)
        };
    }

    return updatedPatient;
};

// ============================================================================
// Configuration
// ============================================================================

let firestoreEnabled = true;
let demoModeActive = false;

export const setFirestoreEnabled = (enabled: boolean): void => {
    firestoreEnabled = enabled;
};

export const isFirestoreEnabled = (): boolean => firestoreEnabled;

export const setDemoModeActive = (active: boolean): void => {
    demoModeActive = active;
};

export const isDemoModeActive = (): boolean => demoModeActive;

// ============================================================================
// Repository Interface
// ============================================================================

export interface IDailyRecordRepository {
    getForDate(date: string): DailyRecord | null;
    getPreviousDay(date: string): DailyRecord | null;
    save(record: DailyRecord): Promise<void>;
    subscribe(date: string, callback: (r: DailyRecord | null) => void): () => void;
    initializeDay(date: string, copyFromDate?: string): Promise<DailyRecord>;
}

// ============================================================================
// Repository Implementation
// ============================================================================

/**
 * Get record for a specific date
 * Uses demo storage when demo mode is active
 */
export const getForDate = (date: string): DailyRecord | null => {
    if (demoModeActive) {
        return getDemoRecordForDate(date);
    }
    return getRecordFromLocal(date);
};

/**
 * Get the previous day's record
 * Uses demo storage when demo mode is active
 */
export const getPreviousDay = (date: string): DailyRecord | null => {
    if (demoModeActive) {
        return getPreviousDemoDayRecord(date);
    }
    return getPreviousDayRecord(date);
};

/**
 * Save a record to storage
 * In demo mode: only saves to demo localStorage (no Firestore)
 * In normal mode: saves to localStorage and syncs to Firestore
 */
export const save = async (record: DailyRecord): Promise<void> => {
    if (demoModeActive) {
        // Demo mode: only save to demo localStorage, no Firestore
        saveDemoRecord(record);
        return;
    }

    // Normal mode: save to localStorage first (instant, works offline)
    saveRecordLocal(record);

    // Sync to Firestore in background (if enabled)
    if (firestoreEnabled) {
        try {
            await saveRecordToFirestore(record);
        } catch (err) {
            console.warn('Firestore sync failed, data saved locally:', err);
            throw err;
        }
    }
};

/**
 * Subscribe to real-time updates for a specific date
 * In demo mode: returns a no-op unsubscribe (no real-time sync)
 */
export const subscribe = (
    date: string,
    callback: (r: DailyRecord | null) => void
): (() => void) => {
    if (demoModeActive) {
        // Demo mode: no real-time sync, just return no-op
        return () => { };
    }
    return subscribeToRecord(date, callback);
};

/**
 * Initialize a new day record, optionally copying from a previous date
 * In demo mode: uses demo storage
 */
export const initializeDay = async (
    date: string,
    copyFromDate?: string
): Promise<DailyRecord> => {
    const records = demoModeActive ? getDemoRecords() : getStoredRecords();

    // If record already exists, return it
    if (records[date]) return records[date];

    let initialBeds: Record<string, PatientData> = {};
    let activeExtras: string[] = [];

    // Initialize empty beds structure
    BEDS.forEach(bed => {
        initialBeds[bed.id] = createEmptyPatient(bed.id);
    });

    // If a copyFromDate is provided, copy active patients
    if (copyFromDate && records[copyFromDate]) {
        const prevRecord = records[copyFromDate];
        const prevBeds = prevRecord.beds;

        // Copy active extra beds setting
        activeExtras = [...(prevRecord.activeExtraBeds || [])];

        BEDS.forEach(bed => {
            const prevPatient = prevBeds[bed.id];
            if (prevPatient) {
                if (prevPatient.patientName || prevPatient.isBlocked) {
                    // Deep copy to prevent reference issues
                    const clonedPatient = clonePatient(prevPatient);
                    initialBeds[bed.id] = resetCudyrScores(clonedPatient);
                } else {
                    // Preserve configuration even if empty
                    initialBeds[bed.id].bedMode = prevPatient.bedMode || initialBeds[bed.id].bedMode;
                    initialBeds[bed.id].hasCompanionCrib = prevPatient.hasCompanionCrib || false;
                }

                // Keep location for extras
                if (prevPatient.location && bed.isExtra) {
                    initialBeds[bed.id].location = prevPatient.location;
                }
            }
        });
    }

    const newRecord: DailyRecord = {
        date,
        beds: initialBeds,
        discharges: [],
        transfers: [],
        cma: [],
        lastUpdated: new Date().toISOString(),
        nurses: ["", ""],
        activeExtraBeds: activeExtras
    };

    await save(newRecord);
    return newRecord;
};

// ============================================================================
// Repository Object Export (Alternative API)
// ============================================================================

export const DailyRecordRepository: IDailyRecordRepository = {
    getForDate,
    getPreviousDay,
    save,
    subscribe,
    initializeDay
};
