"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
interface RevenueData { summary: { totalRevenue: number; totalPaid: number; totalOutstanding: number; invoiceCount: number } }
interface Booking { _id: string; totalAmount?: number; advancePaid?: number; status: string; }
export default function FmReportsPage() {
    const [revenue, setRevenue] = useState<RevenueData["summary"] | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const [rv, bk] = await Promise.all([apiGet<RevenueData>("/reports/revenue"), apiGet<Booking[]>("/bookings")]); if (rv.success && rv.data) setRevenue(rv.data.summary); if (bk.success && bk.data) setBookings(bk.data); setLoading(false); } load(); }, []);
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Financial Reports</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">Revenue and collection analysis</p></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[{ label: "Revenue", value: `₹${(revenue?.totalRevenue || 0).toLocaleString("en-IN")}` }, { label: "Collected", value: `₹${(revenue?.totalPaid || 0).toLocaleString("en-IN")}` }, { label: "Outstanding", value: `₹${(revenue?.totalOutstanding || 0).toLocaleString("en-IN")}` }, { label: "Bookings", value: String(bookings.length) }].map((m, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p><span className="text-[28px] font-bold tracking-tight text-[#2B1512] mt-2 block">{m.value}</span></div>
                ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[18px] font-playfair font-bold text-[#2B1512] mb-4">Payment Status</h2>
                <div className="space-y-3">
                    {[{ label: "Confirmed", count: bookings.filter(b => b.status === "Confirmed").length, color: "bg-[#10B981]" }, { label: "Tentative", count: bookings.filter(b => b.status === "Tentative").length, color: "bg-[#F59E0B]" }, { label: "Cancelled", count: bookings.filter(b => b.status === "Cancelled").length, color: "bg-[#EF4444]" }].map((s, i) => {
                        const pct = bookings.length > 0 ? Math.round((s.count / bookings.length) * 100) : 0; return (
                            <div key={i}><div className="flex justify-between text-[13px] font-bold text-[#2B1512] mb-1"><span>{s.label}</span><span>{s.count} ({pct}%)</span></div><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${s.color} rounded-full`} style={{ width: `${pct}%` }}></div></div></div>
                        );
                    })}
                </div>
            </div>
        </div></div>
    );
}
