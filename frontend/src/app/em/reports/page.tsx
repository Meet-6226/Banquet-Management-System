"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
interface Booking { _id: string; totalAmount?: number; advancePaid?: number; status: string; guestCount?: number; }
export default function EmReportsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const res = await apiGet<Booking[]>("/bookings"); if (res.success && res.data) setBookings(res.data); setLoading(false); } load(); }, []);
    const totalRev = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const totalGuests = bookings.reduce((s, b) => s + (b.guestCount || 0), 0);
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Reports</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">Event performance reports</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[{ label: "Total Revenue", value: `₹${totalRev.toLocaleString("en-IN")}` }, { label: "Total Bookings", value: String(bookings.length) }, { label: "Total Guests", value: String(totalGuests) }].map((m, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p><span className="text-[28px] font-bold tracking-tight text-[#2B1512] mt-2 block">{m.value}</span></div>
                ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[18px] font-playfair font-bold text-[#2B1512] mb-4">Status Breakdown</h2>
                <div className="space-y-3">
                    {["Confirmed", "Tentative", "Cancelled"].map(s => {
                        const c = bookings.filter(b => b.status === s).length; const pct = bookings.length > 0 ? Math.round((c / bookings.length) * 100) : 0; const clr = s === "Confirmed" ? "bg-[#10B981]" : s === "Tentative" ? "bg-[#F59E0B]" : "bg-[#EF4444]"; return (
                            <div key={s}><div className="flex justify-between text-[13px] font-bold text-[#2B1512] mb-1"><span>{s}</span><span>{c} ({pct}%)</span></div><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${clr} rounded-full`} style={{ width: `${pct}%` }}></div></div></div>
                        );
                    })}
                </div>
            </div>
        </div></div>
    );
}
