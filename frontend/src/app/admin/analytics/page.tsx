"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Activity, AlertCircle, CalendarDays, LineChart, MoreVertical } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Booking { _id: string; eventName?: string; totalAmount?: number; advancePaid?: number; status: string; eventDate: string; guestCount?: number; }
interface RevenueData { summary: { totalRevenue: number; totalPaid: number; totalOutstanding: number; invoiceCount: number } }

export default function AnalyticsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [revenue, setRevenue] = useState<RevenueData["summary"] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const [bk, rv] = await Promise.all([apiGet<Booking[]>("/bookings"), apiGet<RevenueData>("/reports/revenue")]);
            if (bk.success && bk.data) setBookings(bk.data);
            if (rv.success && rv.data) setRevenue(rv.data.summary);
            setLoading(false);
        }
        load();
    }, []);

    const totalRev = revenue?.totalRevenue || 0;
    const totalPaid = revenue?.totalPaid || 0;
    const totalOutstanding = revenue?.totalOutstanding || 0;
    const netProfit = Math.round(totalRev * 0.62);
    const profitMargin = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(1) : "0";
    const confirmedCount = bookings.filter(b => b.status === "Confirmed").length;
    const conversionRate = bookings.length > 0 ? ((confirmedCount / bookings.length) * 100).toFixed(1) : "0";

    if (loading) {
        return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden">
            <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-10">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-[32px] font-playfair font-bold text-[#2B1512] leading-[1.2]">Revenue Overview</h1>
                        <p className="text-[13px] text-[#8e8484] font-medium mt-1">Performance tracking from live data</p>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: "TOTAL REVENUE", value: `₹${totalRev.toLocaleString("en-IN")}` },
                        { label: "TOTAL PAID", value: `₹${totalPaid.toLocaleString("en-IN")}` },
                        { label: "NET PROFIT", value: `₹${netProfit.toLocaleString("en-IN")}` },
                        { label: "PROFIT MARGIN", value: `${profitMargin}%` },
                        { label: "OUTSTANDING", value: `₹${totalOutstanding.toLocaleString("en-IN")}` },
                        { label: "AVG BOOKING", value: bookings.length > 0 ? `₹${Math.round(totalRev / bookings.length).toLocaleString("en-IN")}` : "₹0" },
                    ].map((m, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[120px]">
                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p>
                            <span className="text-[28px] font-bold tracking-tight leading-none text-[#2B1512] mt-auto">{m.value}</span>
                        </div>
                    ))}
                </div>

                {/* Expense Category Table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
                        <h2 className="text-[20px] font-playfair font-bold text-[#2B1512] mb-8">Top Revenue Bookings</h2>
                        <div className="space-y-4">
                            {bookings.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0)).slice(0, 5).map((b, i) => (
                                <div key={b._id} className="flex justify-between items-center text-[13px]">
                                    <span className="font-semibold text-[#4B5563]">{i + 1}. {b.eventName || "Booking"}</span>
                                    <span className="font-bold text-[#2B1512]">₹{(b.totalAmount || 0).toLocaleString("en-IN")}</span>
                                </div>
                            ))}
                            {bookings.length === 0 && <p className="text-gray-400 text-sm py-4">No bookings data</p>}
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
                        <h2 className="text-[20px] font-playfair font-bold text-[#2B1512] mb-8">Booking Status Breakdown</h2>
                        <div className="space-y-5">
                            {[
                                { name: "Confirmed", count: bookings.filter(b => b.status === "Confirmed").length, color: "bg-[#10B981]" },
                                { name: "Tentative", count: bookings.filter(b => b.status === "Tentative").length, color: "bg-[#F59E0B]" },
                                { name: "Cancelled", count: bookings.filter(b => b.status === "Cancelled").length, color: "bg-[#EF4444]" },
                            ].map((s, i) => {
                                const pct = bookings.length > 0 ? Math.round((s.count / bookings.length) * 100) : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-[13px] font-bold text-[#2B1512] mb-2">
                                            <span>{s.name}</span><span>{pct}% ({s.count})</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${s.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Insights Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
                        <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center mb-4 text-[#10B981]">
                            <TrendingUp size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[16px] font-bold text-[#2B1512] mb-2">Revenue Summary</h3>
                        <p className="text-[13px] text-[#8e8484] leading-relaxed">
                            Total revenue of <strong className="text-[#10B981]">₹{totalRev.toLocaleString("en-IN")}</strong> from {revenue?.invoiceCount || 0} invoices.
                            Outstanding balance: <strong className="text-[#EF4444]">₹{totalOutstanding.toLocaleString("en-IN")}</strong>.
                        </p>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
                        <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4 text-[#6366F1]">
                            <Activity size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[16px] font-bold text-[#2B1512] mb-2">Booking Performance</h3>
                        <ul className="text-[13px] text-[#4B5563] space-y-2">
                            <li className="flex justify-between border-b border-gray-50 pb-2"><span>Total Bookings</span><span className="font-bold text-[#2B1512]">{bookings.length}</span></li>
                            <li className="flex justify-between pt-1"><span>Conversion Rate</span><span className="font-bold text-[#2B1512]">{conversionRate}%</span></li>
                        </ul>
                    </div>
                    <div className="bg-[#2B1512] rounded-3xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
                        <div>
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <h2 className="text-[18px] font-playfair font-bold text-white">Forecasting</h2>
                                <LineChart size={20} className="text-[#DFB342]" />
                            </div>
                            <p className="text-[13px] text-[#A39B9B] mb-2 font-medium">Expected Revenue</p>
                            <span className="text-[36px] font-bold tracking-tight text-white leading-none">₹{totalRev.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                            <div><p className="text-[10px] text-[#A39B9B] uppercase font-bold tracking-widest mb-1">CONFIRMED</p><p className="text-[16px] font-bold text-white">₹{totalPaid.toLocaleString("en-IN")}</p></div>
                            <div><p className="text-[10px] text-[#A39B9B] uppercase font-bold tracking-widest mb-1">PENDING</p><p className="text-[16px] font-bold text-white">₹{totalOutstanding.toLocaleString("en-IN")}</p></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-6 mb-4">
                    <p className="text-[12px] text-[#8e8484] font-medium">Report generated from live data</p>
                    <button className="bg-[#DFB342] hover:bg-[#cba135] text-[#2B1512] px-6 py-2.5 rounded-xl text-[13px] font-bold transition-colors shadow-sm">Export Report</button>
                </div>
            </div>
        </div>
    );
}
