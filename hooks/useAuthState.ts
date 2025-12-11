import { useState, useEffect } from 'react';
import { onAuthChange, signOut, AuthUser } from '../services/authService';

interface UseAuthStateReturn {
    user: AuthUser | null;
    authLoading: boolean;
    isFirebaseConnected: boolean;
    handleLogout: () => Promise<void>;
}

/**
 * Hook to manage authentication state
 * Extracts auth logic from App.tsx for cleaner separation of concerns
 */
export const useAuthState = (): UseAuthStateReturn => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthChange((authUser) => {
            setUser(authUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Firebase connection status tracks auth status
    useEffect(() => {
        setIsFirebaseConnected(!!user);
    }, [user]);

    const handleLogout = async () => {
        await signOut();
    };

    return {
        user,
        authLoading,
        isFirebaseConnected,
        handleLogout
    };
};
