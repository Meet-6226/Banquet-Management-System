"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, TrendingUp, Clock, Star, ArrowRight, UserPlus, Plus, BarChart2 } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Booking {
    _id: string;
    eventName?: string;
    eventDate: string;
    guestCount?: number;
    status: string;
    totalAmount?: number;
    customerId?: { name: string };
}

interface EventData {
    _id: string;
    bookingId?: {
        eventName?: string;
        eventDate?: string;
        _id: string;
    };
    guestCount?: number;
    status?: string;
}

interface Lead {
    _id: string;
    name: string;
    status: string;
    eventDate?: string;
}

export default function EmDashboardPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [events, setEvents] = useState<EventData[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const [bk, ev, ld] = await Promise.all([
                apiGet<Booking[]>("/bookings"),
                apiGet<EventData[]>("/events"),
                apiGet<Lead[]>("/leads")
            ]);
            if (bk.success && bk.data) setBookings(bk.data);
            if (ev.success && ev.data) setEvents(ev.data);
            if (ld.success && ld.data) setLeads(ld.data);
            setLoading(false);
        }
        load();
    }, []);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcoming = bookings.filter(b => {
        const d = new Date(b.eventDate);
        d.setHours(0, 0, 0, 0);
        return d >= now && b.status !== "Cancelled";
    }).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    const totalRevenue = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const totalGuests = bookings.reduce((s, b) => s + (b.guestCount || 0), 0);
    const recentLeads = leads.slice(0, 4);

    if (loading) {
        return (
            <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const stats = [
        { label: "Planned Events", value: String(events.length), icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Upcoming Bookings", value: String(upcoming.length), icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Guests", value: totalGuests.toLocaleString(), icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Est. Revenue", value: `₹${(totalRevenue / 100000).toFixed(2)}L`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    ];

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden">
            <div className="w-full max-w-[1440px]">
                <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
                    <h1 className="text-[34px] font-playfair font-bold text-[#2B1512] leading-tight">Event Manager Dashboard</h1>
                    <p className="text-[14px] text-[#8e8484] font-medium mt-1">Ready to manage your premium events?</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((m, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-[160px] animate-in fade-in zoom-in-95 duration-500 transition-transform hover:scale-[1.02]" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center ${m.color}`}>
                                <m.icon size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest mb-1">{m.label}</p>
                                <span className="text-[28px] font-bold tracking-tight text-[#2B1512] leading-none">{m.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
                    {/* Upcoming Events Section */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-[22px] font-playfair font-bold text-[#2B1512]">Upcoming Schedule</h2>
                                <p className="text-[12px] text-[#8e8484] font-medium mt-0.5">Your next few confirmed bookings</p>
                            </div>
                            <button className="text-[12px] font-bold text-[#CBA135] flex items-center gap-1.5 hover:translate-x-1 transition-transform">
                                View Calendar <ArrowRight size={14} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {upcoming.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-[#F8F6F2] rounded-full flex items-center justify-center mx-auto mb-4 text-[#CBA135]">
                                        <Calendar size={28} />
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium">No upcoming bookings scheduled yet.</p>
                                </div>
                            ) : upcoming.slice(0, 5).map(b => (
                                <div key={b._id} className="group flex items-center gap-6 p-4 rounded-3xl border border-transparent hover:border-gray-50 hover:bg-[#FDFBF9] transition-all duration-300">
                                    <div className="w-14 h-14 rounded-2xl bg-[#F8F6F2] flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                                        <span className="text-[18px] font-bold text-[#2B1512]">{new Date(b.eventDate).getDate()}</span>
                                        <span className="text-[9px] font-bold text-[#8e8484] uppercase tracking-tighter">{new Date(b.eventDate).toLocaleDateString("en", { month: "short" })}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[#2B1512] text-[15px]">{b.eventName || "Premium Event"}</p>
                                        <div className="flex items-center gap-3 mt-1 underline-offset-4 decoration-[#DFB342]/30">
                                            <p className="text-[11px] font-semibold text-[#8e8484] flex items-center gap-1"><Users size={12} /> {b.guestCount || 0} Guests</p>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                            <p className="text-[11px] font-semibold text-[#8e8484] flex items-center gap-1"><Star size={12} className="text-[#DFB342]" /> {b.status}</p>
                                        </div>
                                    </div>
                                    <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[#CBA135] shadow-sm transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Leads / Tasks Side Card */}
                    <div className="space-y-6">
                        <div className="bg-[#2B1512] rounded-[32px] p-8 shadow-xl text-white animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[18px] font-playfair font-bold">New Leads</h3>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><UserPlus size={16} /></div>
                            </div>
                            <div className="space-y-5">
                                {recentLeads.length === 0 ? (
                                    <p className="text-white/40 text-[12px]">No new enquiries today.</p>
                                ) : recentLeads.map(l => (
                                    <div key={l._id} className="flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-[14px]">{l.name}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#CBA135]">{l.status}</span>
                                        </div>
                                        <p className="text-[11px] text-white/50 mt-1">{l.eventDate ? new Date(l.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "TBD"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[18px] font-playfair font-bold text-[#2B1512]">Actions</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-4 rounded-2xl bg-[#F8F6F2] text-[#2B1512] flex flex-col items-center justify-center gap-2 hover:bg-[#FFF9F2] transition-colors border border-transparent hover:border-[#DFB342]/20 group">
                                    <Plus size={18} className="text-[#CBA135] group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">New Event</span>
                                </button>
                                <button className="p-4 rounded-2xl bg-[#F8F6F2] text-[#2B1512] flex flex-col items-center justify-center gap-2 hover:bg-[#FFF9F2] transition-colors border border-transparent hover:border-[#DFB342]/20 group">
                                    <BarChart2 size={18} className="text-[#CBA135] group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Reports</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

