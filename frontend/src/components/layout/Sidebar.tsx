
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../Logo';
import { LayoutDashboard, FileText, CreditCard, Activity, Server, CheckCircle2, ShieldCheck } from 'lucide-react';

// Custom Icons
const IconTenant = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21H21" strokeLinecap="round" />
        <path d="M5 21V7L13 3V21" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 10V21" />
        <path d="M17 14V21" strokeLinecap="round" />
    </svg>
);

const IconAddUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="7" r="4" />
        <path d="M6 21V19C6 15.6863 8.68629 13 12 13C15.3137 13 18 15.6863 18 19V21" />
        <path d="M19 10L22 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        <path d="M20.5 8.5V11.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const Sidebar = () => {
    const { user, isMFAVerified } = useAuth();

    return (
        <aside className={`fixed h-screen w-64 z-50 transition-all duration-300 ${!isMFAVerified ? 'blur-sm pointer-events-none' : ''}`}>
            <div className="h-full flex flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-lg shadow-emerald-900/5">
                <div className="p-6 border-b border-gray-100/50">
                    <Logo className="h-8" />
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                    {user?.role === 'MASTER_ADMIN' ? (
                        <>
                            {/* Master Admin View */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                    Platform Governance
                                </h3>
                                <ul className="space-y-1">
                                    <li>
                                        <NavLink to="/dashboard" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-white/60 hover:text-emerald-600'}`}>
                                            <LayoutDashboard className="w-4 h-4" />
                                            Global Dashboard
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/dashboard/tenants" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-white/60 hover:text-emerald-600'}`}>
                                            <IconTenant />
                                            Tenant Manager
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/dashboard/audit" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-white/60 hover:text-emerald-600'}`}>
                                            <FileText className="w-4 h-4" />
                                            Global Audit
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/dashboard/health" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-white/60 hover:text-emerald-600'}`}>
                                            <Activity className="w-4 h-4" />
                                            System Health
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Company Admin View */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                    Company Management
                                </h3>
                                <ul className="space-y-1">
                                    <li>
                                        <NavLink to="/dashboard" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-white/60 hover:text-emerald-600'}`}>
                                            <LayoutDashboard className="w-4 h-4" />
                                            Company Dashboard
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/dashboard/users" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-white/60 hover:text-emerald-600'}`}>
                                            <IconAddUser />
                                            User Management
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/dashboard/billing" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-white/60 hover:text-emerald-600'}`}>
                                            <CreditCard className="w-4 h-4" />
                                            Billing & Plan
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-100/50">
                    <div className="group relative rounded-xl bg-gradient-to-br from-white to-slate-50 border border-gray-100 p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                                    {user?.name.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 text-sm truncate">{user?.name}</h4>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                                {user?.role === 'MASTER_ADMIN' ? 'Master Admin' : 'Admin'}
                            </span>
                            <Server className="w-3 h-3 text-emerald-500" />
                        </div>

                        {user?.phone && (
                            <div className="mt-2 text-[10px] text-gray-400 font-mono text-center">
                                {user.phone}
                            </div>
                        )}

                        {/* MFA Stub for Master Admin */}
                        {user?.role === 'MASTER_ADMIN' && (
                            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] font-medium text-emerald-600 bg-emerald-50/50 rounded py-1">
                                <ShieldCheck className="w-3 h-3" />
                                Google Auth: <span className="font-bold">Active</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};
