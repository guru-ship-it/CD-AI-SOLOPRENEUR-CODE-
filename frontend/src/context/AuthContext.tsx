import { createContext, useContext, useState, type ReactNode } from 'react';

// Types
export type UserRole = 'MASTER_ADMIN' | 'COMPANY_ADMIN' | 'USER';

interface User {
    email: string;
    role: UserRole;
    name: string;
    phone: string;
}

interface AuthContextType {
    user: User | null;
    isMFAVerified: boolean;
    verifyMFA: (code: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock User Data
const MOCK_USER: User = {
    email: 'guru@compliancedesk.ai',
    role: 'MASTER_ADMIN',
    name: 'Guru',
    phone: '+91 90002 01232',
};

// Hardcoded Google Authenticator Code for Simulation
const MOCK_MFA_CODE = '123456';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Simulator: Always logged in as Guru
    const [user, setUser] = useState<User | null>(MOCK_USER);
    const [isMFAVerified, setIsMFAVerified] = useState(false);

    const verifyMFA = async (code: string): Promise<boolean> => {
        // Simulator: Network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (code === MOCK_MFA_CODE) {
            setIsMFAVerified(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        setIsMFAVerified(false);
    };

    return (
        <AuthContext.Provider value={{ user, isMFAVerified, verifyMFA, logout }}>
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
