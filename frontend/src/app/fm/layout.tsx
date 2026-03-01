"use client";

import { ShellSidebar } from "@/components/ui/ShellSidebar";
import { LayoutDashboard, CreditCard, Receipt, FileText, BarChart2, Store, Building2 } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const fmNavItems = [
    { name: "Dashboard", href: "/fm/dashboard", icon: LayoutDashboard },
    { name: "Payments", href: "/fm/payments", icon: CreditCard },
    { name: "Expenses", href: "/fm/expenses", icon: Receipt },
    { name: "Invoices", href: "/fm/invoices", icon: FileText },
    { name: "Reports", href: "/fm/reports", icon: BarChart2 },
    { name: "Vendors", href: "/fm/vendors", icon: Store },
    { name: "Financial Summary", href: "/fm/financial-summary", icon: Building2 },
];

export default function FmLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, isAuthenticated } = useAuthGuard([
        "ADMIN", "FINANCE_MANAGER",
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
                navItems={fmNavItems}
                roleTitle="Finance Division"
                brandName="Banquet Manager"
            />

            <div className="flex-1 ml-[260px] flex flex-col h-full overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto pb-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
