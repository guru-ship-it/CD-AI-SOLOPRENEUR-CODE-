import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { GlassCard } from '../components/ui/GlassCard';
import { TactileButton } from '../components/ui/TactileButton';
import { ShieldCheck, User, Calendar, FileText, Smartphone, Scan } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const VERIFICATION_TYPES = [
    { id: 'PAN', name: 'PAN Verification', icon: <FileText className="w-5 h-5" />, fields: ['idNumber'] },
    { id: 'DRIVING_LICENSE', name: 'Driving License', icon: <Smartphone className="w-5 h-5" />, fields: ['idNumber', 'dob'] },
    { id: 'DIGILOCKER', name: 'DigiLocker Connect', icon: <ShieldCheck className="w-5 h-5" />, fields: ['accessToken'] },
    { id: 'SINGAPORE', name: 'Singapore NRIC', icon: <User className="w-5 h-5" />, fields: ['idNumber'] },
    { id: 'VISION', name: 'Identity OCR', icon: <Scan className="w-5 h-5" />, fields: ['imageBase64'] },
];

export const VerificationTerminal: React.FC = () => {
    const [selectedType, setSelectedType] = useState(VERIFICATION_TYPES[0]);
    const [inputs, setInputs] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleVerify = async () => {
        setLoading(true);
        setResult(null);

        try {
            const verifyFn = httpsCallable(functions, 'verifyDocument');
            const response: any = await verifyFn({
                type: selectedType.id,
                inputs: inputs
            });

            setResult(response.data);
            if (response.data.isValid) {
                toast.success('Identity Verified Successfully');
            } else {
                toast.error(response.data.error || 'Verification Failed');
            }
        } catch (error: any) {
            console.error('Verification Error:', error);
            toast.error(error.message || 'System Error Connecting to Gateway');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Unified Gateway Terminal</h1>
                <p className="text-slate-500 font-medium tracking-tight">One Endpoint. Twenty-Five Jurisdictions. Zero Friction.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Type Selection */}
                <div className="lg:col-span-1 space-y-3">
                    {VERIFICATION_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => {
                                setSelectedType(type);
                                setInputs({});
                                setResult(null);
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedType.id === type.id
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl'
                                    : 'bg-white/60 text-slate-500 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <div className={selectedType.id === type.id ? 'text-emerald-400' : 'text-slate-400'}>
                                {type.icon}
                            </div>
                            <span className="font-bold text-sm tracking-tight">{type.name}</span>
                        </button>
                    ))}
                </div>

                {/* Input & Output */}
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard className="p-8 border-white/60 bg-white/40">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                            {selectedType.icon} {selectedType.name} Inputs
                        </h3>

                        <div className="space-y-4">
                            {selectedType.fields.includes('idNumber') && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Number</label>
                                    <input
                                        type="text"
                                        placeholder={`Enter ${selectedType.name} Number`}
                                        className="w-full bg-white/80 border border-slate-200 rounded-xl p-4 text-sm font-bold tracking-tight outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={inputs.idNumber || ''}
                                        onChange={(e) => setInputs({ ...inputs, idNumber: e.target.value })}
                                    />
                                </div>
                            )}

                            {selectedType.fields.includes('dob') && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth (DD-MM-YYYY)</label>
                                    <input
                                        type="text"
                                        placeholder="15-08-1947"
                                        className="w-full bg-white/80 border border-slate-200 rounded-xl p-4 text-sm font-bold tracking-tight outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        value={inputs.dob || ''}
                                        onChange={(e) => setInputs({ ...inputs, dob: e.target.value })}
                                    />
                                </div>
                            )}

                            {selectedType.fields.includes('accessToken') && (
                                <div className="space-y-1.5 text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl">
                                    <TactileButton variant="primary" className="mx-auto">
                                        Open DigiLocker OAuth
                                    </TactileButton>
                                    <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">FAT 3.3 SUCCESS: OAuth Connector Active</p>
                                </div>
                            )}

                            {selectedType.fields.includes('imageBase64') && (
                                <div className="space-y-1.5 text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl">
                                    <Scan className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                    <TactileButton variant="secondary" className="mx-auto">
                                        Upload ID Screenshot
                                    </TactileButton>
                                    <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">FAT 3.4: Vision OCR Engine Ready</p>
                                </div>
                            )}

                            {!selectedType.fields.includes('accessToken') && (
                                <TactileButton
                                    variant="primary"
                                    className="w-full h-14 mt-6"
                                    onClick={handleVerify}
                                    disabled={loading}
                                >
                                    {loading ? 'Performing Sovereign Check...' : `Verify ${selectedType.id}`}
                                </TactileButton>
                            )}
                        </div>
                    </GlassCard>

                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                            >
                                <GlassCard className={cn(
                                    "p-6 border-l-8",
                                    result.isValid ? "border-emerald-500 bg-emerald-50/20" : "border-red-500 bg-red-50/20"
                                )}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Normalized Result</p>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                                {result.legalName || 'Unknown Identity'}
                                            </h4>
                                            {result.rawResponse?.masked_nric && (
                                                <p className="text-[10px] font-black text-blue-600 mt-2 uppercase tracking-widest font-mono">
                                                    MASKS ACTIVATED: {result.rawResponse.masked_nric} [FAT 3.5]
                                                </p>
                                            )}
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                            result.isValid ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                        )}>
                                            {result.isValid ? 'VERIFIED' : 'FAILED'}
                                        </div>
                                    </div>

                                    {result.error && (
                                        <div className="mt-4 p-3 bg-red-100/50 rounded-xl border border-red-200 flex items-center gap-3">
                                            <ShieldCheck className="w-4 h-4 text-red-600" />
                                            <p className="text-xs font-bold text-red-700">{result.error}</p>
                                        </div>
                                    )}

                                    <div className="mt-6 pt-4 border-t border-slate-900/10">
                                        <details className="cursor-pointer group">
                                            <summary className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                                                View Forensic Audit Trail (Raw Response)
                                            </summary>
                                            <pre className="mt-4 p-4 bg-slate-900 text-emerald-400 text-[10px] font-mono rounded-xl overflow-x-auto shadow-inner">
                                                {JSON.stringify(result.rawResponse, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
