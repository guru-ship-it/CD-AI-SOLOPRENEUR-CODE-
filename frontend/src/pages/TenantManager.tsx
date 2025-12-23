import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Building2, MoreHorizontal, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ValidatedInput } from '../components/ui/ValidatedInput';
import { validateEmail, logAuditAction } from '../utils/securityUtils';

const MOCK_TENANTS = [
    { id: 1, name: 'Larsen & Toubro', admin: 'rajesh.k@larsentoubro.com', users: 142, status: 'Active', plan: 'Enterprise' },
    { id: 2, name: 'Tata Projects', admin: 'amit.s@tataprojects.com', users: 89, status: 'Active', plan: 'Enterprise' },
    { id: 3, name: 'G4S Security', admin: 'operations@g4s.in', users: 312, status: 'Active', plan: 'Custom' },
    { id: 4, name: 'DMRC', admin: 'hr@delhimetrorail.com', users: 56, status: 'Pending', plan: 'Enterprise' },
];

import { MFAModal } from '../components/ui/MFAModal';

export const TenantManager = () => {
    const { user, isMFAVerified } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMFAModal, setShowMFAModal] = useState(false);

    // Form State
    const [newCompany, setNewCompany] = useState({
        name: '',
        email: '',
        dpoName: '',
        dpoEmail: '',
        dpoPhone: '',
        region: 'asia-south1'
    });

    const handleCreateTenant = async () => {
        if (!newCompany.name || !validateEmail(newCompany.email)) return;

        // POPIA/NDPR Compliance Check
        if (!newCompany.dpoName || !newCompany.dpoEmail || !newCompany.dpoPhone) {
            toast.error("Compliance Error: Information Officer (DPO) details are mandatory for this region.");
            return;
        }

        try {
            await fetch('http://localhost:8000/tenants/dpo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCompany.name,
                    dpo_name: newCompany.dpoName,
                    dpo_email: newCompany.dpoEmail,
                    dpo_phone: newCompany.dpoPhone,
                    region: newCompany.region
                })
            });

            // CERT-In: Log the admin action
            logAuditAction('CREATE_TENANT', user?.email || 'unknown', {
                companyName: newCompany.name,
                adminEmail: newCompany.email,
                region: newCompany.region,
                compliance: 'POPIA_CHECKED'
            });

            toast.success('Company Onboarded with DPO & Data Residency Pinned.');
            setShowAddModal(false);
            setNewCompany({
                name: '', email: '',
                dpoName: '', dpoEmail: '', dpoPhone: '',
                region: 'asia-south1'
            });
        } catch (e) {
            toast.error("Failed to onboard tenant");
        }
    };

    const handleAddClick = () => {
        if (!isMFAVerified) {
            setShowMFAModal(true);
        } else {
            setShowAddModal(true);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <MFAModal
                isOpen={showMFAModal}
                onClose={() => setShowMFAModal(false)}
                onSuccess={() => setShowAddModal(true)}
                actionLabel="Onboard New Company"
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-high-contrast">Tenant Manager</h1>
                    <p className="text-gray-500 mt-1">Onboard and manage Enterprise Clients</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/10 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Add Company
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-2 rounded-xl border border-gray-200/50 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-slate-800 placeholder:text-gray-400 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-gray-500 font-medium uppercase text-xs border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Company Name</th>
                                <th className="px-6 py-4">Admin Email</th>
                                <th className="px-6 py-4 text-center">Users</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {MOCK_TENANTS.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{tenant.name}</div>
                                                <div className="text-xs text-gray-400">ID: CMP-00{tenant.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">{tenant.admin}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                            {tenant.users}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {tenant.status === 'Active' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                                <Clock className="w-3.5 h-3.5" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-600 font-semibold">{tenant.plan}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-gray-400 hover:text-slate-700">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {MOCK_TENANTS.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No companies found matching "{searchTerm}"
                    </div>
                )}
            </div>

            {/* Secure Add Company Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Onboard New Client</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-slate-700">
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <ValidatedInput
                                label="Company Name"
                                placeholder="e.g. Reliance Industries"
                                value={newCompany.name}
                                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                            />
                            <ValidatedInput
                                label="Admin Email"
                                placeholder="admin@company.com"
                                type="email"
                                value={newCompany.email}
                                onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                                validator={validateEmail}
                                errorMessage="Please enter a valid enterprise email."
                            />

                            <hr className="border-gray-100" />
                            <h4 className="font-semibold text-sm text-slate-800">Compliance & Data Residency</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <ValidatedInput
                                    label="DPO Name"
                                    placeholder="Legal Officer Name"
                                    value={newCompany.dpoName}
                                    onChange={(e) => setNewCompany({ ...newCompany, dpoName: e.target.value })}
                                />
                                <ValidatedInput
                                    label="DPO Phone"
                                    placeholder="+91..."
                                    value={newCompany.dpoPhone}
                                    onChange={(e) => setNewCompany({ ...newCompany, dpoPhone: e.target.value })}
                                />
                            </div>
                            <ValidatedInput
                                label="DPO Email"
                                placeholder="dpo@company.com"
                                type="email"
                                value={newCompany.dpoEmail}
                                onChange={(e) => setNewCompany({ ...newCompany, dpoEmail: e.target.value })}
                            />

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Data Residency (Pinning)</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={newCompany.region}
                                    onChange={(e) => setNewCompany({ ...newCompany, region: e.target.value })}
                                >
                                    <option value="asia-south1">India (asia-south1) - DPDP Compliant</option>
                                    <option value="africa-south1">South Africa (africa-south1) - POPIA Compliant</option>
                                    <option value="eu-west1">Europe (eu-west1) - GDPR Compliant</option>
                                </select>
                                <p className="text-xs text-slate-500">
                                    *Data will be physically pinned to this Google Cloud region.
                                </p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button onClick={handleCreateTenant} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/10">Create Tenant</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
