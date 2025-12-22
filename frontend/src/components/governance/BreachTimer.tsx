import { HeartPulse } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

interface BreachTimerProps {
    active: boolean;
    region?: string;
}

export const BreachTimer = ({ active, region = "asia-south1" }: BreachTimerProps) => {
    return (
        <GlassCard className={cn("border-l-4 h-full", active ? "border-red-500 bg-red-50/10" : "border-emerald-500")}>
            <div className="flex items-center gap-3 mb-6">
                <HeartPulse className={cn("w-6 h-6", active ? "text-red-500 animate-pulse" : "text-emerald-500")} />
                <h2 className="text-lg font-bold text-slate-800">Security Pulse</h2>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Breach Protocol</span>
                    <Badge variant={active ? 'danger' : 'success'} dot>
                        {active ? "Incident Active" : "Secure"}
                    </Badge>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/5 border border-white/40 shadow-inner flex flex-col items-center">
                    <span className="text-3xl font-mono font-black text-slate-900 tracking-tighter tabular-nums">
                        {active ? "71:34:02" : "00:00:00"}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-[0.2em]">
                        Time to Report (GDPR/Kenya ODPC)
                    </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/40">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Data Residency</span>
                    <span className="text-[10px] font-black text-slate-700 uppercase">{active ? region : 'Idle'}</span>
                </div>
            </div>
        </GlassCard>
    );
};
