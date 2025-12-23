import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';

// Types
export type UserRole = 'MASTER_ADMIN' | 'COMPANY_ADMIN' | 'USER';

interface User {
    email: string;
    role: UserRole;
    name: string;
    phone: string;
    photoURL?: string;
}

interface AuthContextType {
    user: User | null;
    isMFAVerified: boolean;
    verifyMFA: (code: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock User Data
const MOCK_USER: User = {
    email: 'guru@compliancedesk.ai',
    role: 'MASTER_ADMIN',
    name: 'Guru',
    phone: '+91 90002 01232',
    photoURL: 'https://ui-avatars.com/api/?name=Guru&background=0D9488&color=fff',
};

// Hardcoded Google Authenticator Code for Simulation
const MOCK_MFA_CODE = '123456';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Simulator: Always logged in as Guru
    const [user, setUser] = useState<User | null>(MOCK_USER);
    const [isMFAVerified, setIsMFAVerified] = useState(true);
    const [sessionId] = useState(Math.random().toString(36).substring(7));
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

    const login = async (_email: string, _password: string) => {
        // Simulation login
        await new Promise(resolve => setTimeout(resolve, 500));
        setUser(MOCK_USER);
    };

    const logout = useCallback(() => {
        setUser(null);
        setIsMFAVerified(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    // Simulator: Concurrent Login Detection
    useEffect(() => {
        if (user) {
            const checkConcurrentSession = () => {
                // In production, this would check Firestore/Redis for the active sessionId
                const isConflict = localStorage.getItem(`active_session_${user.email}`) &&
                    localStorage.getItem(`active_session_${user.email}`) !== sessionId;

                if (isConflict) {
                    logout();
                    toast.error('Concurrent Session Detected', {
                        description: 'Your account has been logged in from another device. This session has been terminated for your security.',
                        duration: 10000,
                    });
                } else {
                    localStorage.setItem(`active_session_${user.email}`, sessionId);
                }
            };

            const interval = setInterval(checkConcurrentSession, 5000);
            return () => clearInterval(interval);
        }
    }, [user, sessionId, logout]);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (user) {
            timeoutRef.current = setTimeout(() => {
                logout();
                toast.error('Session expired', {
                    description: 'You have been logged out due to 15 minutes of inactivity.',
                    duration: 10000,
                });
            }, INACTIVITY_TIMEOUT);
        }
    }, [user, logout]);

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetTimer();
        };

        if (user) {
            events.forEach(event => window.addEventListener(event, handleActivity));
            resetTimer();
        }

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [user, resetTimer]);

    const verifyMFA = async (code: string): Promise<boolean> => {
        // Simulator: Network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (code === MOCK_MFA_CODE) {
            setIsMFAVerified(true);
            return true;
        }
        return false;
    };

    return (
        <AuthContext.Provider value={{ user, isMFAVerified, verifyMFA, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
