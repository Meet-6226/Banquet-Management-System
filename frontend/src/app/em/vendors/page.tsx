"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
interface Vendor { _id: string; name: string; serviceType: string; contact: string; rating?: number; branchId?: { name: string }; }
export default function EmVendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const res = await apiGet<Vendor[]>("/vendors"); if (res.success && res.data) setVendors(res.data); setLoading(false); } load(); }, []);
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Vendors</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">Manage vendor partnerships</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendors.length === 0 ? <div className="col-span-full bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">No vendors found</div> : vendors.map(v => (
                    <div key={v._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-start justify-between mb-3"><h3 className="font-bold text-[#2B1512] text-[16px]">{v.name}</h3>{v.rating && <span className="flex items-center gap-1 text-[13px] font-bold text-[#CBA135]">★ {v.rating}</span>}</div>
                        <span className="inline-block w-fit px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-[#FFF9F2] text-[#CBA135] mb-3">{v.serviceType.toUpperCase()}</span>
                        <p className="text-[13px] text-[#4B5563]">{v.contact}</p>
                        {v.branchId?.name && <p className="text-[12px] text-[#8e8484] mt-1">{v.branchId.name}</p>}
                    </div>
                ))}
            </div>
        </div></div>
    );
}
