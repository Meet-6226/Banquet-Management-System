"use client";

import { useState, useEffect } from "react";
import { CreditCard, CalendarDays, AlertCircle, MapPin, CheckCircle2, XCircle, MoreHorizontal, Bell, Search } from "lucide-react";
import { MetricCard, SectionCard, SectionHeader, StatusBadge } from "@/components/shared";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Booking {
    _id: string;
    eventName?: string;
    eventDate: string;
    customerId?: { name: string; email: string };
    branchId?: { name: string };
    hallId?: string;
    status: string;
    totalAmount?: number;
    guestCount?: number;
    timeSlot?: { start: string; end: string };
}

interface InventoryItem {
    _id: string;
    name: string;
    quantity: number;
    threshold: number;
    belowThreshold: boolean;
    unit: string;
}

export default function BmDashboardPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [bookingsRes, inventoryRes] = await Promise.all([
                apiGet<Booking[]>("/bookings"),
                apiGet<InventoryItem[]>("/inventory"),
            ]);
            if (bookingsRes.success && bookingsRes.data) setBookings(bookingsRes.data);
            if (inventoryRes.success && inventoryRes.data) setInventory(inventoryRes.data);
            setLoading(false);
        }
        fetchData();
    }, []);

    const confirmedBookings = bookings.filter((b) => b.status === "Confirmed");
    const pendingBookings = bookings.filter((b) => b.status === "Tentative" || b.status === "Pending");
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const lowStockItems = inventory.filter((i) => i.belowThreshold);
    const recentBookings = bookings.slice(0, 3);

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    if (loading) {
        return (
            <div className="flex flex-col w-full min-h-full bg-[#F5F3ED] items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#DFB342] border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-sm text-[#8e8484]">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F5F3ED] overflow-x-hidden">

            {/* TopNav */}
            <header className="h-[68px] px-8 flex flex-shrink-0 items-center justify-between bg-[#F5F3ED] sticky top-0 z-10 border-b border-black/5">
                <h1 className="text-[22px] font-playfair font-bold text-[#2B1512]">Manager Dashboard</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8484]" size={14} strokeWidth={2.5} />
                        <input type="text" placeholder="Search events, bookings, or stock..." className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[12px] w-[260px] focus:outline-none focus:ring-1 focus:ring-[#DFB342] font-medium text-[#2B1512] placeholder:text-[#a39b9b]" />
                    </div>
                    <button className="relative w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#a39b9b] hover:text-[#2B1512] shadow-sm">
                        <Bell size={16} strokeWidth={2.5} />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#EF4444] rounded-full"></span>
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#2B1512] flex items-center justify-center">
                            <span className="text-[11px] font-bold text-white">{initials}</span>
                        </div>
                        <div>
                            <div className="text-[13px] font-bold text-[#2B1512] leading-tight">{user?.name || "Manager"}</div>
                            <div className="text-[9px] font-bold text-[#DFB342] uppercase tracking-widest">{user?.role?.replace("_", " ") || "BRANCH MANAGER"}</div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-8 py-6 flex flex-col gap-6">

                {/* Metric Cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <MetricCard
                        label="Total Revenue" icon={CreditCard}
                        value={`₹${totalRevenue.toLocaleString("en-IN")}`}
                    />
                    <MetricCard
                        label="Upcoming Bookings" icon={CalendarDays}
                        value={String(bookings.length)}
                    />
                    <MetricCard
                        label="Pending Reviews" icon={AlertCircle}
                        value={String(pendingBookings.length)}
                    />
                    <MetricCard
                        label="Low Stock Alerts" icon={MapPin}
                        value={String(lowStockItems.length)}
                    />
                </div>

                {/* Booking Management */}
                <SectionCard noPadding>
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
                        <SectionHeader title="Booking Management" subtitle="Recent Bookings" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    {["EVENT", "CLIENT", "DATE", "STATUS", "ACTIONS"].map((h, i) => (
                                        <th key={h} className={`py-3.5 text-[9px] font-bold text-[#a39b9b] uppercase tracking-widest ${i === 0 || i === 4 ? "px-6" : "px-4"} ${i === 4 ? "text-right" : ""}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentBookings.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-[#a39b9b] text-sm">No bookings yet. Create one from the Bookings page.</td></tr>
                                ) : (
                                    recentBookings.map((row) => (
                                        <tr key={row._id} className="hover:bg-gray-50/40 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-playfair font-bold text-[14px] text-[#2B1512]">{row.eventName || "Event"}</div>
                                                <div className="text-[10px] font-bold text-[#DFB342] mt-0.5">{row.guestCount ? `${row.guestCount} pax` : ""}</div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="text-[13px] font-bold text-[#2B1512]">{row.customerId?.name || "—"}</div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="text-[11px] font-medium text-[#4B5563]">
                                                    {new Date(row.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <StatusBadge
                                                    status={row.status === "Confirmed" ? "confirmed" : row.status === "Cancelled" ? "cancelled" : "pending"}
                                                    label={row.status.toUpperCase()}
                                                    rounded="lg"
                                                />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {row.status === "Tentative" ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="text-[#10B981] hover:scale-110 transition-transform"><CheckCircle2 size={22} strokeWidth={2} /></button>
                                                        <button className="text-[#EF4444] hover:scale-110 transition-transform"><XCircle size={22} strokeWidth={2} /></button>
                                                    </div>
                                                ) : (
                                                    <button className="text-[#a39b9b] hover:text-[#2B1512]"><MoreHorizontal size={20} strokeWidth={2} /></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                {/* Bottom: Inventory Alerts */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
                    <SectionCard>
                        <SectionHeader title="All Bookings Summary" />
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-[#D1FAE5] rounded-xl text-center">
                                    <div className="text-[24px] font-bold text-[#065F46]">{confirmedBookings.length}</div>
                                    <div className="text-[10px] font-bold text-[#065F46] uppercase">Confirmed</div>
                                </div>
                                <div className="p-4 bg-[#FEF3C7] rounded-xl text-center">
                                    <div className="text-[24px] font-bold text-[#92400E]">{pendingBookings.length}</div>
                                    <div className="text-[10px] font-bold text-[#92400E] uppercase">Pending</div>
                                </div>
                                <div className="p-4 bg-[#FEE2E2] rounded-xl text-center">
                                    <div className="text-[24px] font-bold text-[#991B1B]">{bookings.filter(b => b.status === "Cancelled").length}</div>
                                    <div className="text-[10px] font-bold text-[#991B1B] uppercase">Cancelled</div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard>
                        <SectionHeader title="Inventory Alerts" />
                        <div>
                            <span className="text-[9px] font-bold text-[#a39b9b] uppercase tracking-widest mb-3 block">STOCK ALERTS</span>
                            {lowStockItems.length === 0 ? (
                                <p className="text-sm text-[#8e8484] py-4">All stocks are healthy ✓</p>
                            ) : (
                                lowStockItems.slice(0, 5).map((a) => (
                                    <div key={a._id} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                                        <span className="text-[12px] font-medium text-[#4B5563]">{a.name}</span>
                                        <StatusBadge
                                            status={a.quantity <= a.threshold / 2 ? "critical" : "low"}
                                            label={`${a.quantity} ${a.unit}`}
                                            rounded="lg"
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </SectionCard>
                </div>

            </div>
        </div>
    );
}
