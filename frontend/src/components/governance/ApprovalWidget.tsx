import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { TactileButton } from '../ui/TactileButton';
import { Badge } from '../ui/Badge';

interface ApprovalWidgetProps {
    approvals: any[];
    onProcess: (id: number, status: string) => void;
}

export const ApprovalWidget = ({ approvals, onProcess }: ApprovalWidgetProps) => {
    return (
        <GlassCard className="border-l-4 border-amber-400 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Pending Authorizations</h2>
                </div>
                <Badge variant="warning">Four-Eyes Protocol</Badge>
            </div>

            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {approvals.length > 0 ? (
                        approvals.map((a, idx) => (
                            <motion.div
                                key={a.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2, delay: idx * 0.05 }}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/40 border border-white/60 rounded-xl gap-4"
                            >
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{a.action_type}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Requested by: {a.requester_id}</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <TactileButton
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 sm:flex-none"
                                        onClick={() => onProcess(a.id, 'REJECTED')}
                                    >
                                        Reject
                                    </TactileButton>
                                    <TactileButton
                                        variant="primary"
                                        size="sm"
                                        className="flex-1 sm:flex-none"
                                        onClick={() => onProcess(a.id, 'APPROVED')}
                                    >
                                        Authorize
                                    </TactileButton>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-10 text-slate-400 italic text-sm"
                        >
                            No critical actions awaiting approval.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GlassCard>
    );
};
