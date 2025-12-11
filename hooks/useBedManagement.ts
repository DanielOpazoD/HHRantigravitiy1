/**
 * useBedManagement Hook
 * Manages bed operations: patient updates, CUDYR scores, blocking, moving.
 * Clinical crib logic is delegated to useClinicalCrib.
 */

import { DailyRecord, PatientData, CudyrScore, PatientFieldValue } from '../types';
import { createEmptyPatient } from '../services/factories/patientFactory';
import { BEDS } from '../constants';
import { useClinicalCrib } from './useClinicalCrib';

// ============================================================================
// Types
// ============================================================================

export interface BedManagementActions {
    updatePatient: (bedId: string, field: keyof PatientData, value: PatientFieldValue) => void;
    updatePatientMultiple: (bedId: string, fields: Partial<PatientData>) => void;
    updateCudyr: (bedId: string, field: keyof CudyrScore, value: number) => void;
    updateClinicalCrib: (bedId: string, field: keyof PatientData | 'create' | 'remove', value?: PatientFieldValue) => void;
    updateClinicalCribMultiple: (bedId: string, fields: Partial<PatientData>) => void;
    clearPatient: (bedId: string) => void;
    clearAllBeds: () => void;
    moveOrCopyPatient: (type: 'move' | 'copy', sourceBedId: string, targetBedId: string) => void;
    toggleBlockBed: (bedId: string, reason?: string) => void;
    toggleExtraBed: (bedId: string) => void;
}

// ============================================================================
// Default CUDYR Score
// ============================================================================

const DEFAULT_CUDYR: CudyrScore = {
    changeClothes: 0, mobilization: 0, feeding: 0, elimination: 0,
    psychosocial: 0, surveillance: 0, vitalSigns: 0, fluidBalance: 0,
    oxygenTherapy: 0, airway: 0, proInterventions: 0, skinCare: 0,
    pharmacology: 0, invasiveElements: 0
};

// ============================================================================
// Hook Implementation
// ============================================================================

export const useBedManagement = (
    record: DailyRecord | null,
    saveAndUpdate: (updatedRecord: DailyRecord) => void
): BedManagementActions => {

    // Delegate clinical crib operations to specialized hook
    const cribActions = useClinicalCrib(record, saveAndUpdate);

    // ========================================================================
    // Patient Updates
    // ========================================================================

    const updatePatient = (bedId: string, field: keyof PatientData, value: PatientFieldValue) => {
        if (!record) return;

        // Validation: Admission date cannot be in the future
        if (field === 'admissionDate' && typeof value === 'string') {
            const selectedDate = new Date(value);
            const today = new Date();
            // Reset time part for accurate comparison
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                console.warn("Cannot set admission date to future");
                return;
            }
        }

        const updatedBeds = { ...record.beds };
        updatedBeds[bedId] = { ...updatedBeds[bedId], [field]: value };
        saveAndUpdate({ ...record, beds: updatedBeds, lastUpdated: new Date().toISOString() });
    };

    /**
     * Update multiple patient fields atomically in a single save operation.
     * This fixes the bug where calling updatePatient multiple times in sequence
     * would only save the last field due to React's async state updates.
     */
    const updatePatientMultiple = (bedId: string, fields: Partial<PatientData>) => {
        if (!record) return;

        // Validation: Admission date cannot be in the future
        if (fields.admissionDate) {
            const selectedDate = new Date(fields.admissionDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                console.warn("Cannot set admission date to future");
                delete fields.admissionDate;
            }
        }

        const updatedBeds = { ...record.beds };
        updatedBeds[bedId] = { ...updatedBeds[bedId], ...fields };
        saveAndUpdate({ ...record, beds: updatedBeds, lastUpdated: new Date().toISOString() });
    };

    const updateCudyr = (bedId: string, field: keyof CudyrScore, value: number) => {
        if (!record) return;
        const updatedBeds = { ...record.beds };
        const currentPatient = updatedBeds[bedId];
        const currentCudyr = currentPatient.cudyr || DEFAULT_CUDYR;

        updatedBeds[bedId] = {
            ...currentPatient,
            cudyr: { ...currentCudyr, [field]: value }
        };
        saveAndUpdate({ ...record, beds: updatedBeds, lastUpdated: new Date().toISOString() });
    };

    // ========================================================================
    // Clinical Crib Wrapper (maintains backwards compatibility)
    // ========================================================================

    const updateClinicalCrib = (
        bedId: string,
        field: keyof PatientData | 'create' | 'remove',
        value?: PatientFieldValue
    ) => {
        if (field === 'create') {
            cribActions.createCrib(bedId);
        } else if (field === 'remove') {
            cribActions.removeCrib(bedId);
        } else {
            cribActions.updateCribField(bedId, field, value);
        }
    };

    /**
     * Update multiple clinical crib fields atomically in a single save operation.
     */
    const updateClinicalCribMultiple = (bedId: string, fields: Partial<PatientData>) => {
        if (!record) return;

        const currentPatient = record.beds[bedId];
        if (!currentPatient?.clinicalCrib) return;

        // Validation: Admission date cannot be in the future
        if (fields.admissionDate) {
            const selectedDate = new Date(fields.admissionDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                console.warn("Cannot set admission date to future");
                delete fields.admissionDate;
            }
        }

        const updatedBeds = { ...record.beds };
        updatedBeds[bedId] = {
            ...currentPatient,
            clinicalCrib: { ...currentPatient.clinicalCrib, ...fields }
        };
        saveAndUpdate({ ...record, beds: updatedBeds, lastUpdated: new Date().toISOString() });
    };

    // ========================================================================
    // Clear Operations
    // ========================================================================

    const clearPatient = (bedId: string) => {
        if (!record) return;
        const updatedBeds = { ...record.beds };
        const cleanPatient = createEmptyPatient(bedId);
        cleanPatient.location = updatedBeds[bedId].location;
        cleanPatient.clinicalCrib = undefined;
        cleanPatient.hasCompanionCrib = false;

        updatedBeds[bedId] = cleanPatient;
        saveAndUpdate({ ...record, beds: updatedBeds });
    };

    const clearAllBeds = () => {
        if (!record) return;
        const updatedBeds: Record<string, PatientData> = {};

        BEDS.forEach(bed => {
            const cleanPatient = createEmptyPatient(bed.id);
            cleanPatient.location = record.beds[bed.id]?.location;
            cleanPatient.clinicalCrib = undefined;
            cleanPatient.hasCompanionCrib = false;
            updatedBeds[bed.id] = cleanPatient;
        });

        saveAndUpdate({
            ...record,
            beds: updatedBeds,
            discharges: [],
            transfers: [],
            lastUpdated: new Date().toISOString()
        });
    };

    // ========================================================================
    // Move/Copy Operations
    // ========================================================================

    const moveOrCopyPatient = (type: 'move' | 'copy', sourceBedId: string, targetBedId: string) => {
        if (!record) return;
        const sourceData = record.beds[sourceBedId];

        // Validation: Cannot move/copy empty patient
        if (!sourceData.patientName) {
            console.warn(`Cannot ${type} empty patient from ${sourceBedId}`);
            return;
        }

        const updatedBeds = { ...record.beds };

        if (type === 'move') {
            updatedBeds[targetBedId] = {
                ...sourceData,
                bedId: targetBedId,
                location: updatedBeds[targetBedId].location
            };
            const cleanSource = createEmptyPatient(sourceBedId);
            cleanSource.location = updatedBeds[sourceBedId].location;
            updatedBeds[sourceBedId] = cleanSource;
        } else {
            const cloneData = JSON.parse(JSON.stringify(sourceData));
            updatedBeds[targetBedId] = {
                ...cloneData,
                bedId: targetBedId,
                location: updatedBeds[targetBedId].location
            };
        }
        saveAndUpdate({ ...record, beds: updatedBeds });
    };

    // ========================================================================
    // Block/Extra Bed Operations
    // ========================================================================

    const toggleBlockBed = (bedId: string, reason?: string) => {
        if (!record) return;
        const updatedBeds = { ...record.beds };
        const currentBed = updatedBeds[bedId];
        const newIsBlocked = !currentBed.isBlocked;

        updatedBeds[bedId] = {
            ...currentBed,
            isBlocked: newIsBlocked,
            blockedReason: newIsBlocked ? (reason || '') : ''
        };
        saveAndUpdate({ ...record, beds: updatedBeds, lastUpdated: new Date().toISOString() });
    };

    const toggleExtraBed = (bedId: string) => {
        if (!record) return;
        const currentExtras = record.activeExtraBeds || [];
        const newExtras = currentExtras.includes(bedId)
            ? currentExtras.filter(id => id !== bedId)
            : [...currentExtras, bedId];
        saveAndUpdate({ ...record, activeExtraBeds: newExtras });
    };

    // ========================================================================
    // Return API
    // ========================================================================

    return {
        updatePatient,
        updatePatientMultiple,
        updateCudyr,
        updateClinicalCrib,
        updateClinicalCribMultiple,
        clearPatient,
        clearAllBeds,
        moveOrCopyPatient,
        toggleBlockBed,
        toggleExtraBed
    };
};
