import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Database, ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { TactileButton } from '../components/ui/TactileButton';
import { Badge } from '../components/ui/Badge';

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-[100] px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-6 py-3 border-white/60 bg-white/40 shadow-xl shadow-slate-900/5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="font-black text-slate-900 uppercase tracking-widest text-sm">CDC AI</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-widest transition-colors">
                            Partner Login
                        </Link>
                        <TactileButton variant="primary" size="sm">
                            Request Demo
                        </TactileButton>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <Badge variant="success" dot className="bg-emerald-50 text-emerald-700">CERT-In Active</Badge>
                        <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
                            The <span className="text-emerald-500">Trust Layer</span> for Indian Enterprise.
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
                            Identity verification at sub-second speeds. Fully compliant with BNS, DPDP, and global data residency mandates.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <TactileButton variant="primary" size="lg" className="px-10">
                                Request Demo
                            </TactileButton>
                            <Link to="/login">
                                <TactileButton variant="outline" size="lg" className="px-10">
                                    Partner Login
                                </TactileButton>
                            </Link>
                        </div>
                        <div className="flex items-center gap-6 pt-6 opacity-60 grayscale group">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Compliance Backbone:</span>
                            <div className="flex gap-8 items-center grayscale group-hover:grayscale-0 transition-all duration-700">
                                <span className="text-slate-900 font-black text-lg">ISO 27001</span>
                                <span className="text-slate-900 font-black text-lg">GDPR</span>
                                <span className="text-slate-900 font-black text-lg tracking-tighter">Protean</span>
                                <span className="text-slate-900 font-black text-lg">GCP</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative hidden lg:block"
                    >
                        <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[120px]" />
                        <GlassCard className="bg-slate-900 border-0 p-1 tracking-tight overflow-hidden shadow-2xl" hover={false}>
                            <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5 space-y-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    </div>
                                    <Badge variant="neutral" className="bg-white/5 border-white/10 text-emerald-400">Verifying Identity...</Badge>
                                </div>
                                <div className="space-y-4 font-mono text-[10px]">
                                    <p className="text-emerald-400 line-clamp-1">$&gt; AUTH_INIT: TARGET_REGION="asia-south1"</p>
                                    <p className="text-white/60">$&gt; SCANNING_LICENSE: G-VISION ENGINE ENABLED</p>
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <p className="text-white font-bold">MATCH DETECTED: 99.82% Confidence</p>
                                        <p className="text-emerald-500 mt-1">DPDP_STATUS: PASS | RESIDENCY: PINNED</p>
                                    </div>
                                    <p className="text-emerald-400 animate-pulse">$&gt; ENCRYPTING_WORM: ASIA-SOUTH2 (DELHI)...</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-32 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-6 space-y-16">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                            Built for <span className="text-emerald-500">Uncompromising</span> Security
                        </h2>
                        <p className="text-slate-500 font-medium mt-4">
                            We've eliminated the compromise between speed and sovereign data protection.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <GlassCard delay={0.1} className="space-y-6">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase">Sub-Second Verification</h3>
                                <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                                    Powered by Google Vision AI, we process Aadhaar, PAN, and DLs with 99.9% accuracy in under 800ms.
                                </p>
                            </div>
                        </GlassCard>

                        <GlassCard delay={0.2} className="space-y-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                                <Database className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase">Data Sovereignty</h3>
                                <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                                    Physical infrastructure pinned to Mumbai (`asia-south1`). No data ever leaves Indian borders, satisfying all DPDP mandates.
                                </p>
                            </div>
                        </GlassCard>

                        <GlassCard delay={0.3} className="space-y-6">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase">Nuclear-Grade Vault</h3>
                                <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                                    WORM Storage implementation ensures ransomware immunity. Forensic watermarking makes data leaks instantly attributable.
                                </p>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </section>

            {/* Footer Simulation */}
            <footer className="py-12 px-6 border-t border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 grayscale brightness-0 opacity-40">
                        <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="font-black text-slate-900 uppercase tracking-widest text-xs">CDC AI</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">© 2025 COMPLIANCE DESK AI | INDIAN SOVEREIGN CLOUD</p>
                    <div className="flex gap-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-emerald-500 transition-colors">Trust Center</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-emerald-500 transition-colors">API Docs</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
