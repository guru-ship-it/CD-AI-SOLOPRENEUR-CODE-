import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TactileButton } from './TactileButton';

interface MFAModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    actionLabel: string;
}

export const MFAModal: React.FC<MFAModalProps> = ({ isOpen, onClose, onSuccess, actionLabel }) => {
    const { verifyMFA } = useAuth();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);

        const isValid = await verifyMFA(code);

        if (isValid) {
            onSuccess();
            onClose();
        } else {
            setError(true);
        }
        setIsLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-slate-900 uppercase tracking-tight text-sm">Elevated Security</h3>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-8 text-center bg-white">
                            <h4 className="text-xl font-bold text-slate-900 mb-2">Authorize Action</h4>
                            <p className="text-sm text-slate-500 mb-8">
                                To perform <span className="font-bold text-slate-700 capitalize">"{actionLabel}"</span>, please enter the code from your Google Authenticator app.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className={`w-full text-center text-4xl font-mono tracking-[0.5em] py-4 bg-slate-50 border-2 rounded-xl outline-none transition-all ${error ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                                            }`}
                                        autoFocus
                                    />
                                    {error && <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-2">Invalid Verification Code</p>}
                                </div>

                                <TactileButton
                                    type="submit"
                                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                                    disabled={code.length !== 6 || isLoading}
                                >
                                    {isLoading ? 'Verifying...' : 'Authorize Action'}
                                </TactileButton>
                            </form>

                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8">
                                Compliance Token: {Math.random().toString(36).substring(7).toUpperCase()}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
