"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, X, Eye, EyeOff } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    branchId?: { name: string };
    isActive: boolean;
}

const ROLE_LABELS: Record<string, { label: string; style: string }> = {
    ADMIN: { label: "ADMIN", style: "text-[#DC2626] bg-[#FEE2E2]" },
    BRANCH_MANAGER: { label: "BRANCH", style: "text-[#CBA135] bg-[#FFF9F2]" },
    SALES_EXECUTIVE: { label: "SALES", style: "text-[#059669] bg-[#D1FAE5]" },
    KITCHEN_MANAGER: { label: "KITCHEN", style: "text-[#7C3AED] bg-[#EDE9FE]" },
    INVENTORY_MANAGER: { label: "INVENTORY", style: "text-[#0284C7] bg-[#E0F2FE]" },
    FINANCE_MANAGER: { label: "FINANCE", style: "text-[#CBA135] bg-[#FFF9F2]" },
    EVENT_MANAGER: { label: "EVENT", style: "text-[#4B5563] bg-[#F3F4F6]" },
    VENDOR: { label: "VENDOR", style: "text-[#EA580C] bg-[#FFF7ED]" },
    CUSTOMER: { label: "CUSTOMER", style: "text-[#6366F1] bg-[#EEF2FF]" },
};

export default function ManagersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [branches, setBranches] = useState<{ _id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("EVENT_MANAGER");
    const [branchId, setBranchId] = useState("");

    const ADDABLE_ROLES = [
        { value: "BRANCH_MANAGER", label: "Branch Manager" },
        { value: "EVENT_MANAGER", label: "Event Manager" },
        { value: "FINANCE_MANAGER", label: "Finance Manager" },
    ];

    async function loadData() {
        setLoading(true);
        const [usersRes, branchRes] = await Promise.all([
            apiGet<UserData[]>("/auth/users"),
            apiGet<{ _id: string; name: string }[]>("/branches"),
        ]);
        if (usersRes.success && usersRes.data) setUsers(usersRes.data);
        if (branchRes.success && branchRes.data) setBranches(branchRes.data);
        setLoading(false);
    }

    useEffect(() => { loadData(); }, []);

    function resetForm() {
        setName(""); setEmail(""); setPassword("");
        setRole("EVENT_MANAGER"); setBranchId("");
        setFormError(""); setFormSuccess("");
    }

    function openModal() { resetForm(); setShowForm(true); }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(""); setFormSuccess("");
        if (!name.trim()) return setFormError("Name is required.");
        if (!email.trim()) return setFormError("Email is required.");
        if (!password || password.length < 6) return setFormError("Password must be at least 6 characters.");
        if (!branchId) return setFormError("Please select a branch.");
        setSubmitting(true);
        const res = await apiPost("/auth/register", { name: name.trim(), email: email.trim(), password, role, branchId });
        if (res.success) {
            setFormSuccess(`${name} added successfully as ${ADDABLE_ROLES.find(r => r.value === role)?.label}.`);
            await loadData();
            setTimeout(() => { setShowForm(false); resetForm(); }, 1500);
        } else {
            setFormError(res.error || "Failed to add manager.");
        }
        setSubmitting(false);
    }

    const managerRoles = ["BRANCH_MANAGER", "EVENT_MANAGER", "FINANCE_MANAGER", "KITCHEN_MANAGER", "INVENTORY_MANAGER", "SALES_EXECUTIVE"];
    const managers = users.filter(u => managerRoles.includes(u.role));
    const activeCount = managers.filter(u => u.isActive).length;
    const branchMgrCount = managers.filter(u => u.role === "BRANCH_MANAGER").length;
    const eventMgrCount = managers.filter(u => u.role === "EVENT_MANAGER").length;
    const financeMgrCount = managers.filter(u => u.role === "FINANCE_MANAGER").length;

    if (loading) {
        return (
            <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden">
            <div className="mb-10 w-full max-w-[1440px]">
                <h1 className="text-[32px] font-playfair font-bold text-[#2B1512] leading-[1.2]">Manager Directory</h1>
            </div>

            <div className="flex flex-col w-full flex-1 max-w-[1440px] mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                    {[
                        { label: "TOTAL MANAGERS", value: String(managers.length), color: "text-[#2B1512]" },
                        { label: "BRANCH MANAGERS", value: String(branchMgrCount), color: "text-[#2B1512]" },
                        { label: "EVENT MANAGERS", value: String(eventMgrCount), color: "text-[#2B1512]" },
                        { label: "FINANCE MANAGERS", value: String(financeMgrCount), color: "text-[#2B1512]" },
                        { label: "ACTIVE", value: String(activeCount), color: "text-[#CBA135]" },
                        { label: "TOTAL USERS", value: String(users.length), color: "text-[#2B1512]" },
                    ].map((metric, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col justify-between h-[120px]">
                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{metric.label}</p>
                            <span className={`text-[40px] font-bold tracking-tight leading-none ${metric.color}`}>{metric.value}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-gray-50 overflow-hidden flex-1 flex flex-col p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-[24px] font-playfair font-bold text-[#2B1512]">Administrative Personnel</h2>
                            <p className="text-[13px] text-[#8e8484] font-medium mt-1">All registered users and managers.</p>
                        </div>
                        <button onClick={openModal} className="flex items-center gap-2 bg-[#2B1512] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors shadow-sm tracking-wide">
                            <UserPlus size={16} /> Add Manager
                        </button>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-5 text-[11px] font-bold text-[#2B1512] uppercase tracking-widest min-w-[220px]">NAME</th>
                                    <th className="pb-5 text-[11px] font-bold text-[#2B1512] uppercase tracking-widest">ROLE</th>
                                    <th className="pb-5 text-[11px] font-bold text-[#2B1512] uppercase tracking-widest">BRANCH</th>
                                    <th className="pb-5 text-[11px] font-bold text-[#2B1512] uppercase tracking-widest">EMAIL</th>
                                    <th className="pb-5 text-[11px] font-bold text-[#2B1512] uppercase tracking-widest text-center">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.length === 0 ? (
                                    <tr><td colSpan={5} className="py-12 text-center text-gray-400">No users found. Users API endpoint may need to be created.</td></tr>
                                ) : users.map((u) => {
                                    const roleInfo = ROLE_LABELS[u.role] || { label: u.role, style: "" };
                                    const initials = u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                                    return (
                                        <tr key={u._id} className="group hover:bg-[#FDFBF9] transition-colors">
                                            <td className="py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-[46px] h-[46px] rounded-full bg-[#E6AA7E] flex items-center justify-center text-white font-bold text-[14px]">{initials}</div>
                                                    <div>
                                                        <p className="font-bold text-[#1A1A1A] text-[15px]">{u.name}</p>
                                                        <p className="text-[12px] text-[#8e8484] mt-0.5">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <span className="text-[13px] font-medium text-[#4B5563]">{roleInfo.label}</span>
                                            </td>
                                            <td className="py-5 text-[14px] font-bold text-[#2B3445]">
                                                {u.branchId?.name || "—"}
                                            </td>
                                            <td className="py-5 text-[14px] text-[#4B5563] font-medium">{u.email}</td>
                                            <td className="py-5 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest ${u.isActive ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>
                                                    {u.isActive ? "ACTIVE" : "INACTIVE"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Add Manager Modal ─────────────────────────────────────── */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-[#2B1512] px-6 py-5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">Admin Panel</p>
                                <h2 className="text-[20px] font-playfair font-bold text-white">Add New Manager</h2>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <X size={15} className="text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] px-4 py-3 rounded-xl text-[13px] font-medium">{formError}</div>
                            )}
                            {formSuccess && (
                                <div className="bg-[#F0FDF4] border border-[#86EFAC] text-[#16A34A] px-4 py-3 rounded-xl text-[13px] font-medium">{formSuccess}</div>
                            )}

                            {/* Role selector */}
                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Role *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ADDABLE_ROLES.map(r => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setRole(r.value)}
                                            className={`px-3 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
                                                role === r.value
                                                    ? "bg-[#2B1512] text-white border-[#2B1512]"
                                                    : "bg-[#FAFAF8] text-[#4B5563] border-gray-200 hover:border-[#2B1512]/30"
                                            }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Full Name *</label>
                                <input
                                    value={name} onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Priya Sharma"
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Email *</label>
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="name@banquetpro.com"
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Password *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="w-full px-4 py-3 pr-12 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium"
                                    />
                                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8484] hover:text-[#2B1512] transition-colors">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Branch */}
                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Branch *</label>
                                <select
                                    value={branchId} onChange={e => setBranchId(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium appearance-none"
                                >
                                    <option value="">Select branch</option>
                                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-[#4B5563] rounded-xl text-[13px] font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2B1512] text-white rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors disabled:opacity-60">
                                    {submitting
                                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : <UserPlus size={15} />}
                                    {submitting ? "Adding..." : "Add Manager"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
