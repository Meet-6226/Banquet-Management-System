"use client";
import { useState, useEffect } from "react";
import { Calendar, Users } from "lucide-react";
import { apiGet } from "@/lib/api";
interface EventData { _id: string; bookingId?: { eventName?: string; eventDate?: string; guestCount?: number }; menuItems?: { name: string; qtyPerGuest: number; unitCost: number }[]; guestCount?: number; extraCharges?: number; status?: string; }
export default function EmEventsPage() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const res = await apiGet<EventData[]>("/events"); if (res.success && res.data) setEvents(res.data); setLoading(false); } load(); }, []);
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Events</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">All events and their configurations</p></div>
            <div className="space-y-4">
                {events.length === 0 ? <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">No events found</div> : events.map(e => {
                    const menuTotal = (e.menuItems || []).reduce((s, m) => s + m.unitCost * m.qtyPerGuest * (e.guestCount || 0), 0);
                    return (
                        <div key={e._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between mb-3"><div><h3 className="font-bold text-[#2B1512] text-[16px]">{e.bookingId?.eventName || "Event"}</h3><p className="text-[12px] text-[#8e8484] mt-1 flex items-center gap-2"><Calendar size={12} /> {e.bookingId?.eventDate ? new Date(e.bookingId.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}<span className="mx-1">·</span><Users size={12} /> {e.guestCount || 0} guests</p></div><span className={`px-3 py-1 rounded-full text-[10px] font-bold ${e.status === "Planned" ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#DBEAFE] text-[#1D4ED8]"}`}>{e.status}</span></div>
                            {e.menuItems && e.menuItems.length > 0 && <div className="bg-[#FAFAF8] rounded-xl p-4 mt-3"><p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest mb-3">Menu</p>{e.menuItems.map((m, i) => <div key={i} className="flex justify-between text-[13px] mb-1"><span className="text-[#4B5563]">{m.name}</span><span className="font-bold text-[#2B1512]">₹{m.unitCost}/unit</span></div>)}<div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-[13px] font-bold"><span className="text-[#8e8484]">Total</span><span className="text-[#2B1512]">₹{(menuTotal + (e.extraCharges || 0)).toLocaleString("en-IN")}</span></div></div>}
                        </div>
                    );
                })}
            </div>
        </div></div>
    );
}
