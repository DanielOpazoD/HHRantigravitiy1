import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
}

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthUser> => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName
        };
    } catch (error: any) {
        // Translate Firebase errors to Spanish
        const errorMessages: Record<string, string> = {
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/invalid-email': 'Email inválido',
            'auth/user-disabled': 'Usuario deshabilitado',
            'auth/too-many-requests': 'Demasiados intentos. Intente más tarde.',
            'auth/invalid-credential': 'Credenciales inválidas'
        };
        throw new Error(errorMessages[error.code] || 'Error de autenticación');
    }
};

// Create new user (for admin to create staff accounts)
export const createUser = async (email: string, password: string): Promise<AuthUser> => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName
        };
    } catch (error: any) {
        const errorMessages: Record<string, string> = {
            'auth/email-already-in-use': 'Este email ya está registrado',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/invalid-email': 'Email inválido'
        };
        throw new Error(errorMessages[error.code] || 'Error al crear usuario');
    }
};

// Sign out
export const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: AuthUser | null) => void): (() => void) => {
    return onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
            callback({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName
            });
        } else {
            callback(null);
        }
    });
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
    const user = auth.currentUser;
    if (!user) return null;
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
    };
};
