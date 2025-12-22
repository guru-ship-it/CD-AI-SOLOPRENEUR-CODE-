import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    hover?: boolean;
}

export const GlassCard = ({ children, className, delay = 0, hover = true }: GlassCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
        whileHover={hover ? { y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" } : {}}
        className={cn(
            "glass-panel rounded-2xl p-6 transition-all duration-300",
            className
        )}
    >
        {children}
    </motion.div>
);
