import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, Zap, Lock, Smartphone, ChevronRight,
    Menu, X, MessageCircle, Server, Eye, Database,
    CheckCircle2, ArrowRight, ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const openWhatsApp = () => {
        window.open('https://wa.me/918125991247?text=Hi%20ComplianceDesk,%20I%20want%20to%20verify%20my%20workforce.', '_blank');
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">

            {/* --- AMBIENT LIGHTING --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Google Blue/Red/Yellow/Green Blurs */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]" />
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            </div>

            {/* --- NAVBAR --- */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-6'}`}>
                <div className={`max-w-7xl mx-auto px-6 transition-all ${isScrolled ? 'bg-[#0F172A]/90 backdrop-blur-xl border border-white/5 py-4 shadow-xl rounded-2xl' : ''}`}>
                    <div className="flex items-center justify-between">

                        {/* GOOGLE-THEMED LOGO */}
                        <div className="flex items-center gap-2 pl-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                                {/* The 4 Google Colors in the Corners */}
                                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#4285F4]"></div> {/* Blue */}
                                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#EA4335]"></div> {/* Red */}
                                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#34A853]"></div> {/* Green */}
                                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#FBBC05]"></div> {/* Yellow */}
                                {/* Inner White Box to make it a frame */}
                                <div className="absolute inset-1 bg-white rounded-lg flex items-center justify-center">
                                    <ShieldCheck className="text-slate-900 w-6 h-6" />
                                </div>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                Compliance<span className="text-[#4285F4]">Desk</span><span className="text-[#34A853]">.ai</span>
                            </span>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
                            <a href="#features" className="hover:text-white transition-colors">Platform</a>
                            <a href="#tech" className="hover:text-[#4285F4] transition-colors">Google Stack</a>
                            <a href="#legal" className="hover:text-white transition-colors">Compliance</a>
                        </div>

                        {/* CTA */}
                        <div className="hidden md:flex items-center gap-4 pr-2">
                            <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Login</Link>
                            <button
                                onClick={openWhatsApp}
                                className="bg-[#34A853] hover:bg-[#2e964a] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-green-900/20 flex items-center gap-2"
                            >
                                <Smartphone className="w-4 h-4" />
                                Book Demo
                            </button>
                        </div>

                        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="relative z-10 pt-44 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 animate-fade-in">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        POWERED BY GOOGLE CLOUD VISION AI
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-tight mb-8 text-white">
                        Identity Verification for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05]">Bharat.</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                        Secure your logistics workforce with <strong>Banking-Grade</strong> checks.
                        <br className="hidden md:block" />
                        Built on <span className="text-white font-semibold">Google Cloud</span>. Verified by <span className="text-white font-semibold">NSDL/Protean</span>.
                    </p>

                    <div className="flex flex-col md:row items-center justify-center gap-5">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full md:w-auto px-8 py-4 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-xl font-bold transition-all shadow-[0_10px_40px_-10px_rgba(66,133,244,0.4)] flex items-center justify-center gap-2"
                        >
                            Start Free Pilot <ArrowRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={openWhatsApp}
                            className="w-full md:w-auto px-8 py-4 bg-[#1E293B] border border-white/10 hover:bg-[#334155] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5 text-[#25D366]" />
                            WhatsApp Niti
                        </button>
                    </div>

                    {/* --- TECH STACK LOGOS (REAL URLS) --- */}
                    <div id="tech" className="mt-24 pt-10 border-t border-white/5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Trusted Technology Infrastructure</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-700">

                            {/* Google Cloud */}
                            <div className="flex items-center gap-3">
                                <img src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg" className="h-10 w-10" alt="GCP" />
                                <span className="font-bold text-xl text-slate-300">Google Cloud</span>
                            </div>

                            {/* Firebase */}
                            <div className="flex items-center gap-3">
                                <img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" className="h-10 w-10" alt="Firebase" />
                                <span className="font-bold text-xl text-slate-300">Firebase</span>
                            </div>

                            {/* Protean / NSDL */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                                    <ShieldCheck className="text-emerald-500 w-6 h-6" />
                                </div>
                                <span className="font-bold text-xl text-slate-300">Protean eGov</span>
                            </div>

                        </div>
                    </div>
                </div>
            </header>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="relative z-10 py-24 px-6 bg-[#0B1120]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Feature 1: Vision AI */}
                        <div className="p-8 rounded-3xl bg-[#1E293B]/50 border border-white/5 hover:border-[#4285F4]/50 transition-all group">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                                <Eye className="text-[#4285F4] w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Google Vision OCR</h3>
                            <p className="text-slate-400">
                                We use Enterprise-grade Google Vision AI to extract data from blurry IDs with 99.8% accuracy.
                            </p>
                        </div>

                        {/* Feature 2: Vault */}
                        <div className="p-8 rounded-3xl bg-[#1E293B]/50 border border-white/5 hover:border-[#EA4335]/50 transition-all group">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                                <Lock className="text-[#EA4335] w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Secure Vault</h3>
                            <p className="text-slate-400">
                                Data is air-gapped. PII is tokenized. Compliant with <strong>DPDP Act 2023</strong> and ISO 27001 standards.
                            </p>
                        </div>

                        {/* Feature 3: WhatsApp */}
                        <div className="p-8 rounded-3xl bg-[#1E293B]/50 border border-white/5 hover:border-[#34A853]/50 transition-all group">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                                <MessageCircle className="text-[#34A853] w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">WhatsApp 'Niti' Bot</h3>
                            <p className="text-slate-400">
                                Onboard thousands of drivers in minutes via WhatsApp. No apps to download.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- LEGAL FOOTER --- */}
            <footer id="legal" className="relative z-10 border-t border-white/10 bg-[#020617] pt-20 pb-10 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            {/* Footer Logo */}
                            <div className="relative w-8 h-8 bg-white rounded flex items-center justify-center overflow-hidden">
                                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#4285F4]"></div>
                                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#EA4335]"></div>
                                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#34A853]"></div>
                                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#FBBC05]"></div>
                                <div className="absolute inset-0.5 bg-[#020617] flex items-center justify-center">
                                    <ShieldCheck className="text-white w-4 h-4" />
                                </div>
                            </div>
                            <span className="text-xl font-bold text-white">ComplianceDesk.ai</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
                            Compliance Desk AI LLP is a registered Data Fiduciary under the Digital Personal Data Protection Act, 2023.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link to="/privacy-policy" className="hover:text-[#4285F4]">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-[#4285F4]">Terms of Service</Link></li>
                            <li><Link to="/refund" className="hover:text-[#4285F4]">Refund Policy</Link></li>
                            <li><Link to="/dpdp" className="hover:text-[#4285F4]">DPDP Declaration</Link></li>
                        </ul>
                    </div>

                    {/* Contact Details */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex gap-3">
                                <span className="text-[#4285F4]">🏢</span>
                                <span>
                                    <strong>Compliance Desk AI LLP</strong><br />
                                    502B, Sadhguru Capital Park,<br />
                                    Madhapur, Hyderabad - 500081
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#EA4335]">⚖️</span>
                                <span>
                                    <strong>Grievance Officer:</strong><br />
                                    Mr. Vijay Lawyer
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[#34A853]">📞</span>
                                <a href="tel:+918125991247" className="hover:text-white">+91 8125991247</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[#FBBC05]">✉️</span>
                                <a href="mailto:support@compliancedesk.ai" className="hover:text-white">support@compliancedesk.ai</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <p>© 2025 Compliance Desk AI LLP. All rights reserved.</p>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        All Systems Operational
                    </div>
                </div>
            </footer>
        </div>
    );
};
