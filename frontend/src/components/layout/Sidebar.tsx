
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Activity,
    CreditCard,
    ShieldCheck,
    CheckCircle2,
    Settings,
    FileText
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Custom Request Icons
const IconTenant = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21H21" strokeLinecap="round" />
        <path d="M5 21V7L13 3V21" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 10V21" />
        <path d="M17 14V21" strokeLinecap="round" />
    </svg>
);

const IconAddUser = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="7" r="4" />
        <path d="M6 21V19C6 15.6863 8.68629 13 12 13C15.3137 13 18 15.6863 18 19V21" />
        <path d="M19 10L22 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20.5 8.5V11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

interface NavItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
    // Master Admin Items
    {
        title: 'Global Analytics',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: ['MASTER_ADMIN']
    },
    {
        title: 'Visual Intelligence',
        href: '/dashboard/analytics',
        icon: <Activity className="w-5 h-5" />,
        roles: ['MASTER_ADMIN']
    },
    {
        title: 'Create Company Admin',
        href: '/dashboard/tenants',
        icon: <IconTenant />,
        roles: ['MASTER_ADMIN']
    },
    {
        title: 'Global Audit',
        href: '/dashboard/audit',
        icon: <FileText className="w-5 h-5" />,
        roles: ['MASTER_ADMIN']
    },
    {
        title: 'System Health',
        href: '/dashboard/health',
        icon: <Activity className="w-5 h-5" />,
        roles: ['MASTER_ADMIN']
    },

    // Company Admin Items
    {
        title: 'Company Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: ['COMPANY_ADMIN']
    },
    {
        title: 'User Management',
        href: '/dashboard/users',
        icon: <IconAddUser />,
        roles: ['COMPANY_ADMIN']
    },
    {
        title: 'Billing & Usage',
        href: '/dashboard/billing',
        icon: <CreditCard className="w-5 h-5" />,
        roles: ['COMPANY_ADMIN']
    },
    {
        title: 'Identity Verification',
        href: '/dashboard/verify',
        icon: <ShieldCheck className="w-5 h-5" />,
        roles: ['MASTER_ADMIN', 'COMPANY_ADMIN']
    }
];

export const Sidebar = () => {
    const { user } = useAuth();

    const filteredItems = NAV_ITEMS.filter(item =>
        item.roles.includes(user?.role || 'USER')
    );

    return (
        <aside className={cn(
            "w-64 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 flex-shrink-0 relative overflow-hidden transition-all duration-500"
        )}>
            <div className="h-full flex flex-col">

                {/* Header/Logo */}
                <div className="h-20 flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
                            <div className="absolute top-0 w-full h-1 bg-[#4285F4]"></div>
                            <div className="absolute bottom-0 w-full h-1 bg-[#34A853]"></div>
                            <ShieldCheck className="text-slate-700 w-5 h-5 relative z-10" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-slate-800">
                            Compliance<span className="text-[#4285F4]">Desk</span>
                        </span>
                    </div>
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
                    <div>
                        <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                            {user?.role === 'MASTER_ADMIN' ? 'Governance' : 'Management'}
                        </h3>
                        <div className="space-y-1">
                            {filteredItems.map((item) => (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    end={item.href === '/dashboard'}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group",
                                        isActive
                                            ? "bg-blue-50 text-[#4285F4] shadow-sm"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <span className={cn(
                                        "transition-transform duration-300 group-hover:scale-110",
                                        "text-current"
                                    )}>
                                        {item.icon}
                                    </span>
                                    <span className="tracking-tight">{item.title}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-slate-100 mt-auto">
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-[#4285F4] text-white flex items-center justify-center font-bold">
                                        {user?.name.charAt(0)}
                                    </div>
                                )}
                                {user?.role === 'MASTER_ADMIN' && (
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate tracking-tight">
                                    {user?.name}
                                </p>
                                <p className="text-[10px] font-medium text-slate-500 truncate font-mono">
                                    {user?.email && user.email.length > 20 ? `${user.email.substring(0, 18)}...` : user?.email}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                            <div className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                user?.role === 'MASTER_ADMIN'
                                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            )}>
                                {user?.role === 'MASTER_ADMIN' ? 'Master Admin' : 'Company Admin'}
                            </div>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                                <Settings className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
