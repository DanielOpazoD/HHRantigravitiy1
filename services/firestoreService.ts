import {
    collection,
    doc,
    getDoc,
    setDoc,
    getDocs,
    query,
    orderBy,
    Timestamp,
    onSnapshot,
    where
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { DailyRecord } from '../types';

const HOSPITAL_ID = 'hanga_roa';
const COLLECTION_NAME = 'dailyRecords';

// Get collection reference
const getRecordsCollection = () => collection(db, 'hospitals', HOSPITAL_ID, COLLECTION_NAME);

/**
 * Recursively convert undefined values to null for Firestore compatibility.
 * Firestore's merge mode ignores undefined values, but respects null.
 * This ensures that deleted fields (like clinicalCrib) are properly synced.
 */
const sanitizeForFirestore = (obj: unknown): unknown => {
    if (obj === undefined) {
        return null;
    }
    if (obj === null) {
        return null;
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeForFirestore);
    }
    if (typeof obj === 'object' && obj !== null) {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = sanitizeForFirestore(value);
        }
        return result;
    }
    return obj;
};

/**
 * Convert null clinicalCrib values back to undefined when reading from Firestore.
 * This ensures the app correctly treats null as "no clinical crib".
 */
const sanitizeBeds = (beds: DailyRecord['beds']): DailyRecord['beds'] => {
    const result: DailyRecord['beds'] = {};
    for (const [bedId, patient] of Object.entries(beds)) {
        result[bedId] = {
            ...patient,
            // Convert null clinicalCrib to undefined
            clinicalCrib: patient.clinicalCrib === null ? undefined : patient.clinicalCrib
        };
    }
    return result;
};

// Convert Firestore data to DailyRecord
const docToRecord = (docData: Record<string, unknown>, docId: string): DailyRecord => {
    const rawBeds = (docData.beds as DailyRecord['beds']) || {};

    return {
        date: docId,
        beds: sanitizeBeds(rawBeds),
        discharges: (docData.discharges as DailyRecord['discharges']) || [],
        transfers: (docData.transfers as DailyRecord['transfers']) || [],
        cma: (docData.cma as DailyRecord['cma']) || [],
        nurses: (docData.nurses as DailyRecord['nurses']) || ['', ''],
        nurseName: docData.nurseName as string | undefined,
        activeExtraBeds: (docData.activeExtraBeds as string[]) || [],
        lastUpdated: docData.lastUpdated instanceof Timestamp
            ? docData.lastUpdated.toDate().toISOString()
            : (docData.lastUpdated as string) || new Date().toISOString()
    };
};

// Save record to Firestore
export const saveRecordToFirestore = async (record: DailyRecord): Promise<void> => {
    try {
        const docRef = doc(getRecordsCollection(), record.date);

        // Sanitize data to convert undefined to null
        // This ensures deletions (like removing clinicalCrib) are properly synced
        const sanitizedRecord = sanitizeForFirestore({
            ...record,
            lastUpdated: Timestamp.now()
        });

        // Use setDoc WITHOUT merge to ensure deletions are reflected
        await setDoc(docRef, sanitizedRecord as Record<string, unknown>);
        console.log('✅ Saved to Firestore:', record.date);
    } catch (error) {
        console.error('❌ Error saving to Firestore:', error);
        throw error;
    }
};

// Get single record from Firestore
export const getRecordFromFirestore = async (date: string): Promise<DailyRecord | null> => {
    try {
        const docRef = doc(getRecordsCollection(), date);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docToRecord(docSnap.data(), date);
        }
        return null;
    } catch (error) {
        console.error('❌ Error getting record from Firestore:', error);
        return null;
    }
};

// Get all records from Firestore
export const getAllRecordsFromFirestore = async (): Promise<Record<string, DailyRecord>> => {
    try {
        const q = query(getRecordsCollection(), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);

        const records: Record<string, DailyRecord> = {};
        querySnapshot.forEach((doc) => {
            records[doc.id] = docToRecord(doc.data(), doc.id);
        });

        return records;
    } catch (error) {
        console.error('❌ Error getting all records from Firestore:', error);
        return {};
    }
};

// Get records for a specific month
export const getMonthRecordsFromFirestore = async (year: number, month: number): Promise<DailyRecord[]> => {
    try {
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

        const q = query(
            getRecordsCollection(),
            where('date', '>=', startDate),
            where('date', '<=', endDate),
            orderBy('date', 'asc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => docToRecord(doc.data(), doc.id));
    } catch (error) {
        console.error('❌ Error getting month records:', error);
        return [];
    }
};

// Real-time listener for a specific date
export const subscribeToRecord = (
    date: string,
    callback: (record: DailyRecord | null) => void
): (() => void) => {
    const docRef = doc(getRecordsCollection(), date);

    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docToRecord(docSnap.data(), date));
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('❌ Firestore subscription error:', error);
        callback(null);
    });
};

// Check if Firestore is available (online)
export const isFirestoreAvailable = async (): Promise<boolean> => {
    try {
        // Try a simple read operation
        const docRef = doc(db, 'hospitals', HOSPITAL_ID);
        await getDoc(docRef);
        return true;
    } catch (error) {
        return false;
    }
};
