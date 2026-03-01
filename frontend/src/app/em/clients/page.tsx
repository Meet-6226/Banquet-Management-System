"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
interface Lead { _id: string; name: string; email?: string; contact?: string; status: string; budget?: number; guestCount?: number; eventDate?: string; }
export default function EmClientsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const res = await apiGet<Lead[]>("/leads"); if (res.success && res.data) setLeads(res.data); setLoading(false); } load(); }, []);
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Clients / Leads</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">All leads and client enquiries</p></div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left"><thead><tr className="border-b border-gray-100">
                    <th className="px-6 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Name</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Contact</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Budget</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Guests</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Status</th>
                </tr></thead><tbody className="divide-y divide-gray-100">
                        {leads.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No leads found</td></tr> : leads.map(l => {
                            const sty = l.status === "Won" ? "bg-[#D1FAE5] text-[#059669]" : l.status === "Lost" ? "bg-[#FEE2E2] text-[#DC2626]" : l.status === "Negotiation" ? "bg-[#FFEDD5] text-[#C2410C]" : "bg-[#FEF9C3] text-[#A16207]";
                            return (
                                <tr key={l._id} className="hover:bg-[#FDFBF9]">
                                    <td className="px-6 py-4"><p className="font-bold text-[#2B1512] text-[14px]">{l.name}</p><p className="text-[12px] text-[#8e8484]">{l.email}</p></td>
                                    <td className="px-4 py-4 text-[13px] text-[#4B5563]">{l.contact || "—"}</td>
                                    <td className="px-4 py-4 text-center font-bold text-[13px] text-[#2B1512]">{l.budget ? `₹${l.budget.toLocaleString("en-IN")}` : "—"}</td>
                                    <td className="px-4 py-4 text-center text-[13px] text-[#2B1512]">{l.guestCount || "—"}</td>
                                    <td className="px-4 py-4"><span className={`inline-block px-3 py-[3px] rounded-full text-[10px] font-bold tracking-wider ${sty}`}>{l.status}</span></td>
                                </tr>
                            );
                        })}
                    </tbody></table>
            </div>
        </div></div>
    );
}
