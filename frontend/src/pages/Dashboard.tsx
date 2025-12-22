
import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Server, Building2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const API_URL = "http://localhost:8000"; // Assuming local dev

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

const ReportIssueModal = ({ task, onClose }: any) => {
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await fetch(`${API_URL}/grievances`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: task.task_id, description })
            });
            alert("Grievance Submitted. Our Compliance Team will review this shortly.");
            onClose();
            window.location.reload(); // Simple reload to refresh data
        } catch (error) {
            alert("Failed to submit grievance");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
                <h3 className="text-lg font-bold mb-4 text-slate-800">Report Incorrect Data</h3>
                <p className="text-xs text-gray-500 mb-4">Right to Correction (DPDP Act 2023)</p>

                <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-100 text-sm">
                    <p><strong>Applicant:</strong> {task.applicant_name}</p>
                    <p><strong>Status:</strong> {task.status}</p>
                </div>

                <textarea
                    className="w-full border rounded p-2 text-sm mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Describe the error (e.g., Name misspelled, Photo clear but rejected)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                />

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Submit Formal Grievance"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [approvals, setApprovals] = useState<any[]>([]);
    const [highContrast, setHighContrast] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/verifications`)
            .then(res => res.json())
            .then(data => setVerifications(data))
            .catch(err => console.error("Failed to fetch data", err));

        fetch(`${API_URL}/approvals`)
            .then(res => res.json())
            .then(data => setApprovals(data))
            .catch(err => console.error("Failed to fetch approvals", err));
    }, []);

    const handleProcessApproval = async (id: number, status: string) => {
        try {
            await fetch(`${API_URL}/approvals/${id}?status=${status}&approver=SecurityOfficerB`, {
                method: 'PUT'
            });
            setApprovals(prev => prev.filter(a => a.id !== id));
            alert(`Action ${status}`);
        } catch (error) {
            alert("Approval processing failed");
        }
    };

    return (
        <div className={`max-w-6xl mx-auto space-y-8 ${highContrast ? 'grayscale contrast-200 bg-white text-black' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Governance</h1>
                    <p className="text-gray-500 mt-1">Multi-Tenant Oversight & Security Status</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setHighContrast(!highContrast)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${highContrast ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                        aria-pressed={highContrast}
                        aria-label="Toggle High Contrast Mode"
                    >
                        {highContrast ? "Exit High Contrast" : "High Contrast (WCAG)"}
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-sm font-medium">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        System Operational
                    </div>
                    <button
                        onClick={async () => {
                            if (confirm("⚠️ DECLARE SECURITY INCIDENT? \n\nThis will trigger the 72-hour mandatory reporting timer (GDPR/Kenya ODPC). Proceed?")) {
                                await fetch(`${API_URL}/incidents`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ description: "Manual Admin Declaration via Dashboard", tenant_name: "Master Admin" })
                                });
                                alert("INCIDENT DECLARED. Breach Protocol Activated.");
                                window.location.reload();
                            }
                        }}
                        className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-red-900/20 animate-pulse"
                    >
                        Declare Incident
                    </button>
                </div>

                {/* Four-Eyes Panel */}
                {approvals.length > 0 && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-amber-800 font-bold">
                                <ShieldCheck className="w-5 h-5" /> 👁️ PENDING CRITICAL AUTHORIZATIONS (Four-Eyes Principle)
                            </div>
                        </div>
                        <div className="space-y-3">
                            {approvals.map(a => (
                                <div key={a.id} className="flex items-center justify-between bg-white p-3 rounded border border-amber-200">
                                    <div className="text-sm">
                                        <span className="font-bold text-slate-800">{a.action_type}</span>
                                        <span className="text-gray-500 ml-2">Requested by {a.requester_id}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleProcessApproval(a.id, 'REJECTED')}
                                            className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleProcessApproval(a.id, 'APPROVED')}
                                            className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                        >
                                            Authorize
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Breach Timer (Simulated Visibility if active) */}
                {/* In a real app, this would check backend status. Hardcoding logic for demo if recent grievance exists */}
                {verifications.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg flex items-center justify-between">
                        <div>
                            <h4 className="text-red-800 font-bold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> SECURITY INCIDENT ACTIVE
                            </h4>
                            <p className="text-red-700 text-xs mt-1">Regulator Reporting Deadline: 72 Hours (Kenya DPA / GDPR)</p>
                        </div>
                        <div className="text-3xl font-mono font-bold text-red-600">
                            71:59:42
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Verifications" value={verifications.length.toString()} trend="+12.5%" icon={Activity} />
                    <StatCard title="Active Tenants" value="24" trend="+2" icon={Building2} />
                    <StatCard title="Grievances" value={verifications.filter(v => v.status === 'UNDER_REVIEW').length.toString()} trend="Pending Review" icon={ShieldCheck} alert={verifications.some(v => v.status === 'UNDER_REVIEW')} />
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
                                <th className="px-6 py-3">Applicant</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">AI Reasoning</th>
                                <th className="px-6 py-3">Governance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600">
                            {verifications.map((v) => (
                                <tr key={v.task_id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{v.created_at}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{v.applicant_name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${v.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                                                v.status === 'FAILED' ? 'bg-red-50 text-red-700' :
                                                    v.status === 'UNDER_REVIEW' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {v.status === 'COMPLETED' && <CheckCircle className="w-3 h-3 mr-1" />}
                                            {v.status === 'FAILED' && <XCircle className="w-3 h-3 mr-1" />}
                                            {v.status === 'UNDER_REVIEW' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {v.failure_reason ? (
                                            <span className="text-red-500 font-medium">{v.failure_reason}</span>
                                        ) : (
                                            <span className="text-gray-400">Match Confidence: {v.face_confidence || "N/A"}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {v.status !== 'UNDER_REVIEW' && (
                                            <button
                                                onClick={() => setSelectedTask(v)}
                                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                Report Issue
                                            </button>
                                        )}
                                        {v.status === 'UNDER_REVIEW' && (
                                            <span className="text-xs text-yellow-600 italic">Ticket Open</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {verifications.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                                        No verification data found. Run seed script.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedTask && (
                    <ReportIssueModal task={selectedTask} onClose={() => setSelectedTask(null)} />
                )}
            </div>
            );
};


