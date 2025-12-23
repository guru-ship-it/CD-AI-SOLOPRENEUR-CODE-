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
import VerificationGrid from '../components/verification/VerificationGrid';
import { cn } from '../utils/cn';

const VERIFICATION_TYPES = [
    { id: 'pan', name: 'PAN Verification', icon: <FileText className="w-5 h-5" />, fields: ['idNumber'] },
    { id: 'aadhaar', name: 'Aadhaar XML', icon: <Fingerprint className="w-5 h-5" />, fields: ['idNumber'] },
    { id: 'dl', name: 'Driving License', icon: <Smartphone className="w-5 h-5" />, fields: ['idNumber', 'dob'] },
    { id: 'court', name: 'Court Record', icon: <ShieldAlert className="w-5 h-5" />, fields: ['name', 'fatherName', 'address'] },
    { id: 'gst', name: 'GST Verification', icon: <Building2 className="w-5 h-5" />, fields: ['gstNumber'] },
    { id: 'passport', name: 'Passport Verification', icon: <Plane className="w-5 h-5" />, fields: ['idNumber'] },
    { id: 'DIGILOCKER', name: 'DigiLocker Connect', icon: <ShieldCheck className="w-5 h-5" />, fields: ['accessToken'] },
    { id: 'SINGAPORE', name: 'Singapore NRIC', icon: <User className="w-5 h-5" />, fields: ['idNumber'] },
    { id: 'VISION', name: 'Identity OCR', icon: <Scan className="w-5 h-5" />, fields: ['imageBase64'] },
];

export const VerificationTerminal: React.FC = () => {
    const [selectedType, setSelectedType] = useState<any>(null);
    const [mode, setMode] = useState<'SINGLE' | 'BULK'>('SINGLE');
    const [inputs, setInputs] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleVerify = async () => {
        setLoading(true);
        setResult(null);

        try {
            const typeMapping: Record<string, string> = {
                'pan': 'PAN',
                'dl': 'DRIVING_LICENSE',
                'court': 'CRIME_CHECK',
                'gst': 'GST',
                'aadhaar': 'DIGILOCKER',
                'passport': 'PASSPORT'
            };
            const backendType = typeMapping[selectedType.id] || selectedType.id;

            const verifyFn = httpsCallable(functions, 'verifyDocument');
            const response: any = await verifyFn({
                type: backendType,
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

    const handleBatchSubmit = async (requests: any[]) => {
        setLoading(true);
        try {
            const batchFn = httpsCallable(functions, 'processBatch');
            const response: any = await batchFn({
                requests: requests
            });
            toast.success(`Batch execution ${response.data.batchId} initiated. Scanning ${requests.length} entities.`);
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
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black text-[#4285F4] uppercase tracking-[0.2em]">Verified Sovereign Gateway</p>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Unified Identity Terminal</h1>
                <p className="text-slate-500 font-medium tracking-tight">One Endpoint. Twenty-Five Jurisdictions. Zero Friction.</p>
            </div>

            <div className="space-y-8">
                {/* Mode Selector */}
                <div className="flex p-1 bg-slate-100/50 border border-slate-200 rounded-2xl gap-1 w-fit">
                    <button
                        onClick={() => { setMode('SINGLE'); setResult(null); }}
                        className={cn(
                            "py-2 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            mode === 'SINGLE' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        <Command className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> Single Check
                    </button>
                    <button
                        onClick={() => { setMode('BULK'); setResult(null); }}
                        className={cn(
                            "py-2 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            mode === 'BULK' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        <Layers className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> Bulk (CSV)
                    </button>
                </div>

                {mode === 'BULK' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4"><WalletWidget /></div>
                        <div className="lg:col-span-8"><BulkUploader onBatchSubmit={handleBatchSubmit} /></div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Step 1: Selection Grid */}
                        {!selectedType && (
                            <div className="animate-fade-in">
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Select Document Category</h3>
                                <VerificationGrid onSelect={(id) => {
                                    const type = VERIFICATION_TYPES.find(t => t.id === id);
                                    if (type) setSelectedType(type);
                                    setInputs({});
                                    setResult(null);
                                }} />
                            </div>
                        )}

                        {/* Step 2: Input Form */}
                        {selectedType && (mode === 'SINGLE') && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                                <div className="lg:col-span-4 space-y-8">
                                    <WalletWidget />

                                    {/* Quick Switcher (Side) */}
                                    <GlassCard className="p-4 border-slate-200 bg-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Type</span>
                                            <button
                                                onClick={() => { (setSelectedType as any)(null); setResult(null); }}
                                                className="text-[10px] font-black text-[#4285F4] uppercase hover:underline"
                                            >
                                                Change
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                                            <div className="text-[#4285F4]">{selectedType.icon}</div>
                                            <span className="font-bold text-sm tracking-tight">{selectedType.name}</span>
                                        </div>
                                    </GlassCard>
                                </div>

                                <div className="lg:col-span-8 space-y-6">
                                    <GlassCard className="p-8 border-slate-100 bg-white shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-8">
                                            {selectedType.name} Inputs
                                        </h3>

                                        <div className="space-y-6">
                                            {selectedType.fields.includes('idNumber') && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Document Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder={`Enter ${selectedType.name} Number`}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                                                        value={inputs.idNumber || ''}
                                                        onChange={(e) => setInputs({ ...inputs, idNumber: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {selectedType.fields.includes('gstNumber') && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">GST Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter GSTIN Number"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                                                        value={inputs.gstNumber || ''}
                                                        onChange={(e) => setInputs({ ...inputs, gstNumber: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {selectedType.fields.includes('dob') && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date of Birth (DD-MM-YYYY)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="15-08-1947"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                                                        value={inputs.dob || ''}
                                                        onChange={(e) => setInputs({ ...inputs, dob: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {/* ... (reusing the rest of the inputs with the same white text / dark bg patterns) */}
                                            {selectedType.fields.includes('name') && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Legal Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                                        value={inputs.name || ''}
                                                        onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {selectedType.fields.includes('fatherName') && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Father's Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                                        value={inputs.fatherName || ''}
                                                        onChange={(e) => setInputs({ ...inputs, fatherName: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {selectedType.fields.includes('address') && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Address</label>
                                                    <textarea
                                                        rows={2}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                                        value={inputs.address || ''}
                                                        onChange={(e) => setInputs({ ...inputs, address: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {selectedType.fields.includes('accessToken') && (
                                                <div className="space-y-1.5 text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                                    <TactileButton variant="primary" className="mx-auto bg-[#4285F4]" onClick={() => toast.success("OAuth Connector Active")}>
                                                        Open DigiLocker OAuth
                                                    </TactileButton>
                                                </div>
                                            )}

                                            {selectedType.fields.includes('imageBase64') && (
                                                <div className="space-y-1.5 text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                                    <Scan className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                    <TactileButton variant="secondary" className="mx-auto bg-slate-900 text-white">
                                                        Upload ID Screenshot
                                                    </TactileButton>
                                                </div>
                                            )}

                                            {!selectedType.fields.includes('accessToken') && !selectedType.fields.includes('imageBase64') && (
                                                <TactileButton
                                                    variant="primary"
                                                    className="w-full h-14 mt-6 bg-[#4285F4] hover:bg-blue-600 shadow-xl shadow-blue-500/20"
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
                                                    "p-6 border-l-8 transition-all bg-white shadow-xl shadow-slate-200/50 mt-6",
                                                    result.isValid ? "border-[#34A853]" : "border-[#EA4335]"
                                                )}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Normalized Result</p>
                                                            <h4 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                                                                {result.legalName || 'Unknown Identity'}
                                                            </h4>
                                                            {result.rawResponse?.jobId && (
                                                                <p className="text-[10px] font-black text-[#4285F4] mt-2 uppercase tracking-widest font-mono">
                                                                    ASYNC JOB STARTED: {result.rawResponse.jobId}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className={cn(
                                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                            result.isValid ? "bg-[#34A853] text-white" : "bg-[#EA4335] text-white"
                                                        )}>
                                                            {result.isValid ? 'VERIFIED' : 'FAILED'}
                                                        </div>
                                                    </div>

                                                    {result.error && (
                                                        <div className="mt-4 p-3 bg-[#EA4335]/10 rounded-xl border border-[#EA4335]/20 flex items-center gap-3">
                                                            <AlertCircle className="w-4 h-4 text-[#EA4335]" />
                                                            <p className="text-xs font-bold text-[#EA4335]/80">{result.error}</p>
                                                        </div>
                                                    )}

                                                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                                                        <details className="cursor-pointer group outline-none flex-1">
                                                            <summary className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#4285F4] transition-colors list-none">
                                                                View Forensic Audit Trail (Raw Response)
                                                            </summary>
                                                            <pre className="mt-4 p-4 bg-slate-900 text-google-green text-[10px] font-mono rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                                                                {JSON.stringify(result.rawResponse || result, null, 2)}
                                                            </pre>
                                                        </details>

                                                        {result.verificationId && (
                                                            <TactileButton
                                                                variant="primary"
                                                                size="sm"
                                                                className="bg-[#4285F4] hover:bg-blue-600 shadow-lg shadow-blue-500/20"
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
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
