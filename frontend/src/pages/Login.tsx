import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { BhashaSwitcher } from '../components/ui/BhashaSwitcher';
import { ConsentModal } from '../components/ui/ConsentModal';
import { NitiMascot } from '../components/ui/NitiMascot';
import { TactileButton } from '../components/ui/TactileButton';

export const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock login logic
            await login(email, password);
            toast.success("Identity Verified. Proceeding to Secure Shell.");
            navigate('/dashboard');
        } catch (err) {
            toast.error("Authentication Failed. Check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden font-sans">
            <ConsentModal isOpen={showConsent} onClose={() => setShowConsent(false)} onAgree={() => setShowConsent(false)} />

            {/* Bhasha Switcher - Top Right */}
            <div className="absolute top-6 right-6 z-[60]">
                <BhashaSwitcher />
            </div>

            {/* Left: Branding & Login Form */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-24 bg-white relative z-10">
                <div className="max-w-md w-full mx-auto space-y-12">

                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="font-black text-slate-900 uppercase tracking-[0.2em] text-sm">CDC AI</span>
                        </Link>
                        <NitiMascot size="sm" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
                            {t('auth.login_title')} <span className="text-emerald-500">Access</span>.
                        </h1>
                        <p className="text-slate-500 font-medium tracking-tight">
                            {t('auth.login_subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Terminal</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-900 text-sm"
                                        placeholder="admin@compliancedesk.ai"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Security Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-900 text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <TactileButton type="submit" disabled={loading} className="w-full py-4 text-base">
                            {loading ? "Authenticating..." : "Establish Secure Session"}
                            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                        </TactileButton>

                        <div className="flex items-center gap-4 py-2">
                            <div className="h-[1px] flex-1 bg-slate-100" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Hardware Auth Ready</span>
                            <div className="h-[1px] flex-1 bg-slate-100" />
                        </div>
                    </form>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setShowConsent(true)}
                            className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] hover:text-emerald-700 transition-colors"
                        >
                            View DPDP Consent Directive
                        </button>
                    </div>

                    <p className="text-center text-xs text-slate-400 font-medium">
                        Confidential Platform. Unauthorized access is forensically tracked.
                    </p>
                </div>
            </div>

            {/* Right: Abstract 3D Shield & Mesh */}
            <div className="hidden md:flex flex-1 bg-slate-900 relative items-center justify-center overflow-hidden">

                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-500 rounded-full blur-[140px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-slate-100 rounded-full blur-[120px] opacity-20" />
                </div>

                {/* Floating 3D Shield Element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                    className="relative z-10 w-96 h-96 flex items-center justify-center"
                >
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="glass-panel p-12 flex flex-col items-center gap-6 border-white/20 bg-white/5 backdrop-blur-3xl shadow-2xl">
                        <ShieldCheck className="w-32 h-32 text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.4)]" />
                        <div className="text-center space-y-2">
                            <p className="text-white text-2xl font-black uppercase tracking-tighter">Verified State</p>
                            <p className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest">Nuclear Ground Layer</p>
                        </div>
                    </div>
                </motion.div>

                {/* Floating Accents */}
                <div className="absolute bottom-12 right-12 text-white/10 font-mono text-[8vw] select-none font-black leading-none">
                    TRUST
                </div>
            </div>
        </div>
    );
};
