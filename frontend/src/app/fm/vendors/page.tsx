"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
interface Vendor { _id: string; name: string; serviceType: string; contact: string; rating?: number; branchId?: { name: string }; }
export default function FmVendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const res = await apiGet<Vendor[]>("/vendors"); if (res.success && res.data) setVendors(res.data); setLoading(false); } load(); }, []);
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Vendor Payments</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">Manage vendor partnerships and payments</p></div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"><div className="overflow-x-auto">
                <table className="w-full text-left"><thead><tr className="border-b border-gray-100">
                    <th className="px-6 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Vendor</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Service</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Contact</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Rating</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Branch</th>
                </tr></thead><tbody className="divide-y divide-gray-100">
                        {vendors.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No vendors</td></tr> : vendors.map(v => (
                            <tr key={v._id} className="hover:bg-[#FDFBF9]">
                                <td className="px-6 py-4 font-bold text-[14px] text-[#2B1512]">{v.name}</td>
                                <td className="px-4 py-4"><span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FFF9F2] text-[#CBA135] tracking-wider">{v.serviceType.toUpperCase()}</span></td>
                                <td className="px-4 py-4 text-[13px] text-[#4B5563]">{v.contact}</td>
                                <td className="px-4 py-4 text-center font-bold text-[13px] text-[#CBA135]">{v.rating ? `★ ${v.rating}` : "—"}</td>
                                <td className="px-4 py-4 text-[13px] text-[#8e8484]">{v.branchId?.name || "—"}</td>
                            </tr>
                        ))}
                    </tbody></table>
            </div></div>
        </div></div>
    );
}
