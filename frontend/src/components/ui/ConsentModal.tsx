import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, FileText } from 'lucide-react';
import { TactileButton } from './TactileButton';

interface ConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAgree: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose, onAgree }) => {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Legal Directive</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DPDP Act Section 5(2) Compliant</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                <FileText className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 mb-2">{t('consent.title')}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        {t('consent.template')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Storage Region</p>
                                    <p className="text-xs font-bold text-slate-700">asia-south1 (Mumbai)</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Retention Policy</p>
                                    <p className="text-xs font-bold text-slate-700">WORM Locked (90 Days)</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 transition-colors"
                            >
                                {t('consent.decline')}
                            </button>
                            <TactileButton
                                onClick={onAgree}
                                className="flex-1 px-6 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-emerald-900/10"
                            >
                                {t('consent.agree')}
                            </TactileButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
