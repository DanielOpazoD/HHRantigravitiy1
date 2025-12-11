/**
 * useClinicalCrib Hook
 * Manages clinical crib (nested patient) operations.
 * Extracted from useBedManagement for better separation of concerns.
 */

import { useCallback } from 'react';
import { DailyRecord, PatientData, PatientFieldValue } from '../types';
import { createEmptyPatient } from '../services/factories/patientFactory';

export interface ClinicalCribActions {
    createCrib: (bedId: string) => void;
    removeCrib: (bedId: string) => void;
    updateCribField: (bedId: string, field: keyof PatientData, value: PatientFieldValue) => void;
}

export const useClinicalCrib = (
    record: DailyRecord | null,
    saveAndUpdate: (updatedRecord: DailyRecord) => void
): ClinicalCribActions => {

    /**
     * Create a new clinical crib for a patient bed
     */
    const createCrib = useCallback((bedId: string) => {
        if (!record) return;

        const updatedBeds = { ...record.beds };
        const parentPatient = updatedBeds[bedId];

        // Validation: Cannot add crib to empty bed
        if (!parentPatient.patientName) {
            console.warn(`Cannot add clinical crib to empty bed ${bedId}`);
            return;
        }

        const newCrib = createEmptyPatient(bedId);
        newCrib.bedMode = 'Cuna';

        updatedBeds[bedId] = {
            ...parentPatient,
            clinicalCrib: newCrib,
            hasCompanionCrib: false
        };

        saveAndUpdate({
            ...record,
            beds: updatedBeds,
            lastUpdated: new Date().toISOString()
        });
    }, [record, saveAndUpdate]);

    /**
     * Remove clinical crib from a patient bed
     */
    const removeCrib = useCallback((bedId: string) => {
        if (!record) return;

        const updatedBeds = { ...record.beds };
        const parentPatient = updatedBeds[bedId];

        updatedBeds[bedId] = {
            ...parentPatient,
            clinicalCrib: undefined
        };

        saveAndUpdate({
            ...record,
            beds: updatedBeds,
            lastUpdated: new Date().toISOString()
        });
    }, [record, saveAndUpdate]);

    /**
     * Update a field on the clinical crib
     */
    const updateCribField = useCallback((
        bedId: string,
        field: keyof PatientData,
        value: PatientFieldValue
    ) => {
        if (!record) return;

        // Validation: Admission date cannot be in the future
        if (field === 'admissionDate' && typeof value === 'string') {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                console.warn("Cannot set admission date to future");
                return;
            }
        }

        const updatedBeds = { ...record.beds };
        const parentPatient = updatedBeds[bedId];

        if (!parentPatient.clinicalCrib) return;

        updatedBeds[bedId] = {
            ...parentPatient,
            clinicalCrib: {
                ...parentPatient.clinicalCrib,
                [field]: value
            }
        };

        saveAndUpdate({
            ...record,
            beds: updatedBeds,
            lastUpdated: new Date().toISOString()
        });
    }, [record, saveAndUpdate]);

    return {
        createCrib,
        removeCrib,
        updateCribField
    };
};
