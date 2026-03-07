"use client";
import { useState, useEffect } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

interface Vendor {
    _id: string;
    name: string;
    serviceType: string;
    contact: string;
    branchId?: { _id: string; name: string } | string;
}
interface Branch {
    _id: string;
    name: string;
}

const SERVICE_TYPES = [
    "Catering",
    "Decoration",
    "Photography",
    "Music & DJ",
    "Lighting",
    "Florist",
    "Tent & Furniture",
    "Valet Parking",
    "Security",
    "Cleaning",
    "Beverages",
    "Other",
];

export default function FmVendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [serviceType, setServiceType] = useState("");
    const [contact, setContact] = useState("");
    const [branchId, setBranchId] = useState("");
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    async function loadVendors() {
        setLoading(true);
        const [vRes, bRes] = await Promise.all([
            apiGet<Vendor[]>("/vendors"),
            apiGet<Branch[]>("/branches"),
        ]);
        if (vRes.success && vRes.data) setVendors(vRes.data);
        if (bRes.success && bRes.data) setBranches(bRes.data);
        setLoading(false);
    }

    useEffect(() => {
        loadVendors();
    }, []);

    function openAdd() {
        setEditingId(null);
        setName("");
        setServiceType("");
        setContact("");
        setBranchId(branches[0]?._id || "");
        setFormError("");
        setShowForm(true);
    }

    function openEdit(v: Vendor) {
        setEditingId(v._id);
        setName(v.name);
        setServiceType(v.serviceType);
        setContact(v.contact);
        const bid = typeof v.branchId === "object" ? v.branchId?._id || "" : v.branchId || "";
        setBranchId(bid);
        setFormError("");
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError("");
        if (!name.trim()) return setFormError("Name is required.");
        if (!serviceType) return setFormError("Select a service type.");
        if (!contact.trim()) return setFormError("Contact is required.");
        if (!branchId) return setFormError("Select a branch.");

        setSaving(true);
        const body = { name: name.trim(), serviceType, contact: contact.trim(), branchId };

        if (editingId) {
            const res = await apiPut(`/vendors/${editingId}`, body);
            if (!res.success) {
                setFormError(res.error || "Failed to update.");
                setSaving(false);
                return;
            }
        } else {
            const res = await apiPost("/vendors", body);
            if (!res.success) {
                setFormError(res.error || "Failed to create.");
                setSaving(false);
                return;
            }
        }
        setSaving(false);
        setShowForm(false);
        loadVendors();
    }

    async function handleDelete(id: string) {
        await apiDelete(`/vendors/${id}`);
        setDeleteConfirm(null);
        loadVendors();
    }

    if (loading)
        return (
            <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" />
            </div>
        );

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden">
            <div className="w-full max-w-[1440px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Vendor Payments</h1>
                        <p className="text-[13px] text-[#8e8484] font-medium mt-1">Manage vendor partnerships and payments</p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 bg-[#2B1512] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors shadow-sm"
                    >
                        <Plus size={16} /> Add Vendor
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total Vendors", value: String(vendors.length) },
                        { label: "Service Types", value: String(new Set(vendors.map((v) => v.serviceType)).size) },
                        {
                            label: "Branches Covered",
                            value: String(
                                new Set(vendors.map((v) => (typeof v.branchId === "object" ? v.branchId?.name : "")).filter(Boolean)).size
                            ),
                        },
                    ].map((m, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p>
                            <span className="text-[28px] font-bold tracking-tight text-[#2B1512] mt-2 block">{m.value}</span>
                        </div>
                    ))}
                </div>

                {/* Vendors Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Vendor</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Service</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Contact</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Branch</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {vendors.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            No vendors found. Click &quot;Add Vendor&quot; to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    vendors.map((v) => (
                                        <tr key={v._id} className="hover:bg-[#FDFBF9]">
                                            <td className="px-6 py-4 font-bold text-[14px] text-[#2B1512]">{v.name}</td>
                                            <td className="px-4 py-4">
                                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FFF9F2] text-[#CBA135] tracking-wider">
                                                    {v.serviceType.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-[13px] text-[#4B5563]">{v.contact}</td>
                                            <td className="px-4 py-4 text-[13px] text-[#8e8484]">
                                                {typeof v.branchId === "object" ? v.branchId?.name : "—"}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openEdit(v)}
                                                        className="w-8 h-8 rounded-lg bg-[#F8F6F2] flex items-center justify-center text-[#8e8484] hover:text-[#2B1512] hover:bg-[#F0EDE8] transition-colors"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(v._id)}
                                                        className="w-8 h-8 rounded-lg bg-[#F8F6F2] flex items-center justify-center text-[#8e8484] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Add/Edit Vendor Modal ── */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-[#2B1512] px-6 py-5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">Finance</p>
                                <h2 className="text-[20px] font-playfair font-bold text-white">
                                    {editingId ? "Edit Vendor" : "Add Vendor"}
                                </h2>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <X size={15} className="text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] px-4 py-3 rounded-xl text-[13px] font-medium">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Vendor Name *</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Royal Caterers"
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Service Type *</label>
                                    <select
                                        value={serviceType}
                                        onChange={(e) => setServiceType(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium appearance-none"
                                    >
                                        <option value="">Select...</option>
                                        {SERVICE_TYPES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Branch *</label>
                                    <select
                                        value={branchId}
                                        onChange={(e) => setBranchId(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium appearance-none"
                                    >
                                        <option value="">Select...</option>
                                        {branches.map((b) => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Contact *</label>
                                <input
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="Phone or email"
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-[#4B5563] rounded-xl text-[13px] font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2B1512] text-white rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Plus size={15} />
                                    )}
                                    {editingId ? "Update" : "Add Vendor"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[380px] p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-[18px] font-playfair font-bold text-[#2B1512] mb-2">Delete Vendor</h3>
                        <p className="text-[13px] text-[#8e8484] mb-6">Are you sure? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 bg-gray-100 text-[#4B5563] rounded-xl text-[13px] font-bold hover:bg-gray-200 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-3 bg-[#DC2626] text-white rounded-xl text-[13px] font-bold hover:bg-[#B91C1C] transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
