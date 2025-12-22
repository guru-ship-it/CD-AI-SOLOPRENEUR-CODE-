
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const Hero = () => {
    return (
        <section className="bg-slate-900 relative overflow-hidden pt-32 pb-16 min-h-[90vh] flex items-center">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-900/30 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
                <div className="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-300 bg-gray-800 rounded-full hover:bg-gray-700 role='alert'">
                    <span className="text-xs bg-emerald-600 rounded-full text-white px-4 py-1.5 mr-3">New</span> <span className="text-sm font-medium">Enterprise API v2.0 is live</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                </div>
                <h1 className="mb-6 text-4xl font-extrabold tracking-tight leading-none text-white md:text-6xl lg:text-7xl">
                    Identity Verification for <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">India's Enterprise Sector</span>
                </h1>
                <p className="mb-8 text-lg font-normal text-gray-400 lg:text-xl sm:px-16 xl:px-48">
                    Verify Aadhaar, PAN, and Driver's Licenses with <span className="text-emerald-400 font-semibold">99.9% Google Vision AI Accuracy</span>.
                    Built for Logistics, Construction, and High-Volume Staffing.
                </p>
                <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
                    <a href="#" className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-800 transition-all shadow-lg shadow-emerald-900/50">
                        Get Started
                        <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
                    </a>
                    <a href="#" className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-300 rounded-lg border border-gray-600 hover:text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-700 transition-all">
                        <ShieldCheck className="mr-2 -ml-1 w-5 h-5" />
                        View Security Docs
                    </a>
                </div>

                {/* Trust Badges / Stats */}
                <div className="px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36">
                    <span className="font-semibold text-gray-400 uppercase tracking-widest text-xs">TRUSTED BY INDUSTRY LEADERS</span>
                    <div className="flex flex-wrap justify-center items-center mt-8 text-gray-500 sm:justify-between grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">99.9%</span>
                            <span className="text-xs uppercase tracking-wide">Accuracy</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">&lt;1s</span>
                            <span className="text-xs uppercase tracking-wide">Latency</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">DPDP</span>
                            <span className="text-xs uppercase tracking-wide">Compliant</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">256-bit</span>
                            <span className="text-xs uppercase tracking-wide">Encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
