"use client";

import { ShellSidebar } from "@/components/ui/ShellSidebar";
import { LayoutDashboard, Calendar, CalendarDays, CheckSquare, Users, Briefcase, BarChart2 } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const emNavItems = [
    { name: "Dashboard", href: "/em/dashboard", icon: LayoutDashboard },
    { name: "My Events", href: "/em/events", icon: CalendarDays },
    { name: "Calendar", href: "/em/calendar", icon: Calendar },
    { name: "Tasks", href: "/em/tasks", icon: CheckSquare },
    { name: "Vendors", href: "/em/vendors", icon: Briefcase },
    { name: "Clients", href: "/em/clients", icon: Users },
    { name: "Reports", href: "/em/reports", icon: BarChart2 }
];

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, isAuthenticated } = useAuthGuard([
        "ADMIN", "EVENT_MANAGER",
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
                navItems={emNavItems}
                roleTitle="Event Manager"
                brandName="BanquetPro"
            />

            <div className="flex-1 ml-[260px] flex flex-col h-full overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto pb-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
