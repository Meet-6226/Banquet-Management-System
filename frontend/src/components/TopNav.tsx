import { Search, Bell } from "lucide-react";

export default function TopNav() {
    return (
        <header className="h-[80px] px-10 flex flex-shrink-0 items-center justify-between bg-[#F5F3ED] sticky top-0 z-10 w-full">
            {/* Search Bar */}
            <div className="relative w-full max-w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a39b9b]" size={18} strokeWidth={2.5} />
                <input
                    type="text"
                    placeholder="Search bookings, venues, or managers..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-[#CBA135] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-[13px] text-[#4A322D] placeholder:text-[#a39b9b] font-medium"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <button className="relative p-2 text-[#a39b9b] hover:text-[#2B1512] transition-colors bg-white rounded-full shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-10 w-10 flex items-center justify-center">
                    <Bell size={20} strokeWidth={2.5} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full border border-white"></span>
                </button>
            </div>
        </header>
    );
}
