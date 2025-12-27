import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, UserCircle, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '../components/ui/GlassCard';
import { TactileButton } from '../components/ui/TactileButton';
import { Badge } from '../components/ui/Badge';
import { ApprovalWidget } from '../components/governance/ApprovalWidget';
import { BreachTimer } from '../components/governance/BreachTimer';
import { NitiMascot } from '../components/ui/NitiMascot';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
// import { cn } from '../utils/cn';

const API_URL = "/api";

export const Dashboard = () => {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvals, setApprovals] = useState<any[]>([]);
    const [incidentActive, setIncidentActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [activeTab, setActiveTab] = useState<'kyc' | 'kyb'>('kyc');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vRes, aRes] = await Promise.all([
                    fetch(`${API_URL}/verifications`),
                    fetch(`${API_URL}/approvals`)
                ]);
                const [vData, aData] = await Promise.all([vRes.json(), aRes.json()]);
                setVerifications(vData);
                setApprovals(aData);
                setIncidentActive(vData.some((v: any) => v.status === 'UNDER_REVIEW'));
            } catch (err) {
                console.error("Dashboard fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 4000);
        return () => clearInterval(interval);
    }, []);

    const openModal = async (type: string) => {
        toast.promise(
            fetch(`${API_URL}/v1/b2b/verify/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: "DEMO_ID_B2B", user_id: "B2B_ADMIN_DASHBOARD" })
            }).then(res => {
                if (!res.ok) throw new Error('Verification failed');
                return res.json();
            }),
            {
                loading: `Initiating ${type.replace('_', ' ').toUpperCase()}...`,
                success: (data) => `Success: ${data.status || 'Verified'}`,
                error: (err) => `Error: ${err.message}`
            }
        );
    };

    const handleProcessApproval = async (id: number, status: string) => {
        toast.promise(
            fetch(`${API_URL}/approvals/${id}?status=${status}&approver=SecurityOfficerB`, { method: 'PUT' }),
            {
                loading: 'Processing authorization...',
                success: () => {
                    setApprovals(prev => prev.filter(a => a.id !== id));
                    return `Action ${status.toLowerCase()} successfully`;
                },
                error: 'Authorization failed'
            }
        );
    };

    return (
        <div className="p-0 space-y-8 pb-20">

            {/* Top Bar - Clean White + Glass */}
            <div className="flex items-center justify-between glass-panel px-6 py-6 border-slate-200 bg-white shadow-sm transition-all group">
                <div className="flex items-center gap-6">
                    <NitiMascot size="sm" className="hidden sm:block" />
                    <div className="hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Enterprise Dashboard</p>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                            Welcome, <span className="text-[#34A853]">Admin</span>
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                        <div className="w-1.5 h-1.5 bg-[#34A853] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-[#34A853] uppercase tracking-tighter">Compliance Status: Active</span>
                    </div>
                    <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-200">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* B2B TABS */}
            <div className="flex space-x-1 border-b border-slate-100 p-1 bg-slate-50/50 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('kyc')}
                    className={`px-8 py-3 font-black text-xs rounded-xl transition-all duration-300 ${activeTab === 'kyc' ? "bg-white text-green-600 shadow-sm border border-green-100" : "text-slate-400"
                        }`}
                >
                    👥 Workforce KYC
                </button>
                <button
                    onClick={() => setActiveTab('kyb')}
                    className={`px-8 py-3 font-black text-xs rounded-xl transition-all duration-300 ${activeTab === 'kyb' ? "bg-white text-blue-600 shadow-sm border border-blue-100" : "text-slate-400"
                        }`}
                >
                    🏢 Vendor KYB
                </button>
            </div>

            {/* GRID CONTENT */}
            <AnimatePresence mode="wait">
                {activeTab === 'kyc' ? (
                    <motion.div
                        key="kyc"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Vehicle RC Verify */}
                        <div onClick={() => openModal('vehicle_rc')} className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 hover:bg-blue-50/50 cursor-pointer flex items-center shadow-sm group transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-24 h-24 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                            </div>
                            <div className="w-16 h-16 bg-blue-100/50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                            </div>
                            <div className="ml-8">
                                <h3 className="text-xl font-bold text-slate-900">Vehicle RC Verify</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">Instantly validate ownership, fitness, and insurance status via NDL.</p>
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full w-fit border border-blue-100">
                                    <span className="w-1 h-1 bg-blue-600 rounded-full animate-ping" /> REAL-TIME API
                                </div>
                            </div>
                        </div>

                        {/* EPFO Search */}
                        <div onClick={() => openModal('epfo_search')} className="bg-white border border-slate-200 rounded-3xl p-8 hover:bg-indigo-50/50 cursor-pointer flex flex-col items-start justify-between shadow-sm group transition-all">
                            <div className="w-14 h-14 bg-indigo-100/50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:rotate-6 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                            </div>
                            <div className="mt-6">
                                <h4 className="font-bold text-slate-900">EPFO Search</h4>
                                <p className="text-xs text-slate-500 mt-1">UAN & PF History Lookup</p>
                            </div>
                        </div>

                        {/* Mobile Check */}
                        <div onClick={() => openModal('mobile_verify')} className="bg-white border border-slate-200 rounded-3xl p-8 hover:bg-green-50/50 cursor-pointer flex flex-col items-start justify-between shadow-sm group transition-all">
                            <div className="w-14 h-14 bg-green-100/50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-95 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            </div>
                            <div className="mt-6">
                                <h4 className="font-bold text-slate-900">Mobile Check</h4>
                                <p className="text-xs text-slate-500 mt-1">Ownership & Sim Swap Detection</p>
                            </div>
                        </div>

                        {/* Forgery Scan */}
                        <div onClick={() => openModal('forgery_check')} className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 cursor-pointer flex items-center group transition-all hover:scale-[1.01] shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-50" />
                            <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500 relative z-10">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <div className="ml-8 relative z-10">
                                <h3 className="text-xl font-bold text-white">Run Forgery Scan</h3>
                                <p className="text-sm text-slate-400 font-medium">Advanced AI Detection for doctored ID documents.</p>
                            </div>
                            <div className="ml-auto relative z-10">
                                <div className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl group-hover:bg-red-500 transition-colors">
                                    Secure Scan
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="kyb"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* GSTIN Verification */}
                        <div onClick={() => openModal('gstin_check')} className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 hover:bg-orange-50/50 cursor-pointer flex items-center shadow-sm group transition-all">
                            <div className="w-16 h-16 bg-orange-100/50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <div className="ml-8">
                                <h3 className="text-xl font-bold text-slate-900">GSTIN Verification</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">Tax Compliance, Status, and Filing Frequency Audit.</p>
                            </div>
                        </div>

                        {/* Fetch Original (DigiLocker) */}
                        <div onClick={() => openModal('pull_doc')} className="bg-white border border-slate-200 rounded-3xl p-8 hover:bg-red-50/50 cursor-pointer flex flex-col items-center justify-center text-center shadow-sm group transition-all">
                            <div className="w-14 h-14 bg-red-100/50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg>
                            </div>
                            <div className="mt-6">
                                <h4 className="font-bold text-slate-900">Fetch Original</h4>
                                <p className="text-xs text-slate-500 mt-1">Direct DigiLocker Pull</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Approval Widget (Extended) */}
            {approvals.length > 0 && (
                <ApprovalWidget approvals={approvals} onProcess={handleProcessApproval} />
            )}

            {/* Main Streams Table */}
            <GlassCard className="p-0 overflow-hidden border-t-8 border-slate-100 bg-white">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Verification Stream</h3>
                        <p className="text-xs text-slate-500 font-medium uppercase mt-1">Real-time Telemetry & NRIC Masking</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter forensic logs..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <TactileButton variant="ghost" size="sm" className="p-2">
                            <Filter className="w-4 h-4" />
                        </TactileButton>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-4">Forensic Timestamp</th>
                                <th className="px-8 py-4">User ID / Company</th>
                                <th className="px-8 py-4 text-center">Status</th>
                                <th className="px-8 py-4 text-center">Confidence</th>
                                <th className="px-8 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-5"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="w-8 h-8 rounded-lg" />
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-4 w-12 mx-auto" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-8 w-16 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : verifications.length > 0 ? (
                                verifications.slice(0, 10).map((v, idx) => {
                                    // NRIC Masking Simulation for demonstration
                                    const isDemoUser = v.applicant_name === 'Arjun Kumar';
                                    const maskedID = isDemoUser ? "S****421G" : `ID-${v.task_id.toString().slice(-4)}`;

                                    return (
                                        <motion.tr
                                            key={idx}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + (idx * 0.05) }}
                                            className="group hover:bg-slate-50/80 transition-all cursor-crosshair"
                                        >
                                            <td className="px-8 py-5 font-mono text-[11px] text-slate-500 tabular-nums">{v.created_at}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-[#4285F4]/10 group-hover:text-[#4285F4] transition-colors border border-slate-100">
                                                        <UserCircle className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{maskedID}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{v.applicant_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <Badge variant={v.status === 'COMPLETED' ? 'success' : v.status === 'UNDER_REVIEW' ? 'warning' : 'neutral'} dot>
                                                    {v.status}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="text-[10px] font-black text-[#4285F4] tabular-nums">99.9%</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <TactileButton variant="ghost" size="sm" className="text-[10px] uppercase font-black tracking-widest text-[#4285F4]">
                                                    Log
                                                </TactileButton>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12">
                                        <EmptyState onAction={() => window.location.href = '/verification'} />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Active Sockets: 12</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span>Sovereignty Handshake: ASIA-SOUTH1</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
