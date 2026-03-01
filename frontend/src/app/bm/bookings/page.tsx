"use client";

import { useState, useEffect } from "react";
import { Plus, MoreVertical, X, Edit2, Trash2 } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

interface Branch { _id: string; name: string; halls: { _id: string; name: string; capacity: number }[]; }
interface Booking {
    _id: string;
    eventName?: string;
    customerId?: { name: string };
    branchId?: { _id: string; name: string } | string;
    hallId?: { _id: string; name: string } | string;
    eventDate: string;
    startTime?: string;
    endTime?: string;
    guestCount?: number;
    status: string;
    totalAmount?: number;
    advancePaid?: number;
    advancePayment?: number;
}

export default function BmBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Form fields
    const [branchId, setBranchId] = useState("");
    const [hallId, setHallId] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [guestCount, setGuestCount] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [advancePayment, setAdvancePayment] = useState("");
    const [status, setStatus] = useState("Tentative");

    async function loadData() {
        setLoading(true);
        const [bk, br] = await Promise.all([
            apiGet<Booking[]>("/bookings"),
            apiGet<Branch[]>("/branches"),
        ]);
        if (bk.success && bk.data) setBookings(bk.data);
        if (br.success && br.data) setBranches(br.data);
        setLoading(false);
    }

    useEffect(() => { loadData(); }, []);

    // Auto-select branch if only 1 is available (e.g. for Branch Managers)
    useEffect(() => {
        if (branches.length === 1 && !branchId) {
            setBranchId(branches[0]._id);
        }
    }, [branches, branchId]);

    const selectedBranch = branches.find(b => b._id === branchId);
    const confirmed = bookings.filter(b => b.status === "Confirmed").length;
    const tentative = bookings.filter(b => b.status === "Tentative").length;
    const totalRev = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    function resetForm() {
        setBranchId("");
        setHallId("");
        setEventDate("");
        setStartTime("");
        setEndTime("");
        setGuestCount("");
        setCustomerName("");
        setTotalAmount("");
        setAdvancePayment("");
        setStatus("Tentative");
        setError("");
    }

    function openEdit(b: Booking) {
        setEditingBooking(b);
        setBranchId(typeof b.branchId === "object" ? b.branchId?._id || "" : b.branchId || "");
        setHallId(typeof b.hallId === "object" ? b.hallId?._id || "" : b.hallId || "");
        setEventDate(b.eventDate.split("T")[0]);
        setStartTime(b.startTime || "");
        setEndTime(b.endTime || "");
        setGuestCount(String(b.guestCount || ""));
        setCustomerName(b.customerId?.name || "");
        setTotalAmount(String(b.totalAmount || ""));
        setAdvancePayment(String(b.advancePayment || ""));
        setStatus(b.status || "Tentative");
        setError("");
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!branchId) return setError("Please select a branch.");
        if (!hallId) return setError("Please select a hall.");
        if (!customerName.trim()) return setError("Please enter a customer name.");
        if (!eventDate) return setError("Please select an event date.");
        if (!guestCount) return setError("Please enter the total number of guests.");
        if (!startTime) return setError("Please select a start time.");
        if (!endTime) return setError("Please select an end time.");
        if (!totalAmount) return setError("Please enter the total amount.");

        setSubmitting(true);

        const payload = {
            branchId,
            hallId,
            eventDate,
            startTime,
            endTime,
            guestCount: parseInt(guestCount),
            customerName: customerName.trim(),
            totalAmount: parseFloat(totalAmount),
            advancePayment: parseFloat(advancePayment) || 0,
            status,
        };

        const res = editingBooking
            ? await apiPut(`/bookings/${editingBooking._id}`, payload)
            : await apiPost("/bookings", payload);

        if (res.success) {
            resetForm();
            setEditingBooking(null);
            setShowForm(false);
            await loadData();
        } else {
            setError(res.error || `Failed to ${editingBooking ? 'update' : 'create'} booking`);
        }
        setSubmitting(false);
    }

    async function handleDeleteConfirmed() {
        if (!bookingToDelete) return;
        setSubmitting(true);
        const res = await apiDelete(`/bookings/${bookingToDelete._id}`);
        if (res.success) {
            setBookingToDelete(null);
            await loadData();
        } else {
            alert(res.error || "Failed to delete booking");
        }
        setSubmitting(false);
    }

    if (loading) {
        return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden">
            <div className="w-full max-w-[1440px]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-[28px] font-playfair font-bold text-[#2B1512] leading-[1.2]">Bookings</h1>
                        <p className="text-[13px] text-[#8e8484] font-medium mt-1">Manage all branch bookings</p>
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-[#2B1512] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors shadow-sm">
                        <Plus size={16} /> New Booking
                    </button>
                </div>

                {/* ── New Booking Modal ─────────────────────────────── */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div>
                                    <h2 className="text-[20px] font-playfair font-bold text-[#2B1512]">{editingBooking ? "Edit Booking" : "New Booking"}</h2>
                                    <p className="text-[13px] text-[#8e8484] mt-1">{editingBooking ? "Update booking details" : "Create a new event booking"}</p>
                                </div>
                                <button onClick={() => { setShowForm(false); setEditingBooking(null); setCustomerName(""); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={16} className="text-[#4B5563]" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {error && (
                                    <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] px-4 py-3 rounded-xl text-[13px] font-medium">{error}</div>
                                )}

                                {/* Branch & Hall */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Branch *</label>
                                        <select
                                            value={branchId}
                                            onChange={e => { setBranchId(e.target.value); setHallId(""); }}
                                            disabled={branches.length === 1} // Lock if they only have 1 branch available 
                                            className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent font-medium appearance-none disabled:opacity-75 disabled:bg-gray-100"
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Hall *</label>
                                        <select value={hallId} onChange={e => setHallId(e.target.value)} disabled={!branchId} className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent font-medium disabled:opacity-50 appearance-none">
                                            <option value="">Select Hall</option>
                                            {selectedBranch?.halls.map(h => <option key={h._id} value={h._id}>{h.name} ({h.capacity} guests)</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Customer */}
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Customer Name *</label>
                                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Rajesh Kumar" className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[14px] text-[#2B1512] placeholder:text-[#C5BFBA] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent font-medium" />
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Event Date *</label>
                                        <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Total Guests *</label>
                                        <input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="e.g. 150" min="1" className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] placeholder:text-[#C5BFBA] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent font-medium" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Start Time *</label>
                                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">End Time *</label>
                                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent font-medium" />
                                    </div>
                                </div>

                                {/* Amount & Advance */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Total Amount (₹) *</label>
                                        <input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="e.g. 250000" min="0" className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] placeholder:text-[#C5BFBA] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Advance Payment (₹)</label>
                                        <input type="number" value={advancePayment} onChange={e => setAdvancePayment(e.target.value)} placeholder="e.g. 50000" min="0" className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] placeholder:text-[#C5BFBA] focus:outline-none focus:ring-2 focus:ring-[#CBA135] focus:border-transparent font-medium" />
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Status</label>
                                    <div className="flex gap-3">
                                        {["Tentative", "Confirmed"].map(s => (
                                            <button key={s} type="button" onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${status === s ? (s === "Confirmed" ? "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]" : "bg-[#FEF9C3] text-[#A16207] border-[#FDE68A]") : "bg-white text-[#8e8484] border-gray-200 hover:bg-gray-50"}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Balance Preview */}
                                {totalAmount && (
                                    <div className="bg-[#FAFAF8] rounded-xl p-4 border border-gray-100">
                                        <div className="flex justify-between text-[13px] mb-1">
                                            <span className="text-[#8e8484]">Total Amount</span>
                                            <span className="font-bold text-[#2B1512]">₹{parseFloat(totalAmount || "0").toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between text-[13px] mb-1">
                                            <span className="text-[#8e8484]">Advance</span>
                                            <span className="font-bold text-[#10B981]">₹{parseFloat(advancePayment || "0").toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between text-[13px] pt-2 border-t border-gray-200">
                                            <span className="font-bold text-[#8e8484]">Balance Due</span>
                                            <span className="font-bold text-[#DC2626]">₹{(parseFloat(totalAmount || "0") - parseFloat(advancePayment || "0")).toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-2">
                                    <button type="submit" disabled={submitting} className="flex-1 bg-[#2B1512] text-white py-3 rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "Saving..." : editingBooking ? "Save Changes" : "Create Booking"}</button>
                                    <button type="button" onClick={() => { setShowForm(false); setEditingBooking(null); setCustomerName(""); }} className="px-6 py-3 rounded-xl text-[13px] font-bold text-[#8e8484] border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Delete Confirmation Modal ──────────────────────── */}
                {bookingToDelete && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-6 text-center">
                            <div className="w-16 h-16 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} className="text-[#DC2626]" />
                            </div>
                            <h2 className="text-[20px] font-playfair font-bold text-[#2B1512] mb-2">Delete Booking?</h2>
                            <p className="text-[13px] text-[#8e8484] mb-6">
                                Are you sure you want to delete the booking for <strong className="text-[#2B1512]">{bookingToDelete.customerId?.name || "this customer"}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setBookingToDelete(null)} disabled={submitting} className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold text-[#8e8484] bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50">Cancel</button>
                                <button onClick={handleDeleteConfirmed} disabled={submitting} className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors disabled:opacity-50 shadow-sm">{submitting ? "Deleting..." : "Delete Booking"}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Bookings", value: String(bookings.length) },
                        { label: "Confirmed", value: String(confirmed) },
                        { label: "Tentative", value: String(tentative) },
                        { label: "Total Revenue", value: `₹${totalRev.toLocaleString("en-IN")}` },
                    ].map((m, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p>
                            <span className="text-[28px] font-bold tracking-tight text-[#2B1512] mt-2">{m.value}</span>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Event</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Date</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Guests</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Amount</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Status</th>
                                    <th className="pr-6 py-5 w-[40px]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No bookings found</td></tr>
                                ) : bookings.map(b => {
                                    const statusStyle = b.status === "Confirmed" ? "bg-[#D1FAE5] text-[#059669]" : b.status === "Cancelled" ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#FEF9C3] text-[#A16207]";
                                    return (
                                        <tr key={b._id} className="hover:bg-[#FDFBF9] transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[#1A1A1A] text-[14px]">Booking</p>
                                                <p className="text-[12px] text-[#8e8484] mt-0.5">{b.customerId?.name || "—"}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-bold text-[13px] text-[#2B1512]">{new Date(b.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                                                {b.startTime && <p className="text-[11px] text-[#8e8484]">{b.startTime} - {b.endTime}</p>}
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-[13px] text-[#2B1512]">{b.guestCount || "—"}</td>
                                            <td className="px-4 py-4 text-center">
                                                <p className="font-bold text-[13px] text-[#2B1512]">₹{(b.totalAmount || 0).toLocaleString("en-IN")}</p>
                                            </td>
                                            <td className="px-4 py-4"><span className={`inline-block px-3 py-[3px] rounded-full text-[10px] font-bold tracking-wider ${statusStyle}`}>{b.status}</span></td>
                                            <td className="pr-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); openEdit(b); }} className="p-2 rounded-lg bg-[#FAFAF8] border border-gray-100 text-[#8e8484] hover:text-[#CBA135] hover:border-[#FDE68A] hover:bg-[#FFFBEB] transition-all" title="Edit Booking">
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); setBookingToDelete(b); }} className="p-2 rounded-lg bg-[#FAFAF8] border border-gray-100 text-[#8e8484] hover:text-[#DC2626] hover:border-[#FEE2E2] hover:bg-[#FEF2F2] transition-all" title="Delete Booking">
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
