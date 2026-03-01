"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
interface Booking { _id: string; eventName?: string; customerId?: { name: string }; totalAmount?: number; advancePaid?: number; }
export default function FmPaymentsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const res = await apiGet<Booking[]>("/bookings"); if (res.success && res.data) setBookings(res.data); setLoading(false); } load(); }, []);
    const totalPaid = bookings.reduce((s, b) => s + (b.advancePaid || 0), 0);
    const totalDue = bookings.reduce((s, b) => s + ((b.totalAmount || 0) - (b.advancePaid || 0)), 0);
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Payments</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">Track all payment transactions</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[{ label: "Total Received", value: `₹${totalPaid.toLocaleString("en-IN")}` }, { label: "Total Due", value: `₹${totalDue.toLocaleString("en-IN")}` }, { label: "Transactions", value: String(bookings.length) }].map((m, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p><span className="text-[28px] font-bold tracking-tight text-[#2B1512] mt-2 block">{m.value}</span></div>
                ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"><div className="overflow-x-auto">
                <table className="w-full text-left"><thead><tr className="border-b border-gray-100">
                    <th className="px-6 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Event</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Total</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Paid</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Due</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Status</th>
                </tr></thead><tbody className="divide-y divide-gray-100">
                        {bookings.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No payments</td></tr> : bookings.map(b => {
                            const due = (b.totalAmount || 0) - (b.advancePaid || 0); return (
                                <tr key={b._id} className="hover:bg-[#FDFBF9]">
                                    <td className="px-6 py-4"><p className="font-bold text-[#2B1512] text-[14px]">{b.eventName || "Booking"}</p><p className="text-[12px] text-[#8e8484]">{b.customerId?.name || "—"}</p></td>
                                    <td className="px-4 py-4 text-center font-bold text-[13px]">₹{(b.totalAmount || 0).toLocaleString("en-IN")}</td>
                                    <td className="px-4 py-4 text-center font-bold text-[13px] text-[#10B981]">₹{(b.advancePaid || 0).toLocaleString("en-IN")}</td>
                                    <td className="px-4 py-4 text-center font-bold text-[13px]"><span className={due > 0 ? "text-[#DC2626]" : "text-[#10B981]"}>₹{due.toLocaleString("en-IN")}</span></td>
                                    <td className="px-4 py-4"><span className={`px-3 py-[3px] rounded-full text-[10px] font-bold ${due === 0 ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FFEDD5] text-[#C2410C]"}`}>{due === 0 ? "PAID" : "PARTIAL"}</span></td>
                                </tr>
                            );
                        })}
                    </tbody></table>
            </div></div>
        </div></div>
    );
}
