"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Users, Building2, CreditCard, CheckCircle2, Plus } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { CalendarGrid } from "@/components/ui/CalendarGrid";

interface Branch { _id: string; name: string; halls: { _id: string; name: string; capacity: number }[]; }

interface Booking {
    _id: string;
    eventName?: string;
    eventDate: string;
    startTime?: string;
    endTime?: string;
    guestCount?: number;
    status: string;
    totalAmount?: number;
    advancePayment?: number;
    balancePayment?: number;
    customerId?: { name: string; email: string };
    branchId?: { _id: string; name: string };
}

export default function EmCalendarPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);

    // Detail modal
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Add booking modal
    const [showAddForm, setShowAddForm] = useState(false);
    const [addError, setAddError] = useState("");
    const [submitting, setSubmitting] = useState(false);
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

    useEffect(() => {
        if (branches.length === 1 && !branchId) setBranchId(branches[0]._id);
    }, [branches, branchId]);

    const calendarEvents = bookings.map(b => ({
        id: b._id,
        title: b.customerId?.name || "Event",
        date: new Date(b.eventDate),
        status: b.status,
    }));

    function openAddModal(date: Date) {
        setEventDate(date.toISOString().split("T")[0]);
        setBranchId(branches.length === 1 ? branches[0]._id : "");
        setHallId(""); setStartTime(""); setEndTime("");
        setGuestCount(""); setCustomerName(""); setTotalAmount("");
        setAdvancePayment(""); setStatus("Tentative"); setAddError("");
        setShowAddForm(true);
    }

    function handleEventClick(ev: { id: string }) {
        const b = bookings.find(b => b._id === ev.id);
        if (b) setSelectedBooking(b);
    }

    async function handleAddSubmit(e: React.FormEvent) {
        e.preventDefault();
        setAddError("");
        if (!branchId) return setAddError("Please select a branch.");
        if (!hallId) return setAddError("Please select a hall.");
        if (!customerName.trim()) return setAddError("Please enter a customer name.");
        if (!eventDate) return setAddError("Please select an event date.");
        if (!startTime) return setAddError("Please enter a start time.");
        if (!endTime) return setAddError("Please enter an end time.");
        if (!guestCount) return setAddError("Please enter the guest count.");
        if (!totalAmount) return setAddError("Please enter the total amount.");
        setSubmitting(true);
        const res = await apiPost("/bookings", {
            branchId, hallId, eventDate, startTime, endTime,
            guestCount: parseInt(guestCount),
            customerName: customerName.trim(),
            totalAmount: parseFloat(totalAmount),
            advancePayment: parseFloat(advancePayment) || 0,
            status,
        });
        if (res.success) {
            setShowAddForm(false);
            await loadData();
        } else {
            setAddError(res.error || "Failed to create booking");
        }
        setSubmitting(false);
    }

    const selectedBranch = branches.find(b => b._id === branchId);

    if (loading) {
        return (
            <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const statusColor = (s: string) =>
        s === "Confirmed" ? "bg-green-100 text-green-700" :
        s === "Cancelled" ? "bg-red-100 text-red-600" :
        "bg-orange-100 text-orange-700";

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden">
            <div className="w-full max-w-[1440px]">
                <div className="mb-8">
                    <h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Calendar</h1>
                    <p className="text-[13px] text-[#8e8484] font-medium mt-1">Event schedule overview</p>
                </div>

                <div className="w-full">
                    <CalendarGrid
                        events={calendarEvents}
                        onEventClick={handleEventClick}
                        onAddClick={openAddModal}
                    />
                </div>
            </div>

            {/* ── Event Detail Modal ───────────────────────────── */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-[#2B1512] px-6 py-5 flex items-start justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">Booking Details</p>
                                <h2 className="text-[20px] font-playfair font-bold text-white">
                                    {selectedBooking.customerId?.name || "Event"}
                                </h2>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors mt-1">
                                <X size={15} className="text-white" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Status</span>
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${statusColor(selectedBooking.status)}`}>
                                    {selectedBooking.status}
                                </span>
                            </div>

                            <div className="h-px bg-gray-100" />

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#FFF9F0] flex items-center justify-center flex-shrink-0">
                                        <Calendar size={15} className="text-[#CBA135]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-wider">Date</p>
                                        <p className="text-[13px] font-bold text-[#2B1512] mt-0.5">
                                            {new Date(selectedBooking.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                </div>

                                {(selectedBooking.startTime || selectedBooking.endTime) && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#FFF9F0] flex items-center justify-center flex-shrink-0">
                                            <Clock size={15} className="text-[#CBA135]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-wider">Time</p>
                                            <p className="text-[13px] font-bold text-[#2B1512] mt-0.5">
                                                {selectedBooking.startTime} – {selectedBooking.endTime}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedBooking.guestCount && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#FFF9F0] flex items-center justify-center flex-shrink-0">
                                            <Users size={15} className="text-[#CBA135]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-wider">Guests</p>
                                            <p className="text-[13px] font-bold text-[#2B1512] mt-0.5">{selectedBooking.guestCount}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedBooking.branchId && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#FFF9F0] flex items-center justify-center flex-shrink-0">
                                            <Building2 size={15} className="text-[#CBA135]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-wider">Branch</p>
                                            <p className="text-[13px] font-bold text-[#2B1512] mt-0.5">{selectedBooking.branchId.name}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedBooking.customerId?.email && (
                                    <div className="flex items-start gap-3 col-span-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#FFF9F0] flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 size={15} className="text-[#CBA135]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-wider">Customer Email</p>
                                            <p className="text-[13px] font-bold text-[#2B1512] mt-0.5">{selectedBooking.customerId.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Financials */}
                            {selectedBooking.totalAmount !== undefined && (
                                <>
                                    <div className="h-px bg-gray-100" />
                                    <div className="bg-[#FAFAF8] rounded-xl p-4 space-y-2">
                                        <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest mb-3">Financials</p>
                                        <div className="flex items-center gap-3">
                                            <CreditCard size={14} className="text-[#CBA135]" />
                                            <div className="flex justify-between flex-1">
                                                <span className="text-[12px] text-[#4B5563]">Total Amount</span>
                                                <span className="text-[13px] font-bold text-[#2B1512]">₹{selectedBooking.totalAmount?.toLocaleString("en-IN")}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between pl-[22px]">
                                            <span className="text-[12px] text-[#4B5563]">Advance Paid</span>
                                            <span className="text-[13px] font-bold text-green-600">₹{(selectedBooking.advancePayment || 0).toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between pl-[22px] pt-1 border-t border-gray-200">
                                            <span className="text-[12px] font-bold text-[#4B5563]">Balance Due</span>
                                            <span className="text-[13px] font-bold text-orange-600">₹{(selectedBooking.balancePayment ?? (selectedBooking.totalAmount - (selectedBooking.advancePayment || 0))).toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Booking Modal ────────────────────────────── */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-[20px] font-playfair font-bold text-[#2B1512]">New Booking</h2>
                                <p className="text-[13px] text-[#8e8484] mt-1">Create a new event booking</p>
                            </div>
                            <button onClick={() => setShowAddForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                <X size={16} className="text-[#4B5563]" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            {addError && (
                                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] px-4 py-3 rounded-xl text-[13px] font-medium">{addError}</div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Branch *</label>
                                    <select value={branchId} onChange={e => { setBranchId(e.target.value); setHallId(""); }} disabled={branches.length === 1}
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium appearance-none disabled:opacity-75">
                                        <option value="">Select branch</option>
                                        {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Hall *</label>
                                    <select value={hallId} onChange={e => setHallId(e.target.value)} disabled={!selectedBranch}
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium appearance-none disabled:opacity-75">
                                        <option value="">Select hall</option>
                                        {(selectedBranch?.halls || []).map(h => <option key={h._id} value={h._id}>{h.name} ({h.capacity} pax)</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Customer Name *</label>
                                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter customer name"
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Date *</label>
                                    <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Start *</label>
                                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">End *</label>
                                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Guests *</label>
                                    <input type="number" min="1" value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="0"
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Total (₹) *</label>
                                    <input type="number" min="0" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0"
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Advance (₹)</label>
                                    <input type="number" min="0" value={advancePayment} onChange={e => setAdvancePayment(e.target.value)} placeholder="0"
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium appearance-none">
                                    <option>Tentative</option>
                                    <option>Confirmed</option>
                                    <option>Cancelled</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddForm(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-[#4B5563] rounded-xl text-[13px] font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2B1512] text-white rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors disabled:opacity-60">
                                    {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={15} />}
                                    {submitting ? "Saving..." : "Create Booking"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
