import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { GlassCard } from '../ui/GlassCard';
import { CreditCard, History, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

interface Transaction {
    id: number;
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    description: string;
    timestamp: string;
}

interface Wallet {
    balance: number;
    lowBalanceThreshold: number;
    transactions: Transaction[];
}

export const WalletWidget: React.FC = () => {
    const { } = useAuth();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchWallet = async () => {
        try {
            setLoading(true);
            // In a real staging environment, we'd have a getWallet function.
            // For this simulation, we'll use a local state but allow the top-up to trigger a refresh.
            const initialBalance = 4520;
            setWallet({
                balance: initialBalance,
                lowBalanceThreshold: 1000,
                transactions: [
                    { id: 1, amount: 99, type: 'DEBIT', description: 'PAN Verification - ABC1234', timestamp: '2 mins ago' },
                    { id: 2, amount: 5000, type: 'CREDIT', description: 'Razorpay Top-up', timestamp: '1 hour ago' },
                ]
            });
        } catch (error) {
            console.error('Error fetching wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTopUp = async () => {
        try {
            const topUpFn = httpsCallable(functions, 'topUpWallet');
            const amount = 5000;
            const response = await topUpFn({ amount }) as { data: { success: boolean; newBalance: number } };

            if (response.data.success) {
                setWallet((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        balance: response.data.newBalance,
                        transactions: [
                            {
                                id: Date.now(),
                                amount,
                                type: 'CREDIT',
                                description: 'Quick Top-up (Simulation)',
                                timestamp: 'Just now'
                            },
                            ...prev.transactions
                        ]
                    };
                });
            }
        } catch (error) {
            console.error('Top-up failed:', error);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    if (loading || !wallet) return <div className="animate-pulse h-48 bg-slate-100 rounded-3xl" />;

    const isLowBalance = wallet.balance <= wallet.lowBalanceThreshold;

    return (
        <GlassCard className={cn(
            "p-6 transition-all",
            isLowBalance ? "border-amber-500/50 bg-amber-50/10 shadow-amber-900/5" : "border-white/60 bg-white/40"
        )}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Prepaid Wallet</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                        ₹ {wallet.balance.toLocaleString('en-IN')}
                    </h3>
                </div>
                <div className={cn(
                    "p-3 rounded-2xl",
                    isLowBalance ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                )}>
                    <CreditCard className="w-6 h-6" />
                </div>
            </div>

            {isLowBalance && (
                <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 animate-pulse">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">
                        Critical: Low Balance. Verification may stall.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History className="w-3 h-3" /> Recent Activity
                    </span>
                    <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">
                        View Statement
                    </button>
                </div>

                <div className="space-y-3">
                    {wallet.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-1.5 rounded-lg",
                                    tx.type === 'DEBIT' ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-600"
                                )}>
                                    {tx.type === 'DEBIT' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-900 leading-none">{tx.description}</p>
                                    <p className="text-[9px] font-medium text-slate-400 mt-1">{tx.timestamp}</p>
                                </div>
                            </div>
                            <span className={cn(
                                "text-[11px] font-black tabular-nums",
                                tx.type === 'DEBIT' ? "text-slate-600" : "text-emerald-700"
                            )}>
                                {tx.type === 'DEBIT' ? '-' : '+'} ₹{tx.amount}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={handleTopUp}
                className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:-translate-y-0.5 transition-all"
            >
                Quick Top-up
            </button>
        </GlassCard>
    );
};
