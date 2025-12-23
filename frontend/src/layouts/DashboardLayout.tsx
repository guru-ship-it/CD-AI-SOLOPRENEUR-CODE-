import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';

import { BhashaSwitcher } from '../components/ui/BhashaSwitcher';
import { StatusBanner } from '../components/layout/StatusBanner';
import { Bell } from 'lucide-react';
import { cn } from '../utils/cn';

export const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
            {/* Security Challenge Overlay */}
            {/* Security Challenge Overlay - Disabled */}

            {/* SIDEBAR - Clean White (Logic moved to Sidebar component) */}
            <Sidebar />

            {/* MAIN CONTENT AREA */}
            <main className={cn(
                "flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-500"
            )}>
                {/* Top Bar - Glass White */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 leading-none">Dashboard</h1>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-black">
                            {user?.role === 'MASTER_ADMIN' ? 'Governance' : 'Management'} Center
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <StatusBanner />

                        <div className="flex items-center gap-4 border-l border-slate-200 pl-6 text-slate-900">
                            <BhashaSwitcher />

                            {/* Notifications */}
                            <button className="p-2 text-slate-400 hover:text-[#4285F4] hover:bg-blue-50 rounded-full transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            {/* Profile Avatar (Google Colors Ring) */}
                            <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-100 p-0.5 shadow-sm overflow-hidden flex items-center justify-center">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#4285F4] via-[#EA4335] to-[#FBBC05]"></div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
                    <div className="max-w-7xl mx-auto">
                        {children || <Outlet />}
                    </div>
                </div>
            </main>
        </div>
    );
};
