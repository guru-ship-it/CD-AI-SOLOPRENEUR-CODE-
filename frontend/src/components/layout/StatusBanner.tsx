import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemStatus {
    protean_status: 'ONLINE' | 'DEGRADED' | 'DOWN';
    digilocker_status: 'ONLINE' | 'DEGRADED' | 'DOWN';
    global_alert: string;
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
                // Reset visibility if status changes significantly
                setIsVisible(true);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!status || !isVisible) return null;

    const isProteanIssue = status.protean_status !== 'ONLINE';
    const isDigilockerIssue = status.digilocker_status !== 'ONLINE';

    // Priority 1: DOWN (Red)
    const isDown = status.protean_status === 'DOWN' || status.digilocker_status === 'DOWN';

    // Priority 2: DEGRADED (Amber)
    const isDegraded = status.protean_status === 'DEGRADED' || status.digilocker_status === 'DEGRADED';

    if (!isDown && !isDegraded) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`w-full overflow-hidden ${isDown ? 'bg-red-600' : 'bg-amber-500'}`}
            >
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 text-white">
                    <div className="flex items-center gap-3">
                        {isDown ? (
                            <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <p className="text-sm font-black uppercase tracking-tight">
                            {status.global_alert || (isDown
                                ? "Critical: Some Government APIs are currently unavailable."
                                : "Notice: Government APIs are experiencing high latency.")}
                        </p>
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="hover:bg-white/20 p-1 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
