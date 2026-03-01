"use client";

import { useState, useEffect } from "react";
import { MoreVertical, AlertTriangle, BarChart2 } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Booking {
    _id: string;
    eventName?: string;
    eventDate: string;
    customerId?: { name: string };
    branchId?: { name: string };
    hallId?: string;
    status: string;
    totalAmount?: number;
    advancePaid?: number;
    guestCount?: number;
}

export default function GlobalBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await apiGet<Booking[]>("/bookings");
            if (res.success && res.data) setBookings(res.data);
            setLoading(false);
        }
        load();
    }, []);

    const totalBookings = bookings.length;
    const pendingPayments = bookings.reduce((s, b) => s + ((b.totalAmount || 0) - (b.advancePaid || 0)), 0);
    const cancelledCount = bookings.filter(b => b.status === "Cancelled").length;
    const cancellationRate = totalBookings > 0 ? ((cancelledCount / totalBookings) * 100).toFixed(1) : "0";
    const avgBookingValue = totalBookings > 0 ? Math.round(bookings.reduce((s, b) => s + (b.totalAmount || 0), 0) / totalBookings) : 0;

    if (loading) {
        return (
            <div className="flex flex-col w-full min-h-full bg-[#F5F3ED] p-10 items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F5F3ED] p-10 overflow-x-hidden">
            <div className="mb-8 w-full max-w-[1440px]">
                <h1 className="text-[32px] font-playfair font-bold text-[#2B1512] leading-[1.2]">Global Bookings Overview</h1>
                <p className="text-[13px] text-[#8e8484] font-semibold tracking-wide mt-1">Real-time performance metrics and event status</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full max-w-[1440px]">
                {[
                    { label: "Total Bookings", value: String(totalBookings) },
                    { label: "Pending Payments", value: `₹${pendingPayments.toLocaleString("en-IN")}` },
                    { label: "Cancellation Rate", value: `${cancellationRate}%` },
                    { label: "Avg Booking Value", value: `₹${avgBookingValue.toLocaleString("en-IN")}` },
                ].map((c, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 flex flex-col justify-between">
                        <p className="text-[11px] font-bold text-[#8e8484] uppercase tracking-wider mb-2">{c.label}</p>
                        <span className="text-[32px] font-bold text-[#1A1A1A] leading-none mb-2">{c.value}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col w-full flex-1 max-w-[1440px] mb-8">
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left" style={{ borderSpacing: '0' }}>
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-6 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest w-[22%]">Event & Client</th>
                                    <th className="px-4 py-6 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Date</th>
                                    <th className="px-4 py-6 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Revenue</th>
                                    <th className="px-4 py-6 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Balance</th>
                                    <th className="px-4 py-6 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Status</th>
                                    <th className="pr-6 py-6 w-[40px]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No bookings found</td></tr>
                                ) : bookings.map((b) => {
                                    const balance = (b.totalAmount || 0) - (b.advancePaid || 0);
                                    const statusStyle = b.status === "Confirmed" ? "bg-[#2B1512] text-white" : b.status === "Cancelled" ? "bg-[#FEE2E2] text-[#B91C1C]" : "bg-[#FEF9C3] text-[#A16207]";
                                    return (
                                        <tr key={b._id} className="group">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-[#1A1A1A] text-[14px]">{b.eventName || "Booking"}</p>
                                                <p className="text-[12px] font-medium text-[#8e8484] mt-0.5">{b.customerId?.name || "—"}</p>
                                            </td>
                                            <td className="px-4 py-5">
                                                <p className="font-bold text-[#1A1A1A] text-[13px]">{new Date(b.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <p className="font-bold text-[#1A1A1A] text-[14px]">₹{(b.totalAmount || 0).toLocaleString("en-IN")}</p>
                                                <p className="text-[11px] text-[#CBA135] font-bold mt-0.5">Adv: ₹{(b.advancePaid || 0).toLocaleString("en-IN")}</p>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <p className={`font-bold text-[14px] ${balance > 0 ? "text-[#EF4444]" : "text-[#D1D5DB]"}`}>
                                                    ₹{balance.toLocaleString("en-IN")}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-block px-3 py-[2px] rounded-full text-[10px] font-bold tracking-wider ${statusStyle}`}>{b.status}</span>
                                            </td>
                                            <td className="pr-6 py-5 text-right align-middle">
                                                <button className="text-gray-300 hover:text-gray-600 transition-colors p-1"><MoreVertical size={20} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8 max-w-[1440px]">
                <div className="bg-[#2B1512] rounded-xl p-8 text-white relative shadow-lg">
                    <h2 className="flex items-center gap-2 font-playfair text-[22px] font-bold mb-7">
                        <BarChart2 className="text-[#CBA135]" size={22} /> Owner Insights
                    </h2>
                    <div className="space-y-7">
                        <div>
                            <p className="text-[9px] text-[#8e8484] font-bold tracking-[0.15em] uppercase mb-1.5">Highest Revenue Event</p>
                            <p className="font-bold text-[14px] mb-1">{bookings.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))[0]?.eventName || "—"}</p>
                            <p className="text-[#e6b96b] text-[24px] font-bold tracking-tight">₹{(bookings[0]?.totalAmount || 0).toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-[#8e8484] font-bold tracking-[0.15em] uppercase mb-1.5">Total Bookings</p>
                            <span className="text-[28px] font-bold tracking-tight">{totalBookings}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#FEF2F2] rounded-xl p-6 border border-[#FCA5A5] shadow-sm flex flex-col">
                    <h3 className="flex items-center gap-2 text-[#DC2626] font-bold text-xs tracking-wider uppercase mb-4">
                        <AlertTriangle size={16} /> Overdue Payments
                    </h3>
                    <div className="space-y-3">
                        {bookings.filter(b => (b.totalAmount || 0) - (b.advancePaid || 0) > 0).slice(0, 3).map(b => (
                            <div key={b._id} className="bg-white p-3 rounded-lg border border-[#FECACA] flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-[#111827] text-sm">{b.customerId?.name || b.eventName || "—"}</p>
                                    <p className="text-xs text-[#9CA3AF] mt-0.5">{b.eventName}</p>
                                </div>
                                <span className="text-[#DC2626] font-bold text-sm">₹{((b.totalAmount || 0) - (b.advancePaid || 0)).toLocaleString("en-IN")}</span>
                            </div>
                        ))}
                        {bookings.filter(b => (b.totalAmount || 0) - (b.advancePaid || 0) > 0).length === 0 && (
                            <p className="text-sm text-gray-400 py-4">No overdue payments ✓</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
