"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";

interface InventoryItem { _id: string; name: string; quantity: number; unit: string; threshold: number; branchId?: { name: string }; }

const UNITS = ["pieces", "kg", "litres", "boxes", "packets", "bottles", "metres", "dozen"];

export default function BmInventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // Form fields
    const [itemName, setItemName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("pieces");
    const [threshold, setThreshold] = useState("");

    async function loadData() {
        setLoading(true);
        const res = await apiGet<InventoryItem[]>("/inventory");
        if (res.success && res.data) setItems(res.data);
        setLoading(false);
    }

    useEffect(() => { loadData(); }, []);

    function resetForm() {
        setItemName(""); setQuantity(""); setUnit("pieces"); setThreshold(""); setFormError("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError("");
        if (!itemName.trim()) return setFormError("Item name is required.");
        if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0) return setFormError("Enter a valid quantity.");
        if (!threshold || isNaN(Number(threshold)) || Number(threshold) < 0) return setFormError("Enter a valid threshold.");
        setSubmitting(true);
        const res = await apiPost("/inventory", {
            name: itemName.trim(),
            quantity: Number(quantity),
            unit,
            threshold: Number(threshold),
        });
        if (res.success) {
            setShowForm(false);
            resetForm();
            await loadData();
        } else {
            setFormError(res.error || "Failed to add item.");
        }
        setSubmitting(false);
    }

    const lowStock = items.filter(i => i.quantity < i.threshold);
    const totalValue = items.reduce((s, i) => s + i.quantity, 0);

    if (loading) {
        return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden">
            <div className="w-full max-w-[1440px]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Inventory</h1>
                        <p className="text-[13px] text-[#8e8484] font-medium mt-1">Track and manage all inventory items</p>
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-[#2B1512] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors shadow-sm"><Plus size={16} /> Add Item</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Items", value: String(items.length) },
                        { label: "Low Stock Alerts", value: String(lowStock.length), warn: lowStock.length > 0 },
                        { label: "Total Quantity", value: String(totalValue) },
                        { label: "Healthy Stock", value: String(items.length - lowStock.length) },
                    ].map((m, i) => (
                        <div key={i} className={`p-5 rounded-xl shadow-sm border flex flex-col ${m.warn ? "bg-[#FEF2F2] border-[#FCA5A5]" : "bg-white border-gray-100"}`}>
                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p>
                            <span className={`text-[28px] font-bold tracking-tight mt-2 ${m.warn ? "text-[#DC2626]" : "text-[#2B1512]"}`}>{m.value}</span>
                        </div>
                    ))}
                </div>

                {lowStock.length > 0 && (
                    <div className="bg-[#FEF2F2] rounded-2xl p-6 border border-[#FCA5A5] mb-6">
                        <h3 className="text-[12px] font-bold text-[#DC2626] uppercase tracking-widest mb-4">⚠ Low Stock Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {lowStock.map(i => (
                                <div key={i._id} className="bg-white rounded-lg p-3 border border-[#FECACA] flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-[#111827] text-sm">{i.name}</p>
                                        <p className="text-xs text-[#8e8484]">Min: {i.threshold} {i.unit}</p>
                                    </div>
                                    <span className="text-[#DC2626] font-bold text-lg">{i.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Item Name</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Quantity</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Unit</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Threshold</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No inventory items</td></tr>
                                ) : items.map(i => {
                                    const isLow = i.quantity < i.threshold;
                                    return (
                                        <tr key={i._id} className="hover:bg-[#FDFBF9] transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[#2B1512] text-[14px]">{i.name}</p>
                                                {i.branchId?.name && <p className="text-[12px] text-[#8e8484]">{i.branchId.name}</p>}
                                            </td>
                                            <td className={`px-4 py-4 text-center font-bold text-[14px] ${isLow ? "text-[#DC2626]" : "text-[#2B1512]"}`}>{i.quantity}</td>
                                            <td className="px-4 py-4 text-center text-[13px] text-[#8e8484]">{i.unit}</td>
                                            <td className="px-4 py-4 text-center text-[13px] text-[#8e8484]">{i.threshold}</td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-block px-3 py-[3px] rounded-full text-[10px] font-bold tracking-wider ${isLow ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#D1FAE5] text-[#059669]"}`}>
                                                    {isLow ? "LOW STOCK" : "IN STOCK"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Add Item Modal ─────────────────────────────────────── */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-[#2B1512] px-6 py-5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">Inventory</p>
                                <h2 className="text-[20px] font-playfair font-bold text-white">Add New Item</h2>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <X size={15} className="text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] px-4 py-3 rounded-xl text-[13px] font-medium">{formError}</div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Item Name *</label>
                                <input
                                    value={itemName} onChange={e => setItemName(e.target.value)}
                                    placeholder="e.g. Candle Holders"
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Quantity *</label>
                                    <input
                                        type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)}
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Unit *</label>
                                    <select value={unit} onChange={e => setUnit(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium appearance-none">
                                        {UNITS.map(u => <option key={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Low Stock Threshold *</label>
                                <input
                                    type="number" min="0" value={threshold} onChange={e => setThreshold(e.target.value)}
                                    placeholder="Alert when quantity falls below this"
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium"
                                />
                                <p className="text-[11px] text-[#8e8484] mt-1.5">Item will be flagged as low stock below this quantity.</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-[#4B5563] rounded-xl text-[13px] font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2B1512] text-white rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors disabled:opacity-60">
                                    {submitting
                                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : <Plus size={15} />}
                                    {submitting ? "Saving..." : "Add Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
