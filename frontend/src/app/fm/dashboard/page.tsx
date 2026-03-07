"use client";
import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { apiGet } from "@/lib/api";
interface RevenueData { summary: { totalRevenue: number; totalPaid: number; totalOutstanding: number; invoiceCount: number } }
interface Booking { _id: string; customerId?: { name: string }; totalAmount?: number; advancePayment?: number; status: string; }
export default function FmDashboardPage() {
    const [revenue, setRevenue] = useState<RevenueData["summary"] | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const [rv, bk] = await Promise.all([apiGet<RevenueData>("/reports/revenue"), apiGet<Booking[]>("/bookings")]); if (rv.success && rv.data) setRevenue(rv.data.summary); if (bk.success && bk.data) setBookings(bk.data); setLoading(false); } load(); }, []);
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    const totalRev = revenue?.totalRevenue || 0;
    const totalPaid = revenue?.totalPaid || 0;
    const outstanding = revenue?.totalOutstanding || 0;
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Finance Dashboard</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">Financial overview and key metrics</p></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[{ label: "Total Revenue", value: `₹${totalRev.toLocaleString("en-IN")}`, icon: DollarSign }, { label: "Collected", value: `₹${totalPaid.toLocaleString("en-IN")}`, icon: TrendingUp }, { label: "Outstanding", value: `₹${outstanding.toLocaleString("en-IN")}`, icon: AlertCircle }, { label: "Invoices", value: String(revenue?.invoiceCount || 0), icon: FileText }].map((m, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-[#FFF9F2] flex items-center justify-center text-[#CBA135]"><m.icon size={22} /></div><div><p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p><span className="text-[24px] font-bold tracking-tight text-[#2B1512]">{m.value}</span></div></div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-[18px] font-playfair font-bold text-[#2B1512] mb-4">Outstanding Payments</h2>
                    <div className="space-y-3">{bookings.filter(b => (b.totalAmount || 0) - (b.advancePayment || 0) > 0).length === 0 ? <p className="text-sm text-gray-400 py-4">All payments collected ✓</p> : bookings.filter(b => (b.totalAmount || 0) - (b.advancePayment || 0) > 0).map(b => (
                        <div key={b._id} className="flex justify-between items-center py-2 border-b border-gray-50"><p className="font-bold text-[13px] text-[#2B1512]">{b.customerId?.name || "Booking"}</p><span className="font-bold text-[#DC2626] text-[13px]">₹{((b.totalAmount || 0) - (b.advancePayment || 0)).toLocaleString("en-IN")}</span></div>
                    ))}</div>
                </div>
                <div className="bg-[#2B1512] rounded-2xl p-6 text-white">
                    <h2 className="text-[18px] font-playfair font-bold mb-4">Collection Rate</h2>
                    <div className="text-[48px] font-bold tracking-tight">{totalRev > 0 ? ((totalPaid / totalRev) * 100).toFixed(1) : 0}%</div>
                    <p className="text-[#A39B9B] text-[13px] mt-2">₹{totalPaid.toLocaleString("en-IN")} of ₹{totalRev.toLocaleString("en-IN")} collected</p>
                    <div className="mt-4 w-full h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#DFB342] rounded-full" style={{ width: `${totalRev > 0 ? (totalPaid / totalRev) * 100 : 0}%` }}></div></div>
                </div>
            </div>
        </div></div>
    );
}
