"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, LogOut, LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

interface UserLayoutProps {
    children: React.ReactNode;
    navItems: NavItem[];
    bottomNavItems?: NavItem[];
    roleTitle: string;
    brandName?: string;
    userInitials?: string;
    userName?: string;
    userDesignation?: string;
}

export function ShellSidebar({
    navItems,
    roleTitle,
    brandName = "BanquetPro",
}: Omit<UserLayoutProps, "children">) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <aside className="w-[260px] bg-[#2B1512] text-gray-300 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e6b96b] flex flex-shrink-0 items-center justify-center text-[#2B1512]">
                    <BellRing size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-[22px] font-bold text-white font-playfair leading-none mb-1 tracking-wide">{brandName}</h1>
                    <p className="text-[10px] text-[#8e8484] font-semibold tracking-[0.2em] uppercase">{roleTitle}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-[14px] transition-all ${isActive
                                ? "bg-white text-[#2B1512] font-bold shadow-sm"
                                : "text-[#d6cece] hover:bg-white/5 hover:text-white font-medium"
                                }`}
                        >
                            <item.icon size={20} className={isActive ? "text-[#CBA135]" : "text-[#8e8484]"} strokeWidth={isActive ? 2.5 : 2} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: User Profile + Logout */}
            <div className="px-4 py-6 border-t border-white/10 space-y-4">
                <div className="mt-8 flex items-center gap-3 px-4">
                    <div className="w-10 h-10 rounded-full bg-[#412724] flex flex-shrink-0 items-center justify-center text-[13px] font-bold text-[#e6b96b]">
                        {initials}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-semibold text-white truncate">{user?.name || "User"}</p>
                        <p className="text-[9px] text-[#8e8484] uppercase tracking-[0.15em] font-semibold mt-0.5">
                            {user?.role?.replace("_", " ") || roleTitle}
                        </p>
                    </div>
                    <button onClick={logout} className="text-[#8e8484] hover:text-[#EF4444] transition-colors" title="Logout">
                        <LogOut size={16} strokeWidth={2} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
