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
            className={cn(
                "w-full overflow-hidden border-b transition-colors duration-500",
                isDown ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            )}
            <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {isDown ? (
                        <div className="bg-red-100 p-1.5 rounded-lg text-red-600">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                    ) : (
                        <div className="bg-yellow-100 p-1.5 rounded-lg text-yellow-600">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    )}
                    <p className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        isDown ? "text-red-900" : "text-yellow-900"
                    )}>
                        {status.message || (isDown ? "🔴 Service Unavailable" : "⚠️ Govt API Slow")}
                    </p>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className={cn(
                        "p-2 rounded-xl transition-all active:scale-90",
                        isDown ? "hover:bg-red-100 text-red-400" : "hover:bg-yellow-100 text-yellow-400"
                    )}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
        </AnimatePresence >
    );
};
