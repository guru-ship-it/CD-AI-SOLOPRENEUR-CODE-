
import { Zap, Shield, CheckCircle, Database } from 'lucide-react';

const FEATURE_DATA = [
    {
        icon: <Zap className="w-8 h-8 text-emerald-400" />,
        title: "Sub-Second Latency",
        description: "Process identity verifications in under 1 second. Built for high-throughput logistics and gate-entry systems."
    },
    {
        icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
        title: "99.9% Accuracy",
        description: "Powered by Google Vision AI to detect forgeries, blur, and invalid documents with industry-leading precision."
    },
    {
        icon: <Shield className="w-8 h-8 text-emerald-400" />,
        title: "Enterprise Security",
        description: "AES-256 encryption at rest and in transit. Full compliance with the Digital Personal Data Protection (DPDP) Act."
    },
    {
        icon: <Database className="w-8 h-8 text-emerald-400" />,
        title: "Infinite Scale",
        description: "Serverless architecture that scales from 10 to 10M verifications without manual intervention."
    }
];

export const Features = () => {
    return (
        <section id="features" className="bg-slate-900 py-24 border-t border-slate-800">
            <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
                <div className="max-w-screen-md mb-8 lg:mb-16">
                    <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-white">
                        Why Compliance<span className="text-emerald-500">Desk</span>?
                    </h2>
                    <p className="text-gray-400 sm:text-xl">
                        We solved the "Speed vs Accuracy" trade-off. Get instant verifications without compromising on security or precision.
                    </p>
                </div>
                <div className="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-12 md:space-y-0">
                    {FEATURE_DATA.map((feature, idx) => (
                        <div key={idx} className="group p-6 bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg shadow-emerald-900/5 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1">
                            <div className="flex justify-center items-center mb-4 w-14 h-14 rounded-full bg-emerald-900/30 group-hover:bg-emerald-900/50 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
