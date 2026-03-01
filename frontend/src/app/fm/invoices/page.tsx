"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
interface Invoice { _id: string; bookingId?: { eventName?: string; eventDate?: string; customerId?: { name: string } }; totalAmount: number; taxAmount?: number; advancePaid?: number; createdAt?: string; }
export default function FmInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const res = await apiGet<Invoice[]>("/invoices"); if (res.success && res.data) setInvoices(res.data); setLoading(false); } load(); }, []);
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Invoices</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">All generated invoices</p></div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"><div className="overflow-x-auto">
                <table className="w-full text-left"><thead><tr className="border-b border-gray-100">
                    <th className="px-6 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Event</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Total</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Tax</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Paid</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Balance</th>
                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Status</th>
                </tr></thead><tbody className="divide-y divide-gray-100">
                        {invoices.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No invoices</td></tr> : invoices.map(inv => {
                            const bal = inv.totalAmount - (inv.advancePaid || 0);
                            return (
                                <tr key={inv._id} className="hover:bg-[#FDFBF9]">
                                    <td className="px-6 py-4"><p className="font-bold text-[#2B1512] text-[14px]">{inv.bookingId?.eventName || "Invoice"}</p><p className="text-[12px] text-[#8e8484]">{inv.bookingId?.customerId?.name || "—"}</p></td>
                                    <td className="px-4 py-4 text-center font-bold text-[13px] text-[#2B1512]">₹{inv.totalAmount.toLocaleString("en-IN")}</td>
                                    <td className="px-4 py-4 text-center text-[13px] text-[#8e8484]">₹{(inv.taxAmount || 0).toLocaleString("en-IN")}</td>
                                    <td className="px-4 py-4 text-center text-[13px] font-bold text-[#10B981]">₹{(inv.advancePaid || 0).toLocaleString("en-IN")}</td>
                                    <td className="px-4 py-4 text-center font-bold text-[13px]"><span className={bal > 0 ? "text-[#DC2626]" : "text-[#10B981]"}>₹{bal.toLocaleString("en-IN")}</span></td>
                                    <td className="px-4 py-4"><span className={`px-3 py-[3px] rounded-full text-[10px] font-bold ${bal === 0 ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{bal === 0 ? "PAID" : "PENDING"}</span></td>
                                </tr>
                            );
                        })}
                    </tbody></table>
            </div></div>
        </div></div>
    );
}
