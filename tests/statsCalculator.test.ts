import { describe, it, expect } from 'vitest';
import { calculateStats, CensusStatistics } from '../services/calculations/statsCalculator';
import { PatientData, PatientStatus, Specialty } from '../types';

// Helper to create a minimal patient
const createPatient = (overrides: Partial<PatientData> = {}): PatientData => ({
    bedId: 'test',
    patientName: '',
    rut: '',
    pathology: '',
    specialty: Specialty.EMPTY,
    age: '',
    status: PatientStatus.EMPTY,
    admissionDate: '',
    devices: [],
    isBlocked: false,
    bedMode: 'Cama',
    clinicalCrib: undefined,
    hasWristband: false,
    isBedridden: false,
    surgicalComplication: false,
    isUPC: false,
    hasCompanionCrib: false,
    ...overrides
});

describe('statsCalculator', () => {

    describe('calculateStats', () => {

        it('should return zeros for empty beds', () => {
            const beds: Record<string, PatientData> = {
                'R1': createPatient({ bedId: 'R1' }),
                'R2': createPatient({ bedId: 'R2' }),
            };

            const stats = calculateStats(beds);

            expect(stats.occupiedBeds).toBe(0);
            expect(stats.totalHospitalized).toBe(0);
            expect(stats.blockedBeds).toBe(0);
        });

        it('should count occupied beds correctly', () => {
            const beds: Record<string, PatientData> = {
                'R1': createPatient({ bedId: 'R1', patientName: 'Juan Pérez' }),
                'R2': createPatient({ bedId: 'R2', patientName: 'María García' }),
                'R3': createPatient({ bedId: 'R3' }), // Empty
            };

            const stats = calculateStats(beds);

            expect(stats.occupiedBeds).toBe(2);
            expect(stats.totalHospitalized).toBe(2);
        });

        it('should count blocked beds correctly', () => {
            const beds: Record<string, PatientData> = {
                'R1': createPatient({ bedId: 'R1', isBlocked: true, blockedReason: 'Mantención' }),
                'R2': createPatient({ bedId: 'R2', patientName: 'María García' }),
            };

            const stats = calculateStats(beds);

            expect(stats.blockedBeds).toBe(1);
            expect(stats.occupiedBeds).toBe(1);
        });

        it('should count clinical cribs (nested) correctly', () => {
            const nestedCrib = createPatient({
                bedId: 'R1',
                patientName: 'RN de María',
                bedMode: 'Cuna'
            });

            const beds: Record<string, PatientData> = {
                'R1': createPatient({
                    bedId: 'R1',
                    patientName: 'María García',
                    clinicalCrib: nestedCrib
                }),
            };

            const stats = calculateStats(beds);

            expect(stats.occupiedBeds).toBe(1);
            expect(stats.occupiedCribs).toBe(1);
            expect(stats.clinicalCribsCount).toBe(1);
            expect(stats.totalHospitalized).toBe(2); // Mother + baby
        });

        it('should count companion cribs (RN Sano) correctly', () => {
            const beds: Record<string, PatientData> = {
                'R1': createPatient({
                    bedId: 'R1',
                    patientName: 'María García',
                    hasCompanionCrib: true
                }),
            };

            const stats = calculateStats(beds);

            expect(stats.companionCribs).toBe(1);
            expect(stats.totalCribsUsed).toBe(1);
        });

        it('should count beds in Cuna mode correctly', () => {
            const beds: Record<string, PatientData> = {
                'NEO1': createPatient({
                    bedId: 'NEO1',
                    patientName: 'RN Pérez',
                    bedMode: 'Cuna'
                }),
            };

            const stats = calculateStats(beds);

            expect(stats.occupiedBeds).toBe(1);
            expect(stats.clinicalCribsCount).toBe(1); // Cuna mode counts as clinical crib
            expect(stats.totalCribsUsed).toBe(1);
        });

        it('should calculate available capacity correctly', () => {
            const beds: Record<string, PatientData> = {
                'R1': createPatient({ bedId: 'R1', isBlocked: true }),
                'R2': createPatient({ bedId: 'R2', isBlocked: true }),
            };

            const stats = calculateStats(beds);

            expect(stats.blockedBeds).toBe(2);
            expect(stats.availableCapacity).toBe(stats.serviceCapacity - 2);
        });

    });

});
