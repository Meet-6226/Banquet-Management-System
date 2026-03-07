"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, Clock, Plus, X, Trash2 } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Booking { _id: string; eventName?: string; eventDate: string; status: string; customerId?: { name: string }; }

interface Task {
    id: string;
    title: string;
    description: string;
    priority: "High" | "Medium" | "Low";
    dueDate: string;
    bookingId?: string;
    completed: boolean;
}

export default function EmTasksPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Local tasks (persisted in localStorage)
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
    const [dueDate, setDueDate] = useState("");
    const [linkedBooking, setLinkedBooking] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await apiGet<Booking[]>("/bookings");
            if (res.success && res.data) setBookings(res.data);
            setLoading(false);
        }
        load();
        // Load tasks from localStorage
        const saved = localStorage.getItem("em_tasks");
        if (saved) setTasks(JSON.parse(saved));
    }, []);

    function saveTasks(updated: Task[]) {
        setTasks(updated);
        localStorage.setItem("em_tasks", JSON.stringify(updated));
    }

    function handleAddTask(e: React.FormEvent) {
        e.preventDefault();
        setFormError("");
        if (!title.trim()) return setFormError("Task title is required.");
        if (!dueDate) return setFormError("Due date is required.");
        const newTask: Task = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate,
            bookingId: linkedBooking || undefined,
            completed: false,
        };
        saveTasks([...tasks, newTask]);
        setTitle(""); setDescription(""); setPriority("Medium"); setDueDate(""); setLinkedBooking("");
        setShowForm(false);
    }

    function toggleComplete(id: string) {
        saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }

    function deleteTask(id: string) {
        saveTasks(tasks.filter(t => t.id !== id));
    }

    const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const completedTasks = tasks.filter(t => t.completed);

    // Upcoming bookings as auto-tasks
    const upcoming = bookings
        .filter(b => new Date(b.eventDate) > new Date())
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    const priorityStyle = (p: string) =>
        p === "High" ? "bg-[#FEE2E2] text-[#DC2626]" :
        p === "Low" ? "bg-[#DBEAFE] text-[#1D4ED8]" :
        "bg-[#FEF9C3] text-[#A16207]";

    if (loading) return <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 items-center justify-center"><div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F8F6F2] p-10 overflow-x-hidden">
            <div className="w-full max-w-[1440px]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-[28px] font-playfair font-bold text-[#2B1512]">Tasks</h1>
                        <p className="text-[13px] text-[#8e8484] font-medium mt-1">Manage your tasks and upcoming events</p>
                    </div>
                    <button onClick={() => { setFormError(""); setShowForm(true); }} className="flex items-center gap-2 bg-[#2B1512] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors shadow-sm">
                        <Plus size={16} /> Add Task
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Pending Tasks", value: String(pendingTasks.length) },
                        { label: "Completed", value: String(completedTasks.length) },
                        { label: "Upcoming Events", value: String(upcoming.length) },
                        { label: "High Priority", value: String(pendingTasks.filter(t => t.priority === "High").length), warn: pendingTasks.some(t => t.priority === "High") },
                    ].map((m, i) => (
                        <div key={i} className={`p-5 rounded-xl shadow-sm border flex flex-col ${m.warn ? "bg-[#FEF2F2] border-[#FCA5A5]" : "bg-white border-gray-100"}`}>
                            <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{m.label}</p>
                            <span className={`text-[28px] font-bold tracking-tight mt-2 ${m.warn ? "text-[#DC2626]" : "text-[#2B1512]"}`}>{m.value}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pending Tasks */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#2B1512] mb-5">
                            <Clock size={18} className="text-[#F59E0B]" /> Pending Tasks ({pendingTasks.length})
                        </h2>
                        <div className="space-y-3">
                            {pendingTasks.length === 0 ? (
                                <p className="text-sm text-gray-400 py-4 text-center">No pending tasks. Click &quot;Add Task&quot; to create one.</p>
                            ) : pendingTasks.map(t => {
                                const linked = bookings.find(b => b._id === t.bookingId);
                                const overdue = new Date(t.dueDate) < new Date();
                                return (
                                    <div key={t.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${overdue ? "bg-[#FEF2F2] border-[#FCA5A5]" : "bg-[#FAFAF8] border-gray-100"}`}>
                                        <button onClick={() => toggleComplete(t.id)} className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 hover:border-[#CBA135] transition-colors" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-[14px] text-[#2B1512]">{t.title}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${priorityStyle(t.priority)}`}>{t.priority}</span>
                                                {overdue && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FEE2E2] text-[#DC2626]">Overdue</span>}
                                            </div>
                                            {t.description && <p className="text-[12px] text-[#8e8484] mt-1">{t.description}</p>}
                                            <div className="flex items-center gap-3 mt-2 text-[11px] text-[#8e8484]">
                                                <span>Due: {new Date(t.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                                {linked && <span>• {linked.customerId?.name || linked.eventName || "Event"}</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => deleteTask(t.id)} className="text-gray-300 hover:text-[#DC2626] transition-colors p-1 flex-shrink-0">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        {/* Completed Tasks */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#2B1512] mb-4">
                                <CheckCircle2 size={18} className="text-[#10B981]" /> Completed ({completedTasks.length})
                            </h2>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {completedTasks.length === 0 ? (
                                    <p className="text-sm text-gray-400">No completed tasks yet</p>
                                ) : completedTasks.map(t => (
                                    <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                                        <button onClick={() => toggleComplete(t.id)} className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[13px] text-[#8e8484] line-through truncate">{t.title}</p>
                                        </div>
                                        <button onClick={() => deleteTask(t.id)} className="text-gray-300 hover:text-[#DC2626] transition-colors p-1 flex-shrink-0">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-[14px] font-bold text-[#2B1512] mb-4">Upcoming Events</h2>
                            <div className="space-y-2">
                                {upcoming.length === 0 ? <p className="text-sm text-gray-400">No upcoming events</p> : upcoming.slice(0, 5).map(b => (
                                    <div key={b._id} className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <div>
                                            <p className="font-bold text-[12px] text-[#2B1512]">{b.customerId?.name || b.eventName || "Event"}</p>
                                            <p className="text-[10px] text-[#8e8484]">{new Date(b.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${b.status === "Confirmed" ? "bg-[#2B1512] text-white" : "bg-[#FEF9C3] text-[#A16207]"}`}>{b.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Add Task Modal ──────────────────────────────────── */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-[#2B1512] px-6 py-5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">Tasks</p>
                                <h2 className="text-[20px] font-playfair font-bold text-white">Add New Task</h2>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <X size={15} className="text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleAddTask} className="p-6 space-y-4">
                            {formError && (
                                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] px-4 py-3 rounded-xl text-[13px] font-medium">{formError}</div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Task Title *</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Confirm vendor for wedding"
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium" />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Optional details..."
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Due Date *</label>
                                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Priority</label>
                                    <div className="flex gap-2">
                                        {(["High", "Medium", "Low"] as const).map(p => (
                                            <button key={p} type="button" onClick={() => setPriority(p)}
                                                className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                                                    priority === p ? "bg-[#2B1512] text-white border-[#2B1512]" : "bg-[#FAFAF8] text-[#4B5563] border-gray-200 hover:border-[#2B1512]/30"
                                                }`}>{p}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#8e8484] uppercase tracking-widest mb-2">Link to Booking</label>
                                <select value={linkedBooking} onChange={e => setLinkedBooking(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-gray-200 rounded-xl text-[13px] text-[#2B1512] focus:outline-none focus:ring-2 focus:ring-[#CBA135] font-medium appearance-none">
                                    <option value="">None (standalone task)</option>
                                    {bookings.map(b => (
                                        <option key={b._id} value={b._id}>
                                            {b.customerId?.name || b.eventName || "Booking"} — {new Date(b.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-[#4B5563] rounded-xl text-[13px] font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2B1512] text-white rounded-xl text-[13px] font-bold hover:bg-[#1a0f0d] transition-colors">
                                    <Plus size={15} /> Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
