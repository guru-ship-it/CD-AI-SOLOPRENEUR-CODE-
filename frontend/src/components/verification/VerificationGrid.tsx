
import { CreditCard, Fingerprint, Car, Scale, Building2, Plane, ArrowRight } from 'lucide-react';

const verificationTypes = [
    {
        id: 'pan',
        label: 'PAN Card',
        desc: 'Finance & Tax Identity',
        icon: <CreditCard className="w-6 h-6 text-[#4285F4]" />,
        bg: 'bg-blue-50', // Light Blue Bubble
        border: 'hover:border-blue-200',
        shadow: 'hover:shadow-blue-100'
    },
    {
        id: 'aadhaar',
        label: 'Aadhaar XML',
        desc: 'Biometric Residency',
        icon: <Fingerprint className="w-6 h-6 text-[#EA4335]" />,
        bg: 'bg-red-50',
        border: 'hover:border-red-200',
        shadow: 'hover:shadow-red-100'
    },
    {
        id: 'dl',
        label: 'Driving License',
        desc: 'Transport & Logistics',
        icon: <Car className="w-6 h-6 text-[#FBBC05]" />,
        bg: 'bg-yellow-50',
        border: 'hover:border-yellow-200',
        shadow: 'hover:shadow-yellow-100'
    },
    {
        id: 'court',
        label: 'Court Record',
        desc: 'Criminal Background',
        icon: <Scale className="w-6 h-6 text-[#34A853]" />,
        bg: 'bg-green-50',
        border: 'hover:border-green-200',
        shadow: 'hover:shadow-green-100'
    },
    {
        id: 'gst',
        label: 'GST Verification',
        desc: 'Business Validity',
        icon: <Building2 className="w-6 h-6 text-purple-600" />,
        bg: 'bg-purple-50',
        border: 'hover:border-purple-200',
        shadow: 'hover:shadow-purple-100'
    },
    {
        id: 'passport',
        label: 'Passport',
        desc: 'Global Identity',
        icon: <Plane className="w-6 h-6 text-cyan-600" />,
        bg: 'bg-cyan-50',
        border: 'hover:border-cyan-200',
        shadow: 'hover:shadow-cyan-100'
    }
];

const VerificationGrid = ({ onSelect }: { onSelect: (id: string) => void }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {verificationTypes.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`
            group relative p-6 rounded-2xl border border-slate-200 bg-white 
            text-left transition-all duration-300 shadow-sm
            hover:-translate-y-1 hover:shadow-xl ${item.border} ${item.shadow}
          `}
                >
                    <div className="flex items-start justify-between mb-4">
                        {/* Icon Bubble */}
                        <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            {item.icon}
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-1">{item.label}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                </button>
            ))}
        </div>
    );
};

export default VerificationGrid;
