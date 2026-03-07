"use client";

import { ShellSidebar } from "@/components/ui/ShellSidebar";
import { LayoutDashboard, CalendarCheck, MapPin, Users, PieChart } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const adminNavItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Global Bookings", href: "/admin/booking", icon: CalendarCheck },
    { name: "Venues", href: "/admin/venues", icon: MapPin },
    { name: "Managers", href: "/admin/managers", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: PieChart },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, isAuthenticated } = useAuthGuard(["ADMIN"]);

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
                navItems={adminNavItems}
                roleTitle="Owner Control"
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
