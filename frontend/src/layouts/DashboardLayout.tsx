
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar'; // Improved Import

const IconGoogleAuth = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
        <path d="M12 16V12" stroke="#10B981" strokeLinecap="round" />
        <path d="M12 8H12.01" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// MFA Modal Component
const MFAModal = ({ onVerify }: { onVerify: (code: string) => Promise<boolean> }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Hardcoded logic for demo: code 123456
        const success = await onVerify(code);
        if (!success) {
            setError('Invalid code. Try 123456');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-emerald-100 rounded-full">
                        <IconGoogleAuth />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Security Challenge</h2>
                <p className="text-center text-gray-500 mb-6">
                    Please enter the code from your Google Authenticator app to access the Master Dashboard.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            maxLength={6}
                            className="w-full text-center text-3xl tracking-[0.5em] font-mono py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-900/10 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify Identity'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const DashboardLayout = () => {
    const { isMFAVerified, verifyMFA } = useAuth(); // removed 'user' as it's used in Sidebar now

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Security Challenge Overlay */}
            {(!isMFAVerified) && <MFAModal onVerify={verifyMFA} />}

            {/* Crystal Glass Sidebar - Refactored */}
            <Sidebar />

            {/* Main Content Area */}
            <main className={`flex-1 ml-64 min-h-screen p-8 transition-all duration-300 ${!isMFAVerified ? 'blur-md' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};
