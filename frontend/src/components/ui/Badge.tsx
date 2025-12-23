import { cn } from '../../utils/cn';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    className?: string;
    dot?: boolean;
}

export const Badge = ({ children, variant = 'neutral', className, dot = false }: BadgeProps) => {
    const variants = {
        success: "bg-[#34A853]/10 text-[#34A853] border-[#34A853]/20",
        warning: "bg-[#FBBC05]/10 text-[#FBBC05] border-[#FBBC05]/20",
        danger: "bg-[#EA4335]/10 text-[#EA4335] border-[#EA4335]/20",
        info: "bg-[#4285F4]/10 text-[#4285F4] border-[#4285F4]/20",
        neutral: "bg-slate-100 text-slate-500 border-slate-200"
    };

    const dotColors = {
        success: "bg-[#34A853]",
        warning: "bg-[#FBBC05]",
        danger: "bg-[#EA4335]",
        info: "bg-[#4285F4]",
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
