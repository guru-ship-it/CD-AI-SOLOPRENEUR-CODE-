import { cn } from '../../utils/cn';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    className?: string;
    dot?: boolean;
}

export const Badge = ({ children, variant = 'neutral', className, dot = false }: BadgeProps) => {
    const variants = {
        success: "bg-emerald-50 text-emerald-700 border-emerald-100",
        warning: "bg-amber-50 text-amber-700 border-amber-100",
        danger: "bg-red-50 text-red-700 border-red-100",
        info: "bg-blue-50 text-blue-700 border-blue-100",
        neutral: "bg-slate-50 text-slate-700 border-slate-100"
    };

    const dotColors = {
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        danger: "bg-red-500",
        info: "bg-blue-500",
        neutral: "bg-slate-500"
    };

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
            variants[variant],
            className
        )}>
            {dot && <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotColors[variant])} />}
            {children}
        </span>
    );
};
