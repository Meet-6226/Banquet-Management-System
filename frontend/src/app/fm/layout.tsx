"use client";

import { ShellSidebar } from "@/components/ui/ShellSidebar";
import { LayoutDashboard, CreditCard, Receipt, FileText, BarChart2, Store, Building2, Search, Bell } from "lucide-react";
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
                <header className="h-[80px] px-10 flex flex-shrink-0 items-center justify-between bg-[#F8F6F2] sticky top-0 z-10 w-full">
                    <div className="relative w-full max-w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a39b9b]" size={18} strokeWidth={2.5} />
                        <input
                            type="text"
                            placeholder="Search transactions, vendors..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-[#CBA135] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-[13px] text-[#4A322D] placeholder:text-[#a39b9b] font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-[#a39b9b] hover:text-[#2B1512] transition-colors bg-white rounded-full shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-10 w-10 flex items-center justify-center">
                            <Bell size={20} strokeWidth={2.5} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto pb-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
