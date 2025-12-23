import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebase';
import { GlassCard } from '../ui/GlassCard';
import { Skeleton } from '../ui/Skeleton';
import { CreditCard, History, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export const WalletCard: React.FC = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState<number>(0);
    const [threshold, setThreshold] = useState<number>(1000);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const tenantId = (user as any)?.token?.tenantId || "MASTER_TENANT";

    useEffect(() => {
        if (!tenantId) return;

        // 1. Real-time Balance Subscription
        const walletRef = doc(db, 'wallets', tenantId);
        const unsubscribeWallet = onSnapshot(walletRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setBalance(data.balance || 0);
                setThreshold(data.lowBalanceThreshold || 1000);
            }
            setLoading(false);
        });

        // 2. Real-time Transactions Subscription (Sub-collection)
        const txQuery = query(
            collection(db, 'wallets', tenantId, 'transactions'),
            orderBy('timestamp', 'desc'),
            limit(5)
        );
        const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
            const txs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate().toLocaleString() || 'Just now'
            }));
            setTransactions(txs);
        });

        return () => {
            unsubscribeWallet();
            unsubscribeTx();
        };
    }, [tenantId]);

    const handleTopUp = async () => {
        try {
            const topUpFn = httpsCallable(functions, 'topUpWallet');
            await topUpFn({ amount: 5000 });
        } catch (error) {
            console.error('Top-up failed:', error);
        }
    };

    if (loading) return <Skeleton className="h-64 rounded-3xl" />;

    const isLowBalance = balance <= threshold;

    return (
        <GlassCard className={cn(
            "p-6 transition-all border-slate-200 bg-white shadow-sm",
            isLowBalance && "bg-red-50 border-red-200"
        )}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Prepaid Wallet</p>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                        ₹ {balance.toLocaleString('en-IN')}
                    </h3>
                </div>
                <div className={cn(
                    "p-3 rounded-2xl",
                    isLowBalance ? "bg-red-100 text-[#EA4335]" : "bg-blue-50 text-[#4285F4]"
                )}>
                    <CreditCard className="w-6 h-6" />
                </div>
            </div>

            {isLowBalance && (
                <div className="mb-6 p-4 bg-[#EA4335] text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-red-200">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-xs font-bold uppercase tracking-tight">
                        Critical: Low Balance. Top up to avoid service interruption.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History className="w-3 h-3" /> Recent Audit Trail
                    </span>
                </div>

                <div className="space-y-2">
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-xl",
                                        tx.type === 'DEBIT' ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-[#4285F4]"
                                    )}>
                                        {tx.type === 'DEBIT' ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-900 leading-none">{tx.description}</p>
                                        <p className="text-[9px] font-medium text-slate-500 mt-1">{tx.timestamp}</p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-xs font-black tabular-nums",
                                    tx.type === 'DEBIT' ? "text-slate-400" : "text-[#4285F4]"
                                )}>
                                    {tx.type === 'DEBIT' ? '-' : '+'} ₹{tx.amount}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-[10px] font-bold text-slate-400 text-center py-4">No recent transactions</p>
                    )}
                </div>
            </div>

            <button
                onClick={handleTopUp}
                className="w-full mt-6 py-4 bg-[#4285F4] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                Add Credits via Razorpay
            </button>
        </GlassCard>
    );
};
