import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, ShieldCheck, ChevronRight, MessageCircle, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { toast } from 'sonner';

interface GatewayProps {
    onLogin: (type: 'individual' | 'b2b') => void;
}

export const Gateway: React.FC<GatewayProps> = ({ onLogin }) => {
    const [view, setView] = useState<'selection' | 'b2b'>('selection');
    const [activeTab, setActiveTab] = useState<'kyc' | 'kyb'>('kyc');
    const [showNitiHelp, setShowNitiHelp] = useState(true);

    const handleSelect = (type: 'individual' | 'b2b') => {
        if (type === 'individual') {
            // WhatsApp Redirection simulated
            window.open('https://wa.me/911234567890?text=START', '_blank');
        } else {
            setView('b2b');
            onLogin('b2b');
        }
    };

    const openModal = async (type: string) => {
        toast.promise(
            fetch(`/api/v1/b2b/verify/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: "DEMO_ID_123", user_id: "B2B_ADMIN_USER" })
            }).then(res => {
                if (!res.ok) throw new Error('Verification failed');
                return res.json();
            }),
            {
                loading: `Initiating ${type.replace('_', ' ').toUpperCase()}...`,
                success: (data) => {
                    return `Success: ${data.status || 'Verified'}`;
                },
                error: (err) => `Error: ${err.message}`
            }
        );
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Ambient Background Lights */}
            <div className="fixed inset-0 pointer-events-none opacity-40">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-50 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <AnimatePresence mode="wait">
                    {view === 'selection' ? (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-5xl mx-auto"
                        >
                            <div className="text-center mb-16">
                                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                                    Unified <span className="text-[#4285F4]">Identity</span> Gateway
                                </h1>
                                <p className="text-xl text-slate-500 font-medium">Select your path to secure verification</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Individual Card */}
                                <motion.div
                                    whileHover={{ y: -8, shadow: '0 25px 50px -12px rgba(66, 133, 244, 0.15)' }}
                                    onClick={() => handleSelect('individual')}
                                    className="bg-blue-50/50 p-10 rounded-[40px] border border-blue-100 cursor-pointer transition-all duration-300 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <User size={120} className="text-blue-600" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-blue-100">
                                            <User className="text-blue-600 w-8 h-8" />
                                        </div>
                                        <h2 className="text-3xl font-black text-blue-900 mb-2">Individual</h2>
                                        <p className="text-blue-600 font-bold mb-6 flex items-center gap-2">
                                            Verify Myself <ChevronRight size={16} />
                                        </p>
                                        <p className="text-blue-900/60 text-sm leading-relaxed max-w-[280px]">
                                            Quick verification for personal documents. Connect via WhatsApp in seconds.
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Business Card */}
                                <motion.div
                                    whileHover={{ y: -8, shadow: '0 25px 50px -12px rgba(52, 168, 83, 0.15)' }}
                                    onClick={() => handleSelect('b2b')}
                                    className="bg-green-50/50 p-10 rounded-[40px] border border-green-100 cursor-pointer transition-all duration-300 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Building2 size={120} className="text-green-600" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-green-100">
                                            <Building2 className="text-green-600 w-8 h-8" />
                                        </div>
                                        <h2 className="text-3xl font-black text-green-900 mb-2">Business Login</h2>
                                        <p className="text-green-600 font-bold mb-6 flex items-center gap-2">
                                            Manage Staff & Vendors <ChevronRight size={16} />
                                        </p>
                                        <p className="text-green-900/60 text-sm leading-relaxed max-w-[280px]">
                                            Enterprise dashboard for workforce KYC and vendor KYB management.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="b2b"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                                    Enterprise <span className="text-[#34A853]">Compliance</span> Dashboard
                                </h1>
                                <button
                                    onClick={() => setView('selection')}
                                    className="text-slate-400 hover:text-slate-900 text-sm font-bold flex items-center gap-2"
                                >
                                    <X size={16} /> Exit B2B
                                </button>
                            </div>

                            {/* Tabs Implementation */}
                            <div className="flex space-x-1 border-b border-slate-100 mb-8 p-1 bg-slate-50/50 rounded-2xl w-fit">
                                <button
                                    onClick={() => setActiveTab('kyc')}
                                    className={cn(
                                        "px-8 py-3 font-black text-sm rounded-xl transition-all duration-300",
                                        activeTab === 'kyc'
                                            ? "bg-white text-green-600 shadow-sm border border-green-100"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    👥 Workforce KYC
                                </button>
                                <button
                                    onClick={() => setActiveTab('kyb')}
                                    className={cn(
                                        "px-8 py-3 font-black text-sm rounded-xl transition-all duration-300",
                                        activeTab === 'kyb'
                                            ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    🏢 Vendor KYB
                                </button>
                            </div>

                            {/* Tab Content Implementation */}
                            <div className="min-h-[500px]">
                                {activeTab === 'kyc' ? (
                                    <div id="grid-workforce" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => openModal('vehicle_rc')}
                                            className="md:col-span-2 border border-gray-200 rounded-2xl p-6 hover:bg-green-50 cursor-pointer flex items-center transition-all bg-white"
                                        >
                                            <div className="ml-4">
                                                <h3 className="font-bold text-slate-900">Vehicle RC Verify</h3>
                                                <p className="text-xs text-gray-500">Ownership & Fitness</p>
                                            </div>
                                            <ChevronRight className="ml-auto text-gray-300 w-4 h-4" />
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => openModal('epfo_search')}
                                            className="border border-gray-200 rounded-2xl p-6 hover:bg-green-50 cursor-pointer text-center transition-all bg-white flex flex-col items-center justify-center"
                                        >
                                            <h4 className="font-bold mt-2 text-slate-900">EPFO Search</h4>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => openModal('mobile_verify')}
                                            className="border border-gray-200 rounded-2xl p-6 hover:bg-green-50 cursor-pointer text-center transition-all bg-white flex flex-col items-center justify-center"
                                        >
                                            <h4 className="font-bold mt-2 text-slate-900">Mobile Check</h4>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => openModal('forgery_check')}
                                            className="md:col-span-2 bg-red-50 border border-red-100 rounded-2xl p-6 cursor-pointer flex items-center justify-center transition-all hover:bg-red-100/50"
                                        >
                                            <span className="font-bold text-red-700 ml-2">Run Forgery Scan</span>
                                        </motion.div>
                                    </div>
                                ) : (
                                    <div id="grid-kyb" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => openModal('gstin_check')}
                                            className="md:col-span-2 border border-gray-200 rounded-2xl p-6 hover:bg-blue-50 cursor-pointer flex items-center transition-all bg-white"
                                        >
                                            <div className="ml-4">
                                                <h3 className="font-bold text-slate-900">GSTIN Verification</h3>
                                                <p className="text-xs text-gray-500">Tax Compliance & Filing Status</p>
                                            </div>
                                            <ChevronRight className="ml-auto text-gray-300 w-4 h-4" />
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => openModal('pull_doc')}
                                            className="border border-gray-200 rounded-2xl p-6 hover:bg-blue-50 cursor-pointer text-center transition-all bg-white flex flex-col items-center justify-center"
                                        >
                                            <h4 className="font-bold mt-2 text-slate-900">Fetch Original</h4>
                                            <p className="text-xs text-gray-400">DigiLocker</p>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Niti Assistant */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
                <AnimatePresence>
                    {showNitiHelp && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            className="bg-white border border-green-100 shadow-2xl rounded-[32px] rounded-br-none p-6 mb-4 max-w-[240px] relative"
                        >
                            <button
                                onClick={() => setShowNitiHelp(false)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <X size={12} />
                            </button>
                            <p className="text-sm font-bold text-slate-800 leading-snug">
                                <span className="text-green-600 font-black mb-1 block">Namaste! I am Niti.</span>
                                Ready to assist you with compliance onboarding.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                    onClick={() => setShowNitiHelp(!showNitiHelp)}
                >
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-white rounded-full border-4 border-white shadow-xl overflow-hidden flex items-center justify-center group-hover:border-green-50 transition-all">
                        <ShieldCheck size={40} className="text-green-600 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                </motion.button>
            </div>
        </div>
    );
};
