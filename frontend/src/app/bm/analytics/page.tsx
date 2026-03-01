"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

interface Booking { _id: string; totalAmount?: number; advancePaid?: number; status: string; }

export default function BmAnalyticsPage() {
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

    const totalRev = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const totalPaid = bookings.reduce((s, b) => s + (b.advancePaid || 0), 0);
    const outstanding = totalRev - totalPaid;
    const confirmed = bookings.filter(b => b.status === "Confirmed").length;

    if (loading) {
        return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden">
            <div className="w-full max-w-[1440px]">
                <div className="mb-8">
                    <h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Branch Analytics</h1>
                    <p className="text-[13px] text-[#8e8484] font-medium mt-1">Performance overview for your branch</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "TOTAL REVENUE", value: `₹${totalRev.toLocaleString("en-IN")}` },
                        { label: "AMOUNT RECEIVED", value: `₹${totalPaid.toLocaleString("en-IN")}` },
                        { label: "OUTSTANDING", value: `₹${outstanding.toLocaleString("en-IN")}` },
                        { label: "CONFIRMED", value: String(confirmed) },
                    ].map((m, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p>
                            <span className="text-[28px] font-bold tracking-tight text-[#2B1512] mt-2">{m.value}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-[18px] font-playfair font-bold text-[#2B1512] mb-6">Booking Status</h2>
                        <div className="space-y-4">
                            {[
                                { name: "Confirmed", count: bookings.filter(b => b.status === "Confirmed").length, color: "bg-[#10B981]" },
                                { name: "Tentative", count: bookings.filter(b => b.status === "Tentative").length, color: "bg-[#F59E0B]" },
                                { name: "Cancelled", count: bookings.filter(b => b.status === "Cancelled").length, color: "bg-[#EF4444]" },
                            ].map((s, i) => {
                                const pct = bookings.length > 0 ? Math.round((s.count / bookings.length) * 100) : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-[13px] font-bold text-[#2B1512] mb-1"><span>{s.name}</span><span>{s.count} ({pct}%)</span></div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${s.color} rounded-full`} style={{ width: `${pct}%` }}></div></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-[18px] font-playfair font-bold text-[#2B1512] mb-6">Top Bookings by Revenue</h2>
                        <div className="space-y-3">
                            {bookings.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0)).slice(0, 5).map((b, i) => (
                                <div key={b._id} className="flex justify-between text-[13px] py-2 border-b border-gray-50">
                                    <span className="text-[#4B5563]">{i + 1}. Booking</span>
                                    <span className="font-bold text-[#2B1512]">₹{(b.totalAmount || 0).toLocaleString("en-IN")}</span>
                                </div>
                            ))}
                            {bookings.length === 0 && <p className="text-sm text-gray-400">No bookings</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
