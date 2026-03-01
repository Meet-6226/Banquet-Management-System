"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, CheckCircle2 } from "lucide-react";
import { apiGet } from "@/lib/api";

interface EventData {
    _id: string;
    bookingId?: { eventName?: string; eventDate?: string; guestCount?: number; branchId?: { name: string }; hallId?: string; status?: string };
    menuItems?: { name: string; qtyPerGuest: number; unitCost: number }[];
    guestCount?: number;
    extraCharges?: number;
    status?: string;
}

export default function BmEventsPage() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await apiGet<EventData[]>("/events");
            if (res.success && res.data) setEvents(res.data);
            setLoading(false);
        }
        load();
    }, []);

    const planned = events.filter(e => e.status === "Planned").length;
    const completed = events.filter(e => e.status === "Completed").length;

    if (loading) {
        return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden">
            <div className="w-full max-w-[1440px]">
                <div className="mb-8">
                    <h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Events</h1>
                    <p className="text-[13px] text-[#8e8484] font-medium mt-1">View all event configurations and menus</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total Events", value: String(events.length), icon: Calendar },
                        { label: "Planned", value: String(planned), icon: CheckCircle2 },
                        { label: "Total Guests", value: String(events.reduce((s, e) => s + (e.guestCount || 0), 0)), icon: Users },
                    ].map((m, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#FFF9F2] flex items-center justify-center text-[#CBA135]"><m.icon size={22} /></div>
                            <div>
                                <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p>
                                <span className="text-[24px] font-bold tracking-tight text-[#2B1512]">{m.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    {events.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">No events found</div>
                    ) : events.map(e => {
                        const menuTotal = (e.menuItems || []).reduce((s, m) => s + m.unitCost * m.qtyPerGuest * (e.guestCount || 0), 0);
                        const statusStyle = e.status === "Planned" ? "bg-[#D1FAE5] text-[#059669]" : e.status === "Completed" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#FEF9C3] text-[#A16207]";
                        return (
                            <div key={e._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-[#2B1512] text-[16px]">{e.bookingId?.eventName || "Event"}</h3>
                                        <p className="text-[12px] text-[#8e8484] mt-1 flex items-center gap-2">
                                            <Calendar size={12} /> {e.bookingId?.eventDate ? new Date(e.bookingId.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                            <span className="mx-1">·</span>
                                            <Users size={12} /> {e.guestCount || 0} guests
                                        </p>
                                    </div>
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${statusStyle}`}>{e.status}</span>
                                </div>

                                {e.menuItems && e.menuItems.length > 0 && (
                                    <div className="mt-3 bg-[#FAFAF8] rounded-xl p-4">
                                        <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest mb-3">Menu Items</p>
                                        <div className="space-y-2">
                                            {e.menuItems.map((m, i) => (
                                                <div key={i} className="flex justify-between text-[13px]">
                                                    <span className="text-[#4B5563]">{m.name} <span className="text-[#8e8484]">× {m.qtyPerGuest}/guest</span></span>
                                                    <span className="font-bold text-[#2B1512]">₹{m.unitCost}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-[13px] font-bold">
                                            <span className="text-[#8e8484]">Estimated Total</span>
                                            <span className="text-[#2B1512]">₹{(menuTotal + (e.extraCharges || 0)).toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
