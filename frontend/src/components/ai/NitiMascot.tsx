import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export const NitiMascot: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [showBubble, setShowBubble] = useState(false);

    return (
        <div
            className="fixed bottom-6 right-6 z-50"
            onMouseEnter={() => {
                setIsHovered(true);
                setShowBubble(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                setShowBubble(false);
            }}
        >
            <AnimatePresence>
                {showBubble && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-full right-0 mb-6 bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[220px]"
                    >
                        <p className="text-white font-bold tracking-tight text-sm">
                            Namaste! I am Niti. 🤖
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                            Need help with identity verification?
                        </p>
                        <div className="absolute top-full right-8 border-8 border-transparent border-t-slate-900" />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.a
                href="https://wa.me/918125991247?text=Hi%20ComplianceDesk,%20I%20need%20help."
                target="_blank"
                rel="noopener noreferrer"
                animate={isHovered ? {
                    scale: 1.1,
                    transition: { duration: 0.2 }
                } : {
                    y: [0, -10, 0],
                    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                }}
                className="relative block p-4 bg-[#25D366] hover:bg-[#1faf53] text-white rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-transform border-4 border-[#0F172A] cursor-pointer overflow-visible"
            >
                {/* Ping Animation Background */}
                {/* The ping animation is removed as per the new button class structure */}

                <MessageCircle className="w-8 h-8 relative z-10" />

                {/* Optional: Keep the Niti Active Status badge but make it fit the new border */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#4285F4] rounded-full border-2 border-[#0F172A] flex items-center justify-center z-20">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
            </motion.a>
        </div>
    );
};
