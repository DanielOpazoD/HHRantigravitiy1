/**
 * Core Type Definitions
 * Main data types for the hospital census application
 */

export enum BedType {
    UTI = 'UTI',
    MEDIA = 'MEDIA',
}

export enum Specialty {
    MEDICINA = 'Medicina Interna',
    CIRUGIA = 'Cirugía',
    TRAUMATOLOGIA = 'Traumatología',
    GINECOLOGIA = 'Ginecología',
    PSIQUIATRIA = 'Psiquiatría',
    PEDIATRIA = 'Pediatría',
    OBSTETRICIA = 'Obstetricia',
    OTRO = 'Otro',
    EMPTY = ''
}

export enum PatientStatus {
    GRAVE = 'Grave',
    DE_CUIDADO = 'De cuidado',
    ESTABLE = 'Estable',
    EMPTY = ''
}

// Fixed list of 18 beds + Extras
export interface BedDefinition {
    id: string;
    name: string;
    type: BedType;
    isCuna: boolean; // Default configuration
    isExtra?: boolean;
}

export interface CudyrScore {
    // Dependencia (6 items)
    changeClothes: number;
    mobilization: number;
    feeding: number;
    elimination: number;
    psychosocial: number;
    surveillance: number;

    // Riesgo (8 items)
    vitalSigns: number;
    fluidBalance: number;
    oxygenTherapy: number;
    airway: number;
    proInterventions: number;
    skinCare: number;
    pharmacology: number;
    invasiveElements: number;
}

export interface PatientData {
    bedId: string;
    isBlocked: boolean;
    blockedReason?: string;

    // Dynamic Furniture Configuration
    bedMode: 'Cama' | 'Cuna'; // Defines if the physical spot is set up as a Bed or a Crib (Census relevant)
    hasCompanionCrib: boolean; // Defines if there is an EXTRA crib for a healthy RN (Resource relevant)

    // Nested Patient Data for Clinical Crib (Sick Newborn sharing room with Mother)
    clinicalCrib?: PatientData;

    patientName: string;
    rut: string;
    documentType?: 'RUT' | 'Pasaporte'; // Switcher
    age: string;
    birthDate?: string;
    biologicalSex?: 'Masculino' | 'Femenino' | 'Indeterminado';
    insurance?: 'Fonasa' | 'Isapre' | 'Particular';

    // Demographics Update
    admissionOrigin?: 'CAE' | 'APS' | 'Urgencias' | 'Pabellón' | 'Otro';
    admissionOriginDetails?: string; // For 'Otro'
    origin?: 'Residente' | 'Turista Nacional' | 'Turista Extranjero'; // Now labeled "Condición de permanencia"

    isRapanui?: boolean;
    pathology: string;
    diagnosisComments?: string; // New field for sub-diagnosis details (e.g. surgical dates)
    specialty: Specialty;
    status: PatientStatus;
    admissionDate: string;
    hasWristband: boolean;
    isBedridden: boolean;
    devices: string[];
    deviceDetails?: DeviceDetails; // Dates for CUP, CVC, VMI
    surgicalComplication: boolean;
    isUPC: boolean;
    location?: string;

    // CUDYR Data
    cudyr?: CudyrScore;

    // Handoff / Nursing Evolution
    handoffNote?: string;
}

/**
 * Device date tracking for infection surveillance (IAAS)
 * Tracks installation/removal dates for invasive devices
 */
export interface DeviceInfo {
    installationDate?: string;  // Date device was installed
    removalDate?: string;       // Date device was removed (optional)
}

export interface DeviceDetails {
    CUP?: DeviceInfo;  // Sonda Foley
    CVC?: DeviceInfo;  // Catéter Venoso Central
    VMI?: DeviceInfo;  // Ventilación Mecánica Invasiva
}

export interface DischargeData {
    id: string;
    bedName: string;
    bedId: string; // Needed for undo
    bedType: string;
    patientName: string;
    rut: string;
    diagnosis: string;
    status: 'Vivo' | 'Fallecido';
    age?: string;
    insurance?: string;
    origin?: string;
    isRapanui?: boolean;
    originalData?: PatientData; // Snapshot for Undo
    isNested?: boolean; // Identifies if it was a clinical crib
}

export interface TransferData {
    id: string;
    bedName: string;
    bedId: string; // Needed for undo
    bedType: string;
    patientName: string;
    rut: string;
    diagnosis: string;
    evacuationMethod: string;
    receivingCenter: string;
    receivingCenterOther?: string;
    transferEscort?: string;
    age?: string;
    insurance?: string;
    origin?: string;
    isRapanui?: boolean;
    originalData?: PatientData; // Snapshot for Undo
    isNested?: boolean; // Identifies if it was a clinical crib
}

export interface CMAData {
    id: string;
    bedName: string; // Generic location or identifier
    patientName: string;
    rut: string;
    age: string;
    diagnosis: string;
    specialty: string;
    interventionType: 'Cirugía Mayor Ambulatoria' | 'Procedimiento Médico Ambulatorio'; // New field
    enteredBy?: string; // Optional: user who added the record
    timestamp?: string; // Optional: creation time
}

export interface DailyRecord {
    date: string;
    beds: Record<string, PatientData>;
    discharges: DischargeData[];
    transfers: TransferData[];
    cma: CMAData[]; // Cirugía Mayor Ambulatoria
    lastUpdated: string;
    nurses: string[];
    nurseName?: string;
    activeExtraBeds: string[];
}

export interface Statistics {
    occupiedBeds: number; // Adult beds occupied by patients (Census)
    occupiedCribs: number; // Nested Cribs ONLY (Internal counter)
    clinicalCribsCount: number; // Main (Cuna Mode) + Nested Cribs (For Resource Display)
    companionCribs: number; // Cribs used by healthy RN (associated to mother)
    totalCribsUsed: number; // Total physical cribs (Occupied by Patient + Companion)
    totalHospitalized: number; // occupiedBeds + occupiedCribs
    blockedBeds: number;
    serviceCapacity: number; // Physical capacity excluding blocked beds
    availableCapacity: number; // Service capacity minus occupied beds/cribs
}
