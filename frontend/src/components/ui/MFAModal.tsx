import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';
import { TactileButton } from './TactileButton';

interface MFAModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (code: string) => void;
    actionLabel: string;
}

export const MFAModal: React.FC<MFAModalProps> = ({ isOpen, onClose, onSuccess, actionLabel }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = () => {
        // FAT 1.4: Validation logic
        if (code === '123456') { // Mock correct code
            onSuccess(code);
            setCode('');
            setError(false);
        } else {
            setError(true);
            // In production, log "Failed Auth" event here
            console.error('Failed Auth: Incorrect MFA code entered.');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[2.5rem] p-8 overflow-hidden"
            >
                {/* Glassmorphism Accents */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 border border-blue-100">
                        <ShieldAlert className="w-8 h-8 text-blue-600" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                        Authentication Required
                    </h2>
                    <p className="text-slate-500 text-sm mb-8">
                        To perform <span className="font-bold text-slate-900">"{actionLabel}"</span>, please enter the 6-digit code from your Google Authenticator app.
                    </p>

                    <div className="w-full space-y-4">
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="0 0 0 0 0 0"
                            className={`w-full bg-slate-50/50 border ${error ? 'border-red-500 bg-red-50/10' : 'border-slate-200'} rounded-2xl p-5 text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all`}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        />

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-xs font-bold"
                            >
                                Incorrect MFA code. This attempt has been logged.
                            </motion.p>
                        )}

                        <TactileButton
                            variant="primary"
                            className="w-full h-14"
                            onClick={handleSubmit}
                        >
                            Verify & Proceed
                        </TactileButton>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
