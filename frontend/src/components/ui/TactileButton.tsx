import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface TactileButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

export const TactileButton = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    ...props
}: TactileButtonProps) => {
    const variants = {
        primary: "bg-[#4285F4] text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30",
        secondary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/10",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/10",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
        outline: "bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className={cn(
                "font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-tight",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};
