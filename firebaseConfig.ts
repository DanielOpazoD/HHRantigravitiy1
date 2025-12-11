import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB0MKYu-efNbYEZnyTy7KHqWVQvBVwozwM",
    authDomain: "hospital-hanga-roa.firebaseapp.com",
    projectId: "hospital-hanga-roa",
    storageBucket: "hospital-hanga-roa.firebasestorage.app",
    messagingSenderId: "955583524000",
    appId: "1:955583524000:web:78384874fe6c4a08d82dc5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
// Initialize Firestore with ignoreUndefinedProperties: true to allow undefined fields in objects
export const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true
});

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not available in this browser');
    }
});

export default app;
