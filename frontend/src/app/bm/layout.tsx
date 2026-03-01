"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CalendarDays, Users, Package, BarChart2, LogOut } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/context/AuthContext";

const bmNavItems = [
    { name: "Dashboard", href: "/bm/dashboard", icon: LayoutDashboard },
    { name: "Bookings", href: "/bm/bookings", icon: CalendarDays },
    { name: "Events", href: "/bm/events", icon: Users },
    { name: "Inventory", href: "/bm/inventory", icon: Package },
    { name: "Analytics", href: "/bm/analytics", icon: BarChart2 },
];

export default function BmLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isLoading, isAuthenticated } = useAuthGuard([
        "ADMIN", "BRANCH_MANAGER", "SALES_EXECUTIVE", "KITCHEN_MANAGER", "INVENTORY_MANAGER",
    ]);
    const { user, logout } = useAuth();

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center" style={{ background: "#F5F3ED" }}>
                <div className="w-8 h-8 border-4 border-[#DFB342] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: "#F5F3ED" }}>
            {/* Sidebar */}
            <aside className="w-[220px] flex-shrink-0 flex flex-col h-full fixed left-0 top-0 z-20" style={{ background: "#2B1512" }}>
                {/* Brand */}
                <div className="flex items-center gap-3 px-6 pt-7 pb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#DFB342] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#2B1512] font-black text-[18px]">✕</span>
                    </div>
                    <div>
                        <h1 className="text-white font-playfair font-bold text-[17px] leading-none">Banquet Pro</h1>
                        <p className="text-[#8e7e7e] text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">BRANCH OPS</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 flex flex-col gap-1">
                    {bmNavItems.map((item) => {
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all ${active
                                    ? "bg-[#F5F3ED] text-[#2B1512]"
                                    : "text-[#d6cece] hover:bg-white/8 hover:text-white"
                                    }`}
                            >
                                <item.icon size={17} strokeWidth={active ? 2.5 : 2} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile + Logout */}
                <div className="px-3 pb-6 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-3">
                        <div className="w-9 h-9 rounded-full bg-[#412724] flex flex-shrink-0 items-center justify-center text-[11px] font-bold text-[#e6b96b]">
                            {initials}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-[13px] font-bold text-white truncate">{user?.name || "User"}</p>
                            <p className="text-[9px] text-[#8e8484] uppercase tracking-[0.15em] font-semibold mt-0.5">{user?.role?.replace("_", " ") || "Branch Manager"}</p>
                        </div>
                        <button onClick={logout} className="text-[#8e8484] hover:text-[#EF4444] transition-colors" title="Logout">
                            <LogOut size={14} strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 ml-[220px] flex flex-col h-full overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
