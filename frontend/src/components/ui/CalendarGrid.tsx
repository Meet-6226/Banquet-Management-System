"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface Event {
    id: string;
    title: string;
    date: Date;
    type?: string;
    status?: string;
}

interface CalendarGridProps {
    events: Event[];
    onDateClick?: (date: Date) => void;
    onEventClick?: (event: Event) => void;
    onAddClick?: (date: Date) => void;
}

export function CalendarGrid({ events, onDateClick, onEventClick, onAddClick }: CalendarGridProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthName = currentDate.toLocaleString("en-IN", { month: "long" });

    // Days array
    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
        days.push(new Date(year, month, i));
    }

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const getEventsForDate = (date: Date) => {
        return events.filter(e =>
            e.date.getDate() === date.getDate() &&
            e.date.getMonth() === date.getMonth() &&
            e.date.getFullYear() === date.getFullYear()
        );
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-white/40 overflow-hidden backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
            {/* Calendar Header */}
            <div className="px-8 py-6 bg-[#2B1512] text-white flex items-center justify-between">
                <div>
                    <h2 className="text-[24px] font-playfair font-bold leading-tight">{monthName}</h2>
                    <p className="text-[13px] text-white/60 font-medium tracking-wide">{year}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                    >
                        <ChevronRight size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 border-b border-gray-50">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
                    <div key={day} className="py-4 text-center text-[10px] font-bold text-[#8e8484] uppercase tracking-widest bg-gray-50/30">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 grid-rows-5 auto-rows-fr">
                {days.map((date, idx) => (
                    <div
                        key={idx}
                        className={`min-h-[120px] p-2 border-r border-b border-gray-50 transition-all duration-300 relative group
                            ${!date ? "bg-gray-50/20" : "hover:bg-[#FFF9F2]/50"}
                            ${idx % 7 === 6 ? "border-r-0" : ""}
                        `}
                        onClick={() => date && onDateClick?.(date)}
                    >
                        {date && (
                            <>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[13px] font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                                        ${isToday(date) ? "bg-[#CBA135] text-white shadow-lg" : "text-[#2B1512] group-hover:text-[#CBA135]"}
                                    `}>
                                        {date.getDate()}
                                    </span>
                                    {isToday(date) && (
                                        <span className="text-[8px] font-bold text-[#CBA135] uppercase tracking-tighter mt-1 mr-1">Today</span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 overflow-hidden">
                                    {getEventsForDate(date).slice(0, 3).map(event => (
                                        <div
                                            key={event.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEventClick?.(event);
                                            }}
                                            className={`px-2 py-1 rounded-md text-[10px] font-bold truncate cursor-pointer transition-transform hover:scale-[1.02] shadow-sm
                                                ${event.status === "Confirmed" ? "bg-green-50 text-green-700 border-l-2 border-green-400" : "bg-orange-50 text-orange-700 border-l-2 border-orange-400"}
                                            `}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                    {getEventsForDate(date).length > 3 && (
                                        <span className="text-[9px] font-bold text-[#8e8484] pl-1">
                                            + {getEventsForDate(date).length - 3} more
                                        </span>
                                    )}
                                </div>

                                        <button
                                    onClick={(e) => { e.stopPropagation(); onAddClick?.(date); }}
                                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white rounded-full text-[#CBA135] shadow-md border border-gray-100 scale-90 hover:scale-100"
                                >
                                    <Plus size={12} strokeWidth={3} />
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
