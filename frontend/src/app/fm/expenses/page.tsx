"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
interface Invoice { _id: string; bookingId?: { eventName?: string }; totalAmount: number; taxAmount?: number; advancePaid?: number; }
export default function FmExpensesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { async function load() { setLoading(true); const res = await apiGet<Invoice[]>("/invoices"); if (res.success && res.data) setInvoices(res.data); setLoading(false); } load(); }, []);
    const totalTax = invoices.reduce((s, i) => s + (i.taxAmount || 0), 0);
    const totalAmount = invoices.reduce((s, i) => s + i.totalAmount, 0);
    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden"><div className="w-full max-w-[1440px]">
            <div className="mb-8"><h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Expenses</h1><p className="text-[13px] text-[#8e8484] font-medium mt-1">Track all expenses and tax liabilities</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[{ label: "Total Invoiced", value: `₹${totalAmount.toLocaleString("en-IN")}` }, { label: "Total Tax", value: `₹${totalTax.toLocaleString("en-IN")}` }, { label: "Invoices", value: String(invoices.length) }].map((m, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p><span className="text-[28px] font-bold tracking-tight text-[#2B1512] mt-2 block">{m.value}</span></div>
                ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[18px] font-playfair font-bold text-[#2B1512] mb-4">Tax by Invoice</h2>
                <div className="space-y-3">{invoices.map(i => (
                    <div key={i._id} className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-[13px] text-[#4B5563]">{i.bookingId?.eventName || "Invoice"}</span><div className="text-right"><p className="font-bold text-[13px] text-[#2B1512]">₹{(i.taxAmount || 0).toLocaleString("en-IN")}</p><p className="text-[11px] text-[#8e8484]">on ₹{i.totalAmount.toLocaleString("en-IN")}</p></div></div>
                ))}{invoices.length === 0 && <p className="text-sm text-gray-400 py-4">No expense data</p>}</div>
            </div>
        </div></div>
    );
}
