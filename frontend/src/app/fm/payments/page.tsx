"use client";
import { useState, useEffect } from "react";
import { Plus, X, IndianRupee } from "lucide-react";
import { apiGet, apiPut } from "@/lib/api";

interface Booking { _id: string; customerId?: { name: string }; totalAmount?: number; advancePayment?: number; eventDate?: string; branchId?: { name: string }; status?: string; }

export default function FmPaymentsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState("");
    const [amount, setAmount] = useState("");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function loadBookings() {
        setLoading(true);
        const res = await apiGet<Booking[]>("/bookings");
        if (res.success && res.data) setBookings(res.data);
        setLoading(false);
    }

    useEffect(() => { loadBookings(); }, []);

    const totalPaid = bookings.reduce((s, b) => s + (b.advancePayment || 0), 0);
    const totalDue = bookings.reduce((s, b) => s + ((b.totalAmount || 0) - (b.advancePayment || 0)), 0);

    const unpaidBookings = bookings.filter(b => (b.totalAmount || 0) - (b.advancePayment || 0) > 0);

    function openForm() {
        setSelectedBooking("");
        setAmount("");
        setFormError("");
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError("");
        if (!selectedBooking) return setFormError("Please select a booking.");
        const payAmount = parseFloat(amount);
        if (!payAmount || payAmount <= 0) return setFormError("Enter a valid amount.");

        const booking = bookings.find(b => b._id === selectedBooking);
        if (!booking) return setFormError("Booking not found.");

        const due = (booking.totalAmount || 0) - (booking.advancePayment || 0);
        if (payAmount > due) return setFormError(`Amount exceeds due balance of ₹${due.toLocaleString("en-IN")}.`);

        setSubmitting(true);
        const newAdvance = (booking.advancePayment || 0) + payAmount;
        const res = await apiPut(`/bookings/${selectedBooking}`, { advancePayment: newAdvance });
        setSubmitting(false);

        if (res.success) {
            setShowForm(false);
            loadBookings();
        } else {
            setFormError(res.error || "Failed to record payment.");
        }
    }

    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Payments</h1>
                    <p className="text-[13px] text-[#8e8484] font-medium mt-1">Track all payment transactions</p>
                </div>
                <button onClick={openForm} className="flex items-center gap-2 bg-[#2B1512] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors shadow-sm">
                    <Plus size={16} /> Record Payment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[{ label: "Total Received", value: `₹${totalPaid.toLocaleString("en-IN")}` }, { label: "Total Due", value: `₹${totalDue.toLocaleString("en-IN")}` }, { label: "Transactions", value: String(bookings.length) }].map((m, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p><span className="text-[28px] font-bold tracking-tight text-[#2B1512] mt-2 block">{m.value}</span></div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"><div className="overflow-x-auto">
                <table className="w-full text-left"><thead><tr className="border-b border-gray-100">
                    <th className="px-6 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Client</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Total</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Paid</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Due</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Status</th>
                </tr></thead><tbody className="divide-y divide-gray-100">
                        {bookings.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No payments</td></tr> : bookings.map(b => {
                            const due = (b.totalAmount || 0) - (b.advancePayment || 0); return (
                                <tr key={b._id} className="hover:bg-[#FDFBF9]">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-[#2B1512] text-[14px]">{b.customerId?.name || "Booking"}</p>
                                        <p className="text-[11px] text-[#8e8484] mt-0.5">{b.eventDate ? new Date(b.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}</p>
                                    </td>
                                    <td className="px-4 py-4 text-center font-bold text-[13px]">₹{(b.totalAmount || 0).toLocaleString("en-IN")}</td>
                                    <td className="px-4 py-4 text-center font-bold text-[13px] text-[#10B981]">₹{(b.advancePayment || 0).toLocaleString("en-IN")}</td>
                                    <td className="px-4 py-4 text-center font-bold text-[13px]"><span className={due > 0 ? "text-[#DC2626]" : "text-[#10B981]"}>₹{due.toLocaleString("en-IN")}</span></td>
                                    <td className="px-4 py-4"><span className={`px-3 py-[3px] rounded-full text-[10px] font-bold ${due === 0 ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FFEDD5] text-[#C2410C]"}`}>{due === 0 ? "PAID" : "PARTIAL"}</span></td>
                                </tr>
                            );
                        })}
                    </tbody></table>
            </div></div>
        </div>

        {/* ── Record Payment Modal ──────────────────────────────── */}
        {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="bg-[#2B1512] px-6 py-5 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">Finance</p>
                            <h2 className="text-[20px] font-playfair font-bold text-white">Record Payment</h2>
                        </div>
                        <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <X size={15} className="text-white" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {formError && (
                            <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] px-4 py-3 rounded-xl text-[13px] font-medium">{formError}</div>
                        )}

                        <div>
                            <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Select Booking *</label>
                            <select value={selectedBooking} onChange={e => {
                                setSelectedBooking(e.target.value);
                                setAmount("");
                            }} className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium appearance-none">
                                <option value="">Choose a booking...</option>
                                {unpaidBookings.map(b => {
                                    const due = (b.totalAmount || 0) - (b.advancePayment || 0);
                                    return (
                                        <option key={b._id} value={b._id}>
                                            {b.customerId?.name || "Booking"} — Due: ₹{due.toLocaleString("en-IN")}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {selectedBooking && (() => {
                            const bk = bookings.find(b => b._id === selectedBooking);
                            if (!bk) return null;
                            const due = (bk.totalAmount || 0) - (bk.advancePayment || 0);
                            return (
                                <div className="bg-[#FAFAF8] rounded-xl p-4 border border-gray-100">
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div><p className="text-[9px] font-bold text-[#8e8484] uppercase tracking-widest">Total</p><p className="font-bold text-[15px] text-[#2B1512] mt-1">₹{(bk.totalAmount || 0).toLocaleString("en-IN")}</p></div>
                                        <div><p className="text-[9px] font-bold text-[#8e8484] uppercase tracking-widest">Paid</p><p className="font-bold text-[15px] text-[#10B981] mt-1">₹{(bk.advancePayment || 0).toLocaleString("en-IN")}</p></div>
                                        <div><p className="text-[9px] font-bold text-[#8e8484] uppercase tracking-widest">Due</p><p className="font-bold text-[15px] text-[#DC2626] mt-1">₹{due.toLocaleString("en-IN")}</p></div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div>
                            <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Payment Amount (₹) *</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8484]"><IndianRupee size={14} /></div>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" min="1"
                                    className="w-full pl-10 pr-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-bold" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowForm(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-[#4B5563] rounded-xl text-[13px] font-bold hover:bg-gray-200 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2B1512] text-white rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors disabled:opacity-50">
                                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><IndianRupee size={14} /> Record Payment</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </div>
    );
}
