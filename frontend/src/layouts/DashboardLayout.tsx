
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar'; // Improved Import

import { MFAModal } from '../components/ui/MFAModal';
import { BhashaSwitcher } from '../components/ui/BhashaSwitcher';

export const DashboardLayout = () => {
    const { isMFAVerified, verifyMFA } = useAuth(); // removed 'user' as it's used in Sidebar now

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Security Challenge Overlay */}
            {/* Security Challenge Overlay - FAT 1.3/1.4 */}
            {(!isMFAVerified) && (
                <MFAModal
                    isOpen={!isMFAVerified}
                    onClose={() => { }}
                    onSuccess={(code) => verifyMFA(code)}
                    actionLabel="Dashboard Access"
                />
            )}

            {/* Crystal Glass Sidebar - Refactored */}
            <Sidebar />

            {/* Main Content Area */}
            <main className={`flex-1 ml-64 min-h-screen p-8 transition-all duration-300 relative ${!isMFAVerified ? 'blur-md' : ''}`}>
                {/* Bhasha Switcher - Top Right of Main Content */}
                <div className="absolute top-8 right-8 z-10">
                    <BhashaSwitcher />
                </div>
                <Outlet />
            </main>
        </div>
    );
};
