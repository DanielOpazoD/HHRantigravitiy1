/**
 * Type definitions for values used in patient data updates and other operations.
 * These replace `any` types throughout the codebase for better type safety.
 */

import { PatientData, CudyrScore, PatientStatus, Specialty, DeviceDetails } from './core';
import { LucideIcon } from 'lucide-react';

// ============================================================================
// Patient Data Field Values
// ============================================================================

/**
 * All possible values that can be assigned to PatientData fields
 */
export type PatientFieldValue =
    | string
    | number
    | boolean
    | string[]
    | undefined
    | PatientData
    | CudyrScore
    | DeviceDetails
    | PatientStatus
    | Specialty;

/**
 * Specific field value types for type-safe updates
 */
export type PatientStringField =
    | 'patientName'
    | 'rut'
    | 'age'
    | 'pathology'
    | 'admissionDate'
    | 'bedId'
    | 'location'
    | 'handoffNote'
    | 'blockedReason'
    | 'documentType';

export type PatientBooleanField =
    | 'isBlocked'
    | 'hasWristband'
    | 'isBedridden'
    | 'surgicalComplication'
    | 'isUPC'
    | 'hasCompanionCrib';

export type PatientArrayField = 'devices';

export type PatientEnumField = 'status' | 'specialty' | 'bedMode';

export type PatientObjectField = 'clinicalCrib' | 'cudyr' | 'deviceDetails';

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Standard error type for catch blocks - use with type narrowing
 */
export type CaughtError = unknown;

/**
 * Helper to extract error message from unknown error
 */
export function getErrorMessage(error: CaughtError): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return 'An unknown error occurred';
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Type for Lucide icon components used in props
 */
export type IconComponent = LucideIcon;

// ============================================================================
// Data Utilities
// ============================================================================

/**
 * Generic array item selector (replaces `any[]` in randomItem)
 */
export function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * CSV escape function with proper typing
 */
export function escapeCsvValue(val: string | number | boolean | null | undefined): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
}
