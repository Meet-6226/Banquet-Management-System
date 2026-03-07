"use client";
import { useState, useEffect } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Invoice {
    _id: string;
    bookingId?: { eventName?: string; customerId?: { name: string } };
    totalAmount: number;
    taxAmount?: number;
    advancePaid?: number;
}

interface Expense {
    id: string;
    title: string;
    category: string;
    amount: number;
    date: string;
    notes: string;
}

const CATEGORIES = [
    "Venue Maintenance",
    "Catering Supplies",
    "Decoration",
    "Staff Salaries",
    "Utilities",
    "Marketing",
    "Equipment",
    "Transportation",
    "Miscellaneous",
];

export default function FmExpensesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");
    const [formError, setFormError] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await apiGet<Invoice[]>("/invoices");
            if (res.success && res.data) setInvoices(res.data);
            const saved = localStorage.getItem("fm_expenses");
            if (saved) setExpenses(JSON.parse(saved));
            setLoading(false);
        }
        load();
    }, []);

    function saveExpenses(updated: Expense[]) {
        setExpenses(updated);
        localStorage.setItem("fm_expenses", JSON.stringify(updated));
    }

    const totalTax = invoices.reduce((s, i) => s + (i.taxAmount || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmount, 0);

    function openAdd() {
        setEditingId(null);
        setTitle("");
        setCategory("");
        setAmount("");
        setDate("");
        setNotes("");
        setFormError("");
        setShowForm(true);
    }

    function openEdit(exp: Expense) {
        setEditingId(exp.id);
        setTitle(exp.title);
        setCategory(exp.category);
        setAmount(String(exp.amount));
        setDate(exp.date);
        setNotes(exp.notes);
        setFormError("");
        setShowForm(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError("");
        if (!title.trim()) return setFormError("Title is required.");
        if (!category) return setFormError("Select a category.");
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) return setFormError("Enter a valid amount.");
        if (!date) return setFormError("Date is required.");

        if (editingId) {
            saveExpenses(
                expenses.map((ex) =>
                    ex.id === editingId
                        ? { ...ex, title: title.trim(), category, amount: amt, date, notes: notes.trim() }
                        : ex
                )
            );
        } else {
            const newExp: Expense = {
                id: Date.now().toString(),
                title: title.trim(),
                category,
                amount: amt,
                date,
                notes: notes.trim(),
            };
            saveExpenses([newExp, ...expenses]);
        }
        setShowForm(false);
    }

    function handleDelete(id: string) {
        saveExpenses(expenses.filter((e) => e.id !== id));
        setDeleteConfirm(null);
    }

    if (loading)
        return (
            <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" />
            </div>
        );

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden">
            <div className="w-full max-w-[1440px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Expenses</h1>
                        <p className="text-[13px] text-[#8e8484] font-medium mt-1">Track all expenses and tax liabilities</p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 bg-[#2B1512] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors shadow-sm"
                    >
                        <Plus size={16} /> Add Expense
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Expenses", value: `₹${totalExpenses.toLocaleString("en-IN")}` },
                        { label: "Total Invoiced", value: `₹${totalInvoiced.toLocaleString("en-IN")}` },
                        { label: "Total Tax", value: `₹${totalTax.toLocaleString("en-IN")}` },
                        { label: "Entries", value: String(expenses.length) },
                    ].map((m, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p>
                            <span className="text-[28px] font-bold tracking-tight text-[#2B1512] mt-2 block">{m.value}</span>
                        </div>
                    ))}
                </div>

                {/* Expenses Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Expense</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Category</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Amount</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest">Date</th>
                                    <th className="px-4 py-5 text-[11px] font-bold text-[#8e8484] uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            No expenses recorded. Click &quot;Add Expense&quot; to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-[#FDFBF9]">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[14px] text-[#2B1512]">{exp.title}</p>
                                                {exp.notes && <p className="text-[11px] text-[#8e8484] mt-0.5">{exp.notes}</p>}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FFF9F2] text-[#CBA135] tracking-wider">
                                                    {exp.category.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-[13px] text-[#DC2626]">
                                                ₹{exp.amount.toLocaleString("en-IN")}
                                            </td>
                                            <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                                                {new Date(exp.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => openEdit(exp)} className="w-8 h-8 rounded-lg bg-[#F8F6F2] flex items-center justify-center text-[#8e8484] hover:text-[#2B1512] hover:bg-[#F0EDE8] transition-colors">
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(exp.id)} className="w-8 h-8 rounded-lg bg-[#F8F6F2] flex items-center justify-center text-[#8e8484] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>

            {/* ── Add/Edit Expense Modal ── */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-[#2B1512] px-6 py-5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">Finance</p>
                                <h2 className="text-[20px] font-playfair font-bold text-white">
                                    {editingId ? "Edit Expense" : "Add Expense"}
                                </h2>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <X size={15} className="text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] px-4 py-3 rounded-xl text-[13px] font-medium">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Title *</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Hall cleaning supplies"
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Category *</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium appearance-none"
                                    >
                                        <option value="">Select...</option>
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        min="1"
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Date *</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Optional details..."
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-[#4B5563] rounded-xl text-[13px] font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2B1512] text-white rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors"
                                >
                                    <Plus size={15} /> {editingId ? "Update" : "Add Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[380px] p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-[18px] font-playfair font-bold text-[#2B1512] mb-2">Delete Expense</h3>
                        <p className="text-[13px] text-[#8e8484] mb-6">Are you sure? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 bg-gray-100 text-[#4B5563] rounded-xl text-[13px] font-bold hover:bg-gray-200 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-3 bg-[#DC2626] text-white rounded-xl text-[13px] font-bold hover:bg-[#B91C1C] transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
