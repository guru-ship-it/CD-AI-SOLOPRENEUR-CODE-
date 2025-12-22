import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n';
import { Languages, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BhashaSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const currentLanguage = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs font-bold transition-all"
            >
                <Languages className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{currentLanguage.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-48 z-50 bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-xl overflow-hidden py-1"
                        >
                            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Language</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            i18n.changeLanguage(lang.code);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors flex items-center justify-between ${i18n.language === lang.code
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        {lang.label}
                                        {i18n.language === lang.code && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
