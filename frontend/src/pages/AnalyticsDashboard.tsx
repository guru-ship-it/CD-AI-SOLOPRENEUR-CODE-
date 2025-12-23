import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { ShieldAlert, Clock, Activity, MapPin, Globe } from 'lucide-react';

const data = [
    { name: '08:00', verifications: 400, fraud: 24, tat: 1.2 },
    { name: '10:00', verifications: 1200, fraud: 86, tat: 1.5 },
    { name: '12:00', verifications: 900, fraud: 45, tat: 1.1 },
    { name: '14:00', verifications: 1500, fraud: 120, tat: 2.1 },
    { name: '16:00', verifications: 1100, fraud: 70, tat: 1.8 },
    { name: '18:00', verifications: 600, fraud: 30, tat: 1.3 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export const AnalyticsDashboard: React.FC = () => {
    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Visual Intelligence Engine</h1>
                <p className="text-slate-500 font-medium tracking-tight">Real-time Risk Mapping & Performance Telemetry</p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[180px]">

                {/* 1. Main Verifications Chart (2x2) */}
                <GlassCard className="md:col-span-2 lg:col-span-3 row-span-2 p-8 border-white/60 bg-white/40 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Verification Flow (24h)</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sovereign Throughput Monitoring</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Peak</p>
                                <p className="text-lg font-black text-slate-900 leading-none">1,500/hr</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 -mx-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorVer" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                                />
                                <Area type="monotone" dataKey="verifications" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVer)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* 2. Fraud Alert Widget (1x1) */}
                <GlassCard className="col-span-1 row-span-1 p-6 border-amber-500/30 bg-amber-50/20 flex flex-col justify-between">
                    <div className="flex justify-between items-start text-amber-600">
                        <ShieldAlert className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 px-2 py-1 rounded-lg italic">High Risk</span>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">12.4%</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Fraud Rate</p>
                    </div>
                </GlassCard>

                {/* 3. TAT Monitor (1x1) */}
                <GlassCard className="col-span-1 row-span-1 p-6 border-blue-500/30 bg-blue-50/20 flex flex-col justify-between">
                    <div className="flex justify-between items-start text-blue-600">
                        <Clock className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 px-2 py-1 rounded-lg">Real-time</span>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">1.8s</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Average TAT (SLA)</p>
                    </div>
                </GlassCard>

                {/* 4. Fraud Map (District Heatmap Simulation) (1x2) */}
                <GlassCard className="col-span-1 row-span-2 p-6 border-white/60 bg-white/40 flex flex-col">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500" /> Regional Hotspots
                    </h3>
                    <div className="flex-1 space-y-4 overflow-y-auto">
                        {[
                            { name: 'Gurugram', rate: '24%', count: 120 },
                            { name: 'Mumbai', rate: '18%', count: 85 },
                            { name: 'Bengaluru', rate: '12%', count: 60 },
                            { name: 'Delhi NCR', rate: '42%', count: 320 },
                        ].map((district, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black text-slate-900 uppercase tracking-tight">
                                    <span>{district.name}</span>
                                    <span className="text-rose-600">{district.rate}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                                        style={{ width: district.rate }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-4 w-full py-2 bg-[#4285F4] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">
                        Expand Map
                    </button>
                </GlassCard>

                {/* 5. Live Verification Feed (2x1) */}
                <GlassCard className="md:col-span-2 lg:col-span-2 row-span-1 p-6 border-white/60 bg-white/40 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" /> Live Sovereign Stream
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <div className="space-y-2">
                            {[
                                { user: 'Arjun K.', type: 'PAN', status: 'VERIFIED', time: 'Just now' },
                                { user: 'Priya S.', type: 'DL', status: 'VERIFIED', time: '2s ago' },
                                { user: 'Fraudster', type: 'VISION', status: 'REJECTED', time: '5s ago' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-900 uppercase">
                                            {item.type[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 leading-none">{item.user}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.type} Check</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${item.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                            {item.status}
                                        </span>
                                        <p className="text-[8px] font-bold text-slate-400 mt-0.5">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
                    </div>
                </GlassCard>

                {/* 6. Identity Type Distribution (1x1) */}
                <GlassCard className="col-span-1 row-span-1 p-6 border-white/60 bg-white/40 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">ID Reach</h3>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'PAN', val: 90 },
                                { name: 'DL', val: 65 },
                                { name: 'VTR', val: 40 },
                                { name: 'OTH', val: 20 },
                            ]}>
                                <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                    {COLORS.map((color, index) => (
                                        <Cell key={`cell-${index}`} fill={color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

            </div>
        </div>
    );
};
