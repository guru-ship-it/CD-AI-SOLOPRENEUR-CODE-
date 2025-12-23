import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { GlassCard } from '../components/ui/GlassCard';
import { TactileButton } from '../components/ui/TactileButton';
import { ShieldCheck, User, FileText, Smartphone, Scan, ShieldAlert, Layers, Command, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletWidget } from '../components/billing/WalletWidget';
import { BulkUploader } from '../components/verification/BulkUploader';
import { cn } from '../utils/cn';

const VERIFICATION_TYPES = [
    { id: 'PAN', name: 'PAN Verification', icon: <FileText className="w-5 h-5" />, fields: ['idNumber'] },
    { id: 'DRIVING_LICENSE', name: 'Driving License', icon: <Smartphone className="w-5 h-5" />, fields: ['idNumber', 'dob'] },
    { id: 'DIGILOCKER', name: 'DigiLocker Connect', icon: <ShieldCheck className="w-5 h-5" />, fields: ['accessToken'] },
    { id: 'SINGAPORE', name: 'Singapore NRIC', icon: <User className="w-5 h-5" />, fields: ['idNumber'] },
    { id: 'VISION', name: 'Identity OCR', icon: <Scan className="w-5 h-5" />, fields: ['imageBase64'] },
    { id: 'CRIME_CHECK', name: 'Police Verification', icon: <ShieldAlert className="w-5 h-5" />, fields: ['name', 'fatherName', 'address'] },
];

export const VerificationTerminal: React.FC = () => {
    const [selectedType, setSelectedType] = useState(VERIFICATION_TYPES[0]);
    const [mode, setMode] = useState<'SINGLE' | 'BULK'>('SINGLE');
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
            } else if (response.data.status === 'PENDING_BACKGROUND_CHECK') {
                toast.info('Background Search Initiated');
            } else {
                toast.error(response.data.error || 'Verification Failed');
            }
        } catch (error: any) {
            console.error('Verification Error:', error);
            if (error.code === 'failed-precondition' || error.message?.includes('INSUFFICIENT_BALANCE')) {
                toast.error('Insufficient Credits: Please top up your wallet to continue.');
            } else {
                toast.error(error.message || 'System Error Connecting to Gateway');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBatchSubmit = async (items: any[]) => {
        setLoading(true);
        try {
            const batchFn = httpsCallable(functions, 'processBatch');
            const response: any = await batchFn({
                items,
                type: selectedType.id
            });
            toast.success(`Batch ${response.data.batchId} initiated. Processing ${items.length} items.`);
        } catch (error: any) {
            toast.error(error.message || 'Batch Submission Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = async (verificationId: string) => {
        if (!verificationId) return;
        setLoading(true);
        try {
            const genFn = httpsCallable(functions, 'generateCertificate');
            const response: any = await genFn({ verificationId });
            if (response.data?.downloadUrl) {
                window.open(response.data.downloadUrl, '_blank');
                toast.success('Certificate Generated Successfully');
            } else {
                throw new Error('No download URL returned');
            }
        } catch (error: any) {
            console.error('Download Error:', error);
            toast.error(error.message || 'Failed to generate certificate');
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Type Selection & Wallet */}
                <div className="lg:col-span-4 space-y-8">
                    <WalletWidget />

                    <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1">
                        <button
                            onClick={() => setMode('SINGLE')}
                            className={cn(
                                "flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === 'SINGLE' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Command className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> Single
                        </button>
                        <button
                            onClick={() => setMode('BULK')}
                            className={cn(
                                "flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === 'BULK' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Layers className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> Bulk (CSV)
                        </button>
                    </div>

                    <div className="space-y-3">
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
                </div>

                {/* Input & Output */}
                <div className="lg:col-span-8 space-y-6">
                    {mode === 'BULK' ? (
                        <BulkUploader onBatchSubmit={handleBatchSubmit} />
                    ) : (
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

                                {selectedType.fields.includes('name') && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Legal Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/80 border border-slate-200 rounded-xl p-4 text-sm font-bold tracking-tight outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                            value={inputs.name || ''}
                                            onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                                        />
                                    </div>
                                )}

                                {selectedType.fields.includes('fatherName') && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Father's Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/80 border border-slate-200 rounded-xl p-4 text-sm font-bold tracking-tight outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                            value={inputs.fatherName || ''}
                                            onChange={(e) => setInputs({ ...inputs, fatherName: e.target.value })}
                                        />
                                    </div>
                                )}

                                {selectedType.fields.includes('address') && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Address</label>
                                        <textarea
                                            rows={2}
                                            className="w-full bg-white/80 border border-slate-200 rounded-xl p-4 text-sm font-bold tracking-tight outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                            value={inputs.address || ''}
                                            onChange={(e) => setInputs({ ...inputs, address: e.target.value })}
                                        />
                                    </div>
                                )}

                                {selectedType.fields.includes('accessToken') && (
                                    <div className="space-y-1.5 text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl">
                                        <TactileButton variant="primary" className="mx-auto" onClick={() => toast.success("OAuth Connector Active")}>
                                            Open DigiLocker OAuth
                                        </TactileButton>
                                    </div>
                                )}

                                {selectedType.fields.includes('imageBase64') && (
                                    <div className="space-y-1.5 text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl">
                                        <Scan className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                        <TactileButton variant="secondary" className="mx-auto">
                                            Upload ID Screenshot
                                        </TactileButton>
                                    </div>
                                )}

                                {!selectedType.fields.includes('accessToken') && !selectedType.fields.includes('imageBase64') && (
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
                    )}

                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                            >
                                <GlassCard className={cn(
                                    "p-6 border-l-8 transition-all",
                                    result.isValid ? "border-emerald-500 bg-emerald-50/20" : "border-red-500 bg-red-50/20"
                                )}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Normalized Result</p>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                                {result.legalName || 'Unknown Identity'}
                                            </h4>
                                            {result.rawResponse?.jobId && (
                                                <p className="text-[10px] font-black text-blue-600 mt-2 uppercase tracking-widest font-mono">
                                                    ASYNC JOB STARTED: {result.rawResponse.jobId}
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
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                            <p className="text-xs font-bold text-red-700">{result.error}</p>
                                        </div>
                                    )}

                                    <div className="mt-6 pt-4 border-t border-slate-900/10 flex justify-between items-center">
                                        <details className="cursor-pointer group outline-none flex-1">
                                            <summary className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors list-none">
                                                View Forensic Audit Trail (Raw Response)
                                            </summary>
                                            <pre className="mt-4 p-4 bg-slate-900 text-emerald-400 text-[10px] font-mono rounded-xl overflow-x-auto shadow-inner">
                                                {JSON.stringify(result.rawResponse || result, null, 2)}
                                            </pre>
                                        </details>

                                        {result.verificationId && (
                                            <TactileButton
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleDownloadCertificate(result.verificationId)}
                                                disabled={loading}
                                            >
                                                {loading ? 'Generating...' : 'Download Audit Proof'}
                                            </TactileButton>
                                        )}
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
