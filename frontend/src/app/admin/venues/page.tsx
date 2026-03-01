"use client";

import { useState, useEffect } from "react";
import { Plus, X, Trash2, Pencil, Trash } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { apiGet, apiPost, apiPut } from "@/lib/api";

interface Branch {
    _id: string;
    name: string;
    location: string;
    halls: { _id?: string; name: string; capacity: number; amenities?: string[] }[];
}
interface Booking { _id: string; branchId?: string; hallId?: string; totalAmount?: number; status: string; eventDate: string; }
interface HallForm { name: string; capacity: string; amenities: string; }

export default function VenuesPerformancePage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Modal state
    const [modalMode, setModalMode] = useState<"add" | "edit" | "delete" | null>(null);
    const [editBranchId, setEditBranchId] = useState<string | null>(null);

    // Form state
    const [branchName, setBranchName] = useState("");
    const [branchLocation, setBranchLocation] = useState("");
    const [halls, setHalls] = useState<HallForm[]>([{ name: "", capacity: "", amenities: "" }]);

    // Action menu state
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    async function loadData() {
        setLoading(true);
        const [br, bk] = await Promise.all([apiGet<Branch[]>("/branches"), apiGet<Booking[]>("/bookings")]);
        if (br.success && br.data) setBranches(br.data);
        if (bk.success && bk.data) setBookings(bk.data);
        setLoading(false);
    }

    useEffect(() => { loadData(); }, []);

    // Close menu on outside click
    useEffect(() => {
        function handleClick() { setOpenMenu(null); }
        if (openMenu) { document.addEventListener("click", handleClick); return () => document.removeEventListener("click", handleClick); }
    }, [openMenu]);

    const allHalls = branches.flatMap(b => b.halls.map(h => ({ ...h, branchName: b.name, branchId: b._id })));
    const totalRevenue = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);

    function resetForm() {
        setBranchName("");
        setBranchLocation("");
        setHalls([{ name: "", capacity: "", amenities: "" }]);
        setEditBranchId(null);
    }

    function openAdd() {
        resetForm();
        setModalMode("add");
    }

    function openEdit(branch: Branch) {
        setEditBranchId(branch._id);
        setBranchName(branch.name);
        setBranchLocation(branch.location);
        setHalls(branch.halls.map(h => ({
            name: h.name,
            capacity: String(h.capacity),
            amenities: (h.amenities || []).join(", "),
        })));
        setModalMode("edit");
        setOpenMenu(null);
    }

    function openDelete(branchId: string) {
        setEditBranchId(branchId);
        setModalMode("delete");
        setOpenMenu(null);
    }

    function addHall() { setHalls([...halls, { name: "", capacity: "", amenities: "" }]); }
    function removeHall(i: number) { setHalls(halls.filter((_, idx) => idx !== i)); }
    function updateHall(i: number, field: keyof HallForm, value: string) { const u = [...halls]; u[i][field] = value; setHalls(u); }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        const hallsData = halls.filter(h => h.name.trim()).map(h => ({
            name: h.name.trim(),
            capacity: parseInt(h.capacity) || 100,
            amenities: h.amenities.split(",").map(a => a.trim()).filter(Boolean),
        }));
        const payload = { name: branchName.trim(), location: branchLocation.trim(), halls: hallsData };

        let res;
        if (modalMode === "edit" && editBranchId) {
            res = await apiPut(`/branches/${editBranchId}`, payload);
        } else {
            res = await apiPost("/branches", payload);
        }

        if (res.success) {
            resetForm();
            setModalMode(null);
            await loadData();
        } else {
            alert(res.error || "Operation failed");
        }
        setSubmitting(false);
    }

    async function handleDelete() {
        if (!editBranchId) return;
        setSubmitting(true);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;
            const res = await fetch(`/api/branches/${editBranchId}`, { method: "DELETE", headers });
            const data = await res.json();
            if (data.success) {
                setModalMode(null);
                setEditBranchId(null);
                await loadData();
            } else {
                alert(data.error || "Delete failed");
            }
        } catch { alert("Delete failed"); }
        setSubmitting(false);
    }

    if (loading) {
        return <div className="flex flex-col w-full min-h-full bg-[#F5F3ED] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    }

    const deleteBranch = editBranchId ? branches.find(b => b._id === editBranchId) : null;

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F5F3ED] p-10 overflow-x-hidden">
            <div className="flex items-center justify-between mb-8 w-full max-w-[1440px]">
                <div>
                    <h1 className="text-[32px] font-playfair font-bold text-[#2B1512] leading-[1.2]">Venues Performance</h1>
                    <p className="text-[13px] text-[#8e8484] font-semibold tracking-wide mt-1">Analytics across all premium locations.</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 bg-[#2B1512] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors shadow-sm">
                    <Plus size={16} /> Add Venue
                </button>
            </div>

            {/* ── Add / Edit Modal ────────────────────────────────── */}
            {(modalMode === "add" || modalMode === "edit") && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-[20px] font-playfair font-bold text-[#2B1512]">{modalMode === "edit" ? "Edit Venue" : "Add New Venue"}</h2>
                                <p className="text-[13px] text-[#8e8484] mt-1">{modalMode === "edit" ? "Update branch and hall details" : "Create a new branch with halls"}</p>
                            </div>
                            <button onClick={() => { setModalMode(null); resetForm(); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={16} className="text-[#4B5563]" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Branch Name *</label>
                                <input type="text" value={branchName} onChange={e => setBranchName(e.target.value)} placeholder="e.g. Royal Grand Palace" required className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[14px] text-[#2B1512] placeholder:text-[#C5BFBA] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent font-medium" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Location *</label>
                                <input type="text" value={branchLocation} onChange={e => setBranchLocation(e.target.value)} placeholder="e.g. Mumbai, Maharashtra" required className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[14px] text-[#2B1512] placeholder:text-[#C5BFBA] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent font-medium" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Halls</label>
                                    <button type="button" onClick={addHall} className="flex items-center gap-1 text-[12px] font-bold text-[#CBA135] hover:text-[#a07c22] transition-colors"><Plus size={14} /> Add Hall</button>
                                </div>
                                <div className="space-y-4">
                                    {halls.map((hall, i) => (
                                        <div key={i} className="bg-[#FAFAF8] rounded-xl p-4 border border-gray-100 relative">
                                            {halls.length > 1 && <button type="button" onClick={() => removeHall(i)} className="absolute top-3 right-3 text-gray-300 hover:text-[#DC2626] transition-colors"><Trash2 size={14} /></button>}
                                            <div className="text-[10px] font-bold text-[#CBA135] uppercase tracking-widest mb-3">Hall {i + 1}</div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#8e8484] uppercase tracking-widest mb-1">Name *</label>
                                                    <input type="text" value={hall.name} onChange={e => updateHall(i, "name", e.target.value)} placeholder="e.g. Grand Ballroom" required className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-[#2B1512] placeholder:text-[#C5BFBA] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#8e8484] uppercase tracking-widest mb-1">Capacity *</label>
                                                    <input type="number" value={hall.capacity} onChange={e => updateHall(i, "capacity", e.target.value)} placeholder="e.g. 500" required min="1" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-[#2B1512] placeholder:text-[#C5BFBA] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent" />
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <label className="block text-[10px] font-bold text-[#8e8484] uppercase tracking-widest mb-1">Amenities (comma-separated)</label>
                                                <input type="text" value={hall.amenities} onChange={e => updateHall(i, "amenities", e.target.value)} placeholder="e.g. AC, Stage, Projector" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-[#2B1512] placeholder:text-[#C5BFBA] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button type="submit" disabled={submitting} className="flex-1 bg-[#2B1512] text-white py-3 rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "Saving..." : modalMode === "edit" ? "Update Venue" : "Add Venue"}</button>
                                <button type="button" onClick={() => { setModalMode(null); resetForm(); }} className="px-6 py-3 rounded-xl text-[13px] font-bold text-[#8e8484] border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ───────────────────────── */}
            {modalMode === "delete" && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px]">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4"><Trash size={22} className="text-[#DC2626]" /></div>
                            <h2 className="text-[18px] font-playfair font-bold text-[#2B1512] text-center">Delete Venue</h2>
                            <p className="text-[13px] text-[#8e8484] text-center mt-2">
                                Are you sure you want to delete <strong className="text-[#2B1512]">{deleteBranch?.name || "this venue"}</strong>?
                                This will remove all halls associated with this branch. This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 p-6 pt-0">
                            <button onClick={() => { setModalMode(null); setEditBranchId(null); }} className="flex-1 px-5 py-3 rounded-xl text-[13px] font-bold text-[#8e8484] border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={handleDelete} disabled={submitting} className="flex-1 bg-[#DC2626] text-white py-3 rounded-xl text-[13px] font-bold hover:bg-[#B91C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "Deleting..." : "Delete"}</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col w-full flex-1 max-w-[1440px] mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <MetricCard title="Total Venues" value={String(allHalls.length)} />
                    <MetricCard title="Total Revenue" value={`₹${(totalRevenue / 100000).toFixed(2)} L`} />
                    <MetricCard title="Total Bookings" value={String(bookings.length)} />
                    <MetricCard title="Confirmed" value={String(bookings.filter(b => b.status === "Confirmed").length)} />
                    <MetricCard title="Branches" value={String(branches.length)} />
                    <MetricCard title="Avg Capacity" value={String(allHalls.length > 0 ? Math.round(allHalls.reduce((s, h) => s + h.capacity, 0) / allHalls.length) : 0)} />
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left" style={{ borderSpacing: '0' }}>
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest min-w-[180px]">Venue Name</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Branch</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Capacity</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Amenities</th>
                                    <th className="pr-6 py-5 w-[120px] text-center text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allHalls.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No venues found</td></tr>
                                ) : allHalls.map((h, i) => {
                                    const branch = branches.find(b => b._id === h.branchId);
                                    return (
                                        <tr key={i} className="group hover:bg-[#F9FAFB] transition-colors">
                                            <td className="px-6 py-4"><p className="font-bold text-[#1A1A1A] text-[14px]">{h.name}</p></td>
                                            <td className="px-4 py-4 text-[13px] font-medium text-[#4B5563]">{h.branchName}</td>
                                            <td className="px-4 py-4 text-center"><span className="text-[13px] font-bold text-[#4B5563]">{h.capacity}</span></td>
                                            <td className="px-4 py-4"><span className="text-[13px] text-[#4B5563]">{(h.amenities || []).join(", ") || "—"}</span></td>
                                            <td className="pr-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => branch && openEdit(branch)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8e8484] hover:text-[#CBA135] hover:bg-[#FFF9F2] transition-all"
                                                        title="Edit Branch"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDelete(h.branchId)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8e8484] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-all"
                                                        title="Delete Branch"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
