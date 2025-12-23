
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { MFAModal } from '../components/ui/MFAModal';
import { BhashaSwitcher } from '../components/ui/BhashaSwitcher';
import { Logo } from '../components/Logo';
import { StatusBanner } from '../components/layout/StatusBanner';
import { cn } from '../utils/cn';

export const DashboardLayout = () => {
    const { isMFAVerified, verifyMFA } = useAuth(); // removed 'user' as it's used in Sidebar now

    return (
        <div className="flex h-screen bg-[#0F172A] text-slate-200 font-sans overflow-hidden">
            {/* Security Challenge Overlay */}
            {(!isMFAVerified) && (
                <MFAModal
                    isOpen={!isMFAVerified}
                    onClose={() => { }}
                    onSuccess={(code) => verifyMFA(code)}
                    actionLabel="Dashboard Access"
                />
            )}

            {/* SIDEBAR - Integrated Role-based logic is in the component */}
            <Sidebar />

            {/* MAIN CONTENT AREA */}
            <main className={cn(
                "flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-500",
                !isMFAVerified && "blur-xl"
            )}>
                {/* Top Bar - Premium Dark Glass */}
                <header className="h-16 flex-shrink-0 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Logo className="h-8" />
                    </div>

                    <div className="flex items-center gap-6">
                        <StatusBanner />
                        <div className="flex items-center gap-4 border-l border-white/5 pl-6">
                            <BhashaSwitcher />
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4285F4] to-[#EA4335] shadow-lg shadow-blue-500/20" title="User Profile"></div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
