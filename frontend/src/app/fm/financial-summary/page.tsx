"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
interface RevenueData { summary: { totalRevenue: number; totalPaid: number; totalOutstanding: number; invoiceCount: number } }
interface Booking { _id: string; totalAmount?: number; advancePaid?: number; status: string; }
export default function FmFinancialSummaryPage() {
    const [revenue, setRevenue] = useState<RevenueData["summary"] | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const [rv, bk] = await Promise.all([apiGet<RevenueData>("/reports/revenue"), apiGet<Booking[]>("/bookings")]); if (rv.success && rv.data) setRevenue(rv.data.summary); if (bk.success && bk.data) setBookings(bk.data); setLoading(false); } load(); }, []);
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    const totalRev = revenue?.totalRevenue || 0;
    const totalPaid = revenue?.totalPaid || 0;
    const outstanding = revenue?.totalOutstanding || 0;
    const collectionRate = totalRev > 0 ? ((totalPaid / totalRev) * 100).toFixed(1) : "0";
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Financial Summary</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">Complete financial overview</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[{ label: "Total Revenue", value: `₹${totalRev.toLocaleString("en-IN")}` }, { label: "Collected", value: `₹${totalPaid.toLocaleString("en-IN")}` }, { label: "Outstanding", value: `₹${outstanding.toLocaleString("en-IN")}` }, { label: "Collection Rate", value: `${collectionRate}%` }].map((m, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p><span className="text-[28px] font-bold tracking-tight text-[#2B1512] mt-2 block">{m.value}</span></div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-[18px] font-playfair font-bold text-[#2B1512] mb-4">Revenue vs Collections</h2>
                    <div className="space-y-4">
                        <div><div className="flex justify-between text-[13px] font-bold text-[#2B1512] mb-1"><span>Revenue</span><span>₹{totalRev.toLocaleString("en-IN")}</span></div><div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#CBA135] rounded-full" style={{ width: "100%" }}></div></div></div>
                        <div><div className="flex justify-between text-[13px] font-bold text-[#2B1512] mb-1"><span>Collected</span><span>₹{totalPaid.toLocaleString("en-IN")}</span></div><div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#10B981] rounded-full" style={{ width: `${collectionRate}%` }}></div></div></div>
                        <div><div className="flex justify-between text-[13px] font-bold text-[#2B1512] mb-1"><span>Outstanding</span><span>₹{outstanding.toLocaleString("en-IN")}</span></div><div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#EF4444] rounded-full" style={{ width: `${totalRev > 0 ? (outstanding / totalRev) * 100 : 0}%` }}></div></div></div>
                    </div>
                </div>
                <div className="bg-[#2B1512] rounded-2xl p-6 text-white flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-[#A39B9B] uppercase tracking-widest mb-2">Collection Rate</p>
                    <div className="text-[56px] font-bold tracking-tight leading-none">{collectionRate}%</div>
                    <p className="text-[#A39B9B] text-[13px] mt-3">{revenue?.invoiceCount || 0} invoices processed</p>
                    <div className="mt-6 w-full h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#DFB342] rounded-full" style={{ width: `${collectionRate}%` }}></div></div>
                </div>
            </div>
        </div></div>
    );
}
