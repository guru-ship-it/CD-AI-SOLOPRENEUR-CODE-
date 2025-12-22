
import { Activity, ShieldCheck, Server, Building2 } from 'lucide-react';

const StatCard = ({ title, value, trend, icon: Icon, alert = false }: any) => (
    <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-sm border-b-4 border-emerald-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${alert ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <div className="flex items-center text-xs">
            <span className={`font-medium ${alert ? 'text-red-500' : 'text-emerald-600'}`}>{trend}</span>
            <span className="text-gray-400 ml-1">vs last month</span>
        </div>
    </div>
);

export const Dashboard = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Governance</h1>
                    <p className="text-gray-500 mt-1">Multi-Tenant Oversight & Security Status</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-sm font-medium">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    System Operational
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Verifications" value="1.2M" trend="+12.5%" icon={Activity} />
                <StatCard title="Active Tenants" value="24" trend="+2" icon={Building2} />
                {/* Note: Building2 needs import, simulating usage here or fixing later if missing */}
                <StatCard title="Security Incidents" value="0" trend="No threats" icon={ShieldCheck} />
                <StatCard title="API Latency" value="142ms" trend="-15ms" icon={Server} />
            </div>

            {/* Recent Activity Table (Paper Layer) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800">Recent Verification Logs</h3>
                    <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">View All</button>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Tenant</th>
                            <th className="px-6 py-3">Request Type</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Latency</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs">2025-12-22 13:4{i}:02</td>
                                <td className="px-6 py-4 font-medium text-slate-800">Larsen & Toubro</td>
                                <td className="px-6 py-4">Aadhaar OCR</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                        Verified
                                    </span>
                                </td>
                                <td className="px-6 py-4">42{i}ms</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


