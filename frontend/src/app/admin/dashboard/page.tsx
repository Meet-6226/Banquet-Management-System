"use client";

import { useState, useEffect } from "react";
import { Wallet, Calendar, AlertCircle, TrendingUp, MoreVertical } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiGet } from "@/lib/api";

interface Booking {
    _id: string;
    eventName?: string;
    eventDate: string;
    customerId?: { name: string; email: string };
    status: string;
    totalAmount?: number;
}

interface RevenueSummary {
    totalRevenue: number;
    invoiceCount: number;
    totalOutstanding: number;
    totalPaid: number;
}

export default function DashboardOverview() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [bookingsRes, revenueRes] = await Promise.all([
                apiGet<Booking[]>("/bookings"),
                apiGet<{ summary: RevenueSummary }>("/reports/revenue"),
            ]);
            if (bookingsRes.success && bookingsRes.data) setBookings(bookingsRes.data);
            if (revenueRes.success && revenueRes.data) setRevenue(revenueRes.data.summary);
            setLoading(false);
        }
        fetchData();
    }, []);

    const confirmedCount = bookings.filter((b) => b.status === "Confirmed").length;
    const pendingCount = bookings.filter((b) => b.status === "Tentative" || b.status === "Pending").length;
    const recentBookings = bookings.slice(0, 5);

    const metrics = [
        {
            title: "Total Revenue",
            value: revenue ? `₹${revenue.totalRevenue.toLocaleString("en-IN")}` : "₹0",
            change: revenue ? `${revenue.invoiceCount} invoices` : "",
            isPositive: true,
            icon: Wallet,
        },
        {
            title: "Upcoming Bookings",
            value: String(bookings.length),
            change: `+${confirmedCount} confirmed`,
            isPositive: true,
            icon: Calendar,
        },
        {
            title: "Pending Enquiries",
            value: String(pendingCount),
            change: pendingCount > 0 ? "Needs attention" : "All clear",
            isPositive: pendingCount === 0,
            icon: AlertCircle,
        },
        {
            title: "Outstanding",
            value: revenue ? `₹${revenue.totalOutstanding.toLocaleString("en-IN")}` : "₹0",
            change: revenue ? `₹${revenue.totalPaid.toLocaleString("en-IN")} collected` : "",
            isPositive: true,
            icon: TrendingUp,
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-sm text-gray-500">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-full max-w-[1440px] mx-auto space-y-8">
                <div>
                    <h2 className="text-[32px] font-playfair font-semibold text-[#1A1A1A]">Dashboard Overview</h2>
                    <p className="text-gray-500 mt-1">Welcome back. Here is what is happening today.</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric, i) => (
                        <MetricCard
                            key={i}
                            title={metric.title}
                            value={metric.value}
                            icon={<metric.icon size={20} />}
                        />
                    ))}
                </div>

                {/* Recent Bookings Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-[#1A1A1A]">Recent Bookings</h3>
                        <button className="text-sm text-[#CBA135] font-medium hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No bookings yet</td>
                                    </tr>
                                ) : (
                                    recentBookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-[#1A1A1A]">{booking.eventName || "Booking"}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{booking._id.slice(-6).toUpperCase()}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(booking.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#1A1A1A] font-medium">
                                                {booking.customerId?.name || "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={booking.status} />
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-[#1A1A1A]">
                                                {booking.totalAmount ? `₹${booking.totalAmount.toLocaleString("en-IN")}` : "—"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
