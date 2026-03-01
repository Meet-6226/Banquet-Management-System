"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    className?: string; // allow overrides
}

export function MetricCard({
    title,
    value,
    icon,
    className = ""
}: MetricCardProps) {
    return (
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between ${className}`}>
            <div className="flex justify-between items-start mb-4">
                {icon ? (
                    <div className="p-3 rounded-lg flex-shrink-0 bg-gray-50 text-gray-600">
                        {icon}
                    </div>
                ) : (
                    <p className="text-[10px] font-bold text-[#8e8484] uppercase tracking-widest">{title}</p>
                )}
            </div>

            <div>
                {icon && <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">{title}</p>}

                <h3 className={`font-bold text-[#2B1512] ${icon ? 'text-3xl' : 'text-[28px] leading-none tracking-tight'}`}>
                    {value}
                </h3>
            </div>
        </div>
    );
}

