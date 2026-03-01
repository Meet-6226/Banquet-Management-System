import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

// ─────────────────────────────────────────────
// MetricCard
// Used for KPI stat cards across all panels
// ─────────────────────────────────────────────
interface MetricCardProps {
    label: string;
    value: string | number;
    sub?: ReactNode;
    icon?: LucideIcon;
    iconColor?: string;
    /** Accent colour for the bottom border. Defaults to transparent (no border). */
    accentColor?: string;
    className?: string;
}

export function MetricCard({
    label,
    value,
    sub,
    icon: Icon,
    iconColor = "text-[#4B5563]",
    accentColor,
    className = ""
}: MetricCardProps) {
    return (
        <div
            className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col ${accentColor ? `border-b-2` : ""} ${className}`}
            style={accentColor ? { borderBottomColor: accentColor } : undefined}
        >
            <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-bold text-[#a39b9b] uppercase tracking-widest">{label}</span>
                {Icon && <Icon size={16} className={iconColor} strokeWidth={1.8} />}
            </div>
            <div className="text-[26px] font-bold text-[#2B1512] tracking-tight leading-none">{value}</div>
        </div>
    );
}


// ─────────────────────────────────────────────
// StatusBadge
// Coloured chips for table status columns
// ─────────────────────────────────────────────
type StatusVariant =
    | "paid"
    | "confirmed"
    | "active"
    | "pending"
    | "sent"
    | "overdue"
    | "cancelled"
    | "paused"
    | "urgent"
    | "attention"
    | "low"
    | "critical"
    | "renewed"
    | "expiring"
    | "custom";

const STATUS_STYLES: Record<StatusVariant, string> = {
    paid: "bg-[#D1FAE5] text-[#065F46]",
    confirmed: "bg-[#D1FAE5] text-[#065F46]",
    active: "bg-[#FFF9F2] text-[#DFB342] border border-[#DFB342]/30",
    pending: "bg-[#F3F4F6] text-[#4B5563]",
    sent: "bg-[#EFF6FF] text-[#3B82F6]",
    overdue: "bg-[#FEF2F2] text-[#EF4444]",
    cancelled: "bg-[#FEF2F2] text-[#EF4444]",
    paused: "bg-[#F3F4F6] text-[#4B5563]",
    urgent: "bg-[#FEF2F2] text-[#EF4444]",
    attention: "bg-[#FFF9F2] text-[#DFB342]",
    low: "bg-[#FFF9F2] text-[#DFB342]",
    critical: "bg-[#FEF2F2] text-[#EF4444]",
    renewed: "bg-[#F3F4F6] text-[#4B5563] border border-gray-200",
    expiring: "bg-[#FFF9F2] text-[#F59E0B] border border-[#F59E0B]/30",
    custom: "",
};

interface StatusBadgeProps {
    status: StatusVariant;
    label?: string;
    /** Only used when status="custom" */
    className?: string;
    rounded?: "full" | "lg";
}

export function StatusBadge({ status, label, className = "", rounded = "full" }: StatusBadgeProps) {
    const base = "inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-bold tracking-widest whitespace-nowrap";
    const shape = rounded === "full" ? "rounded-full" : "rounded-lg";
    const style = status === "custom" ? className : STATUS_STYLES[status];
    return (
        <span className={`${base} ${shape} ${style}`}>
            {label || status.toUpperCase()}
        </span>
    );
}


// ─────────────────────────────────────────────
// PageHeader
// Standard page title + subtitle + optional CTA
// ─────────────────────────────────────────────
interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    right?: ReactNode;
    className?: string;
}

export function PageHeader({ title, subtitle, action, right, className = "" }: PageHeaderProps) {
    return (
        <div className={`flex items-start justify-between w-full ${className}`}>
            <div>
                <h1 className="text-[34px] font-playfair font-bold text-[#2B1512] leading-tight">{title}</h1>
                {subtitle && (
                    <p className="text-[14px] text-[#8e8484] font-medium mt-1 max-w-[500px] leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-3 mt-1">
                {right}
                {action}
            </div>
        </div>
    );
}


// ─────────────────────────────────────────────
// SectionCard
// White rounded card container
// ─────────────────────────────────────────────
interface SectionCardProps {
    children: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function SectionCard({ children, className = "", noPadding = false }: SectionCardProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-50 ${noPadding ? "" : "p-7"} ${className}`}>
            {children}
        </div>
    );
}


// ─────────────────────────────────────────────
// SectionHeader (inside a card)
// Title + optional right element
// ─────────────────────────────────────────────
interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    right?: ReactNode;
}

export function SectionHeader({ title, subtitle, right }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-[18px] font-playfair font-bold text-[#2B1512] leading-tight">{title}</h2>
                {subtitle && <p className="text-[12px] text-[#a39b9b] font-medium mt-0.5">{subtitle}</p>}
            </div>
            {right && <div className="flex items-center gap-3">{right}</div>}
        </div>
    );
}



