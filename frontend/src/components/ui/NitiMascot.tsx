
import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface NitiMascotProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const NitiMascot: React.FC<NitiMascotProps> = ({ className, size = 'md' }) => {
    const sizeMap = {
        sm: 'w-12 h-12',
        md: 'w-24 h-24',
        lg: 'w-32 h-32'
    };

    return (
        <div className={`relative ${sizeMap[size]} ${className} group cursor-pointer`}>
            {/* Floating Animation Wrapper */}
            <motion.div
                animate={{
                    y: [0, -10, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative z-10"
            >
                {/* The Head / Body */}
                <div className="w-full h-full bg-slate-900 rounded-[2rem] border-2 border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center">

                    {/* Internal Glow */}
                    <div className="absolute inset-0 bg-emerald-500/5 pulse-subtle" />

                    {/* Glass Visor */}
                    <div className="absolute top-1/4 left-1/4 right-1/4 h-1/3 bg-slate-100/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
                        <motion.div
                            animate={{
                                x: ['-100%', '200%']
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-1/2 h-full bg-emerald-400/20 blur-sm"
                        />

                        {/* Visor Eyes/Scan Line */}
                        <div className="absolute inset-0 flex items-center justify-around px-2">
                            <div className="w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
                            <div className="w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
                        </div>
                    </div>

                    <Bot className="w-1/2 h-1/2 text-slate-400 opacity-20" />
                </div>

                {/* Floating Shadow */}
                <motion.div
                    animate={{
                        scale: [1, 0.8, 1],
                        opacity: [0.2, 0.1, 0.2]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -bottom-4 left-1/4 right-1/4 h-2 bg-slate-900 rounded-full blur-md"
                />
            </motion.div>

            {/* Hover Tooltip */}
            <div className="absolute -top-12 left-1/2 -translateX-1/2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Hi, I'm Niti</p>
                <div className="absolute -bottom-1 left-1/2 -translateX-1/2 w-2 h-2 bg-white border-b border-r border-slate-100 rotate-45" />
            </div>
        </div>
    );
};
