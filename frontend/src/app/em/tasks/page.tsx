"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { apiGet } from "@/lib/api";
interface Booking { _id: string; eventName?: string; eventDate: string; status: string; }
export default function EmTasksPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const res = await apiGet<Booking[]>("/bookings"); if (res.success && res.data) setBookings(res.data); setLoading(false); } load(); }, []);
    const upcoming = bookings.filter(b => new Date(b.eventDate) > new Date()).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    const past = bookings.filter(b => new Date(b.eventDate) <= new Date());
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Tasks</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">Upcoming and completed event tasks</p></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#2B1512] mb-4"><Clock size={18} className="text-[#F59E0B]" /> Upcoming ({upcoming.length})</h2>
                    <div className="space-y-3">{upcoming.length === 0 ? <p className="text-sm text-gray-400">No upcoming tasks</p> : upcoming.map(b => (
                        <div key={b._id} className="flex justify-between items-center py-2 border-b border-gray-50"><div><p className="font-bold text-[13px] text-[#2B1512]">{b.eventName || "Event"}</p><p className="text-[11px] text-[#8e8484]">{new Date(b.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p></div><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${b.status === "Confirmed" ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEF9C3] text-[#A16207]"}`}>{b.status}</span></div>
                    ))}</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#2B1512] mb-4"><CheckCircle2 size={18} className="text-[#10B981]" /> Completed ({past.length})</h2>
                    <div className="space-y-3">{past.length === 0 ? <p className="text-sm text-gray-400">No completed tasks</p> : past.map(b => (
                        <div key={b._id} className="flex justify-between items-center py-2 border-b border-gray-50"><div><p className="font-bold text-[13px] text-[#2B1512]">{b.eventName || "Event"}</p><p className="text-[11px] text-[#8e8484]">{new Date(b.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p></div><span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D1FAE5] text-[#059669]">Done</span></div>
                    ))}</div>
                </div>
            </div>
        </div></div>
    );
}
