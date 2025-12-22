import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageCircle } from 'lucide-react';

export const NitiMascot: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [showBubble, setShowBubble] = useState(false);

    return (
        <div
            className="fixed bottom-8 right-8 z-[100]"
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
                        className="absolute bottom-full right-0 mb-4 bg-white/90 backdrop-blur-xl border border-white/40 p-4 rounded-[2rem] shadow-2xl min-w-[200px]"
                    >
                        <p className="text-slate-900 font-bold tracking-tight text-sm">
                            Namaste! I am Niti. 🤖
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                            Need help with Bharat-specific compliance?
                        </p>
                        <div className="absolute top-full right-8 border-8 border-transparent border-t-white/90" />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                animate={isHovered ? {
                    scale: 1.1,
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 }
                } : {
                    y: [0, -10, 0],
                    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                }}
                className="w-16 h-16 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-600/30 cursor-pointer border border-white/20 relative"
            >
                <Bot className="w-8 h-8 text-white" />

                {/* Animated Green Visor Layer */}
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-emerald-400 blur-[2px] rounded-full mt-1"
                />

                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 text-white" />
                </div>
            </motion.div>
        </div>
    );
};
