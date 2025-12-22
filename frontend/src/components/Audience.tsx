
import { Truck, HardHat, Building2, Check } from 'lucide-react';

const AUDIENCES = [
    {
        id: "logistics",
        icon: <Truck className="w-6 h-6" />,
        title: "Logistics & Transport",
        points: ["Driver Identity Verification", "License Validity Checks", "Reducing Cargo Theft"]
    },
    {
        id: "construction",
        icon: <HardHat className="w-6 h-6" />,
        title: "Construction & Infra",
        points: ["Daily Wage Worker Onboarding", "Site Access Control", "Safety Compliance Records"]
    },
    {
        id: "security",
        icon: <Building2 className="w-6 h-6" />,
        title: "Private Security",
        points: ["Guard Background Checks", "Instant Aadhaar Validation", "Shift Management Rosters"]
    }
];

export const Audience = () => {
    return (
        <section id="solutions" className="bg-slate-950 py-24">
            <div className="py-8 px-4 mx-auto max-w-screen-xl lg:px-6">
                <div className="mx-auto max-w-screen-sm text-center mb-8 lg:mb-16">
                    <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-white">Built for <span className="text-emerald-500">Frontline Operations</span></h2>
                    <p className="font-light text-gray-400 lg:text-xl sm:px-16 xl:px-48">
                        Simplifying compliance for India's hardest-working sectors.
                    </p>
                </div>

                <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-3">
                    {AUDIENCES.map((item) => (
                        <div key={item.id} className="items-center bg-slate-900/40 backdrop-blur-xl rounded-xl shadow-lg shadow-emerald-900/5 sm:flex p-6 border border-white/10 hover:border-emerald-500/50 transition-colors">
                            <div className="w-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-900/30 rounded-lg text-emerald-400">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight text-white">
                                        {item.title}
                                    </h3>
                                </div>
                                <ul className="space-y-3 text-gray-400">
                                    {item.points.map((point, idx) => (
                                        <li key={idx} className="flex items-center space-x-2 text-sm">
                                            <Check className="w-4 h-4 text-emerald-500" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
