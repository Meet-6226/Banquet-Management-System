"use client";

import { ShellSidebar } from "@/components/ui/ShellSidebar";
import { LayoutDashboard, CalendarDays, Users, Package, BarChart2 } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const bmNavItems = [
    { name: "Dashboard", href: "/bm/dashboard", icon: LayoutDashboard },
    { name: "Bookings", href: "/bm/bookings", icon: CalendarDays },
    { name: "Events", href: "/bm/events", icon: Users },
    { name: "Inventory", href: "/bm/inventory", icon: Package },
    { name: "Analytics", href: "/bm/analytics", icon: BarChart2 },
];

export default function BmLayout({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthenticated } = useAuthGuard([
        "ADMIN", "BRANCH_MANAGER", "SALES_EXECUTIVE", "KITCHEN_MANAGER", "INVENTORY_MANAGER",
    ]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8F6F2]">
                <div className="w-8 h-8 border-4 border-[#CBA135] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8F6F2] overflow-hidden">
            <ShellSidebar
                navItems={bmNavItems}
                roleTitle="Branch Ops"
                brandName="BanquetPro"
            />
            <div className="flex-1 ml-[260px] flex flex-col h-full overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
