import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Building2, UserCircle, LogOut, Search, Filter, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '../components/ui/GlassCard';
import { TactileButton } from '../components/ui/TactileButton';
import { Badge } from '../components/ui/Badge';
import { ApprovalWidget } from '../components/governance/ApprovalWidget';
import { BreachTimer } from '../components/governance/BreachTimer';
import { cn } from '../utils/cn';

const API_URL = "http://localhost:8000";

export const Dashboard = () => {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [approvals, setApprovals] = useState<any[]>([]);
    const [incidentActive, setIncidentActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 4000);
        return () => clearInterval(interval);
    }, []);

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

    const handleIncidentToggle = async () => {
        if (confirm("🚨 TRIGER EMERGENCY PROTOCOL? \n\nThis will activate the 72-hour reporting countdown for all regulators.")) {
            try {
                await fetch(`${API_URL}/incidents`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description: "Manual Admin Emergency Trigger", tenant_name: "Master Admin" })
                });
                toast.error("INCIDENT DECLARED. Breach Protocol Live.", { duration: 5000 });
                setIncidentActive(true);
            } catch (err) {
                toast.error("Failed to declare incident");
            }
        }
    };

    return (
        <div className="p-0 space-y-8">

            {/* Top Bar - Clean White + Glass */}
            <div className="flex items-center justify-between glass-panel px-6 py-4 border-white/60 bg-white/40 shadow-xl shadow-slate-900/5">
                <div className="flex items-center gap-6">
                    <div className="hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Master Terminal</p>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                            Welcome, <span className="text-emerald-500">Guru</span>
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">System Status: Secure</span>
                    </div>
                    <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                            <p className="text-[10px] font-bold text-slate-900 uppercase">asia-south1 (Mumbai)</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                            <UserCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Widgets Row 1 (Critical) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <GlassCard className="border-l-4 border-amber-500 bg-amber-50/10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Pending Approvals</p>
                            <h3 className="text-4xl font-black text-slate-900 mt-2 tabular-nums">{approvals.length}</h3>
                        </div>
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <Lock className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-amber-600/60 font-medium mt-4 italic uppercase">Critical Action Authorization Required</p>
                </GlassCard>

                <div className="md:col-span-1">
                    <BreachTimer active={incidentActive} />
                </div>

                <GlassCard className="border-l-4 border-blue-500 bg-blue-50/10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Active Tenants</p>
                            <h3 className="text-4xl font-black text-slate-900 mt-2 tabular-nums">24</h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-blue-600/60 font-medium mt-4 uppercase">Across 4 Regulatory Jurisdictions</p>
                </GlassCard>
            </div>

            {/* Approval Widget (Extended) */}
            {approvals.length > 0 && (
                <ApprovalWidget approvals={approvals} onProcess={handleProcessApproval} />
            )}

            {/* Main Streams Table */}
            <GlassCard className="p-0 overflow-hidden border-t-8 border-slate-900">
                <div className="px-8 py-6 border-b border-white/60 bg-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Verification Stream</h3>
                        <p className="text-xs text-slate-400 font-medium uppercase mt-1">Real-time Telemetry & NRIC Masking</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter forensic logs..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                        <thead className="bg-slate-900/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-4">Forensic Timestamp</th>
                                <th className="px-8 py-4">User ID / Company</th>
                                <th className="px-8 py-4 text-center">Status</th>
                                <th className="px-8 py-4 text-center">Confidence</th>
                                <th className="px-8 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20">
                            {verifications.length > 0 ? verifications.slice(0, 10).map((v, idx) => {
                                // NRIC Masking Simulation for demonstration
                                const isDemoUser = v.applicant_name === 'Arjun Kumar';
                                const maskedID = isDemoUser ? "S****421G" : `ID-${v.task_id.toString().slice(-4)}`;

                                return (
                                    <motion.tr
                                        key={idx}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + (idx * 0.05) }}
                                        className="group hover:bg-white/40 transition-all cursor-crosshair"
                                    >
                                        <td className="px-8 py-5 font-mono text-[11px] text-slate-400 tabular-nums">{v.created_at}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
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
                                            <span className="text-[10px] font-black text-emerald-600 tabular-nums">99.9%</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <TactileButton variant="ghost" size="sm" className="text-[10px] uppercase font-black tracking-widest text-emerald-600">
                                                Log
                                            </TactileButton>
                                        </td>
                                    </motion.tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic text-sm">
                                        System idling. Monitoring global telemetry...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-8 py-4 bg-slate-900/5 border-t border-white/60 flex items-center justify-between">
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
