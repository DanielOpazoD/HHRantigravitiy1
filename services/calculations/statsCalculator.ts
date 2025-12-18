/**
 * Statistics Calculator
 * Calculates hospital census statistics from bed data.
 */

import { PatientData } from '../../types';
import { BEDS, HOSPITAL_CAPACITY } from '../../constants';

export interface CensusStatistics {
    occupiedBeds: number;         // Main patients (Bed or Cuna mode)
    occupiedCribs: number;        // Nested patients only (internal)
    clinicalCribsCount: number;   // Display: Main(Cuna) + Nested
    companionCribs: number;       // RN Sano count
    totalCribsUsed: number;       // Physical crib count
    totalHospitalized: number;    // Total patients
    blockedBeds: number;          // Blocked beds
    serviceCapacity: number;      // Hospital capacity excluding blocked beds
    availableCapacity: number;    // Service capacity minus hospitalized patients
}

/**
 * Calculate comprehensive census statistics from bed data
 */
export const calculateStats = (beds: Record<string, PatientData>): CensusStatistics => {
    let occupiedBeds = 0;
    let occupiedCribs = 0;
    let blockedBeds = 0;
    let companionCribs = 0;
    let resourceCribs = 0;
    let clinicalCribsCount = 0;

    BEDS.forEach(bed => {
        const data = beds[bed.id];
        if (!data) return;

        if (data.isBlocked) {
            blockedBeds++;
        } else {
            const isMainOccupied = data.patientName && data.patientName.trim() !== '';

            // 1. Occupied Bed (Main slot has patient)
            if (isMainOccupied) {
                occupiedBeds++;
            }

            // 2. Nested Occupied Cribs (Clinical crib sub-patients)
            if (data.clinicalCrib?.patientName?.trim()) {
                occupiedCribs++;
            }

            // --- CRIB STATS ---

            // A) Main is Cuna Mode & Occupied -> Clinical Crib patient
            if (isMainOccupied && data.bedMode === 'Cuna') {
                clinicalCribsCount++;
                resourceCribs++;
            }

            // B) Clinical Crib (Nested) Exists -> Clinical Crib patient
            if (data.clinicalCrib?.patientName) {
                clinicalCribsCount++;
                resourceCribs++;
            }

            // C) Main is Cuna Mode but Empty -> Uses crib resource
            if (!isMainOccupied && data.bedMode === 'Cuna') {
                resourceCribs++;
            }

            // D) Companion Crib (RN Sano)
            if (data.hasCompanionCrib) {
                companionCribs++;
                resourceCribs++;
            }
        }
    });

    return {
        occupiedBeds,
        occupiedCribs,
        clinicalCribsCount,
        companionCribs,
        totalCribsUsed: resourceCribs,
        totalHospitalized: occupiedBeds + occupiedCribs,
        blockedBeds,
        serviceCapacity: HOSPITAL_CAPACITY - blockedBeds,
        availableCapacity: (HOSPITAL_CAPACITY - blockedBeds) - (occupiedBeds + occupiedCribs),
    };
};
