import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemStatus {
    protean_status: 'ONLINE' | 'DEGRADED' | 'DOWN';
    message: string;
}

export const StatusBanner: React.FC = () => {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const statusRef = doc(db, 'system_settings', 'status');
        const unsubscribe = onSnapshot(statusRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as SystemStatus;
                setStatus(data);
                setIsVisible(true);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!status || !isVisible || status.protean_status === 'ONLINE') return null;

    const isDown = status.protean_status === 'DOWN';
    const isDegraded = status.protean_status === 'DEGRADED';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`w-full overflow-hidden backdrop-blur-md border-b border-white/5 transition-colors duration-500 ${isDown ? 'bg-[#EA4335]/90' : 'bg-[#FBBC05]/90'}`}
            >
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4 text-white">
                    <div className="flex items-center gap-3">
                        {isDown ? (
                            <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        ) : (
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        )}
                        <p className="text-[11px] font-black uppercase tracking-[0.1em]">
                            {status.message || (isDown ? "🔴 Service Unavailable" : "⚠️ Govt API Slow")}
                        </p>
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-90"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
