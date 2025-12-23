import React from 'react';
import {
    CreditCard, Fingerprint, Car, Scale,
    Building2, Plane, ArrowRight
} from 'lucide-react';

const verificationTypes = [
    {
        id: 'PAN',
        label: 'PAN Card',
        desc: 'Finance & Tax Identity',
        icon: <CreditCard className="w-8 h-8 text-[#4285F4]" />, // Google Blue
        bg: 'bg-[#4285F4]/10',
        border: 'hover:border-[#4285F4]/50',
        glow: 'group-hover:shadow-[0_0_30px_rgba(66,133,244,0.2)]'
    },
    {
        id: 'AADHAAR',
        label: 'Aadhaar XML',
        desc: 'Biometric Residency',
        icon: <Fingerprint className="w-8 h-8 text-[#EA4335]" />, // Google Red
        bg: 'bg-[#EA4335]/10',
        border: 'hover:border-[#EA4335]/50',
        glow: 'group-hover:shadow-[0_0_30px_rgba(234,67,53,0.2)]'
    },
    {
        id: 'DRIVING_LICENSE',
        label: 'Driving License',
        desc: 'Transport & Logistics',
        icon: <Car className="w-8 h-8 text-[#FBBC05]" />, // Google Yellow
        bg: 'bg-[#FBBC05]/10',
        border: 'hover:border-[#FBBC05]/50',
        glow: 'group-hover:shadow-[0_0_30px_rgba(251,188,5,0.2)]'
    },
    {
        id: 'CRIME_CHECK',
        label: 'Court Record',
        desc: 'Criminal Background',
        icon: <Scale className="w-8 h-8 text-[#34A853]" />, // Google Green
        bg: 'bg-[#34A853]/10',
        border: 'hover:border-[#34A853]/50',
        glow: 'group-hover:shadow-[0_0_30px_rgba(52,168,83,0.2)]'
    },
    {
        id: 'GST',
        label: 'GST Verification',
        desc: 'Business Validity',
        icon: <Building2 className="w-8 h-8 text-purple-400" />,
        bg: 'bg-purple-500/10',
        border: 'hover:border-purple-500/50',
        glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]'
    },
    {
        id: 'PASSPORT',
        label: 'Passport',
        desc: 'Global Identity',
        icon: <Plane className="w-8 h-8 text-cyan-400" />,
        bg: 'bg-cyan-500/10',
        border: 'hover:border-cyan-500/50',
        glow: 'group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]'
    }
];

interface Props {
    onSelect: (type: string) => void;
}

const VerificationGrid: React.FC<Props> = ({ onSelect }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verificationTypes.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`
            group relative p-6 rounded-2xl border border-white/5 
            bg-[#1E293B]/60 backdrop-blur-md text-left transition-all duration-300
            hover:-translate-y-1 ${item.border} ${item.glow}
          `}
                >
                    {/* Icon Bubble */}
                    <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                        {item.icon}
                    </div>

                    {/* Text Content */}
                    <h3 className="text-lg font-bold text-white mb-1">{item.label}</h3>
                    <p className="text-sm text-slate-400 mb-4">{item.desc}</p>

                    {/* Select Arrow */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 group-hover:text-white transition-colors">
                        SELECT <ArrowRight className="w-3 h-3" />
                    </div>
                </button>
            ))}
        </div>
    );
};

export default VerificationGrid;
