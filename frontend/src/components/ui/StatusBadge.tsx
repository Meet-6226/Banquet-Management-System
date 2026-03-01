interface StatusBadgeProps {
    status: string;
    variant?: "default" | "role";
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
    const s = status.toUpperCase();

    // Standard booking statuses
    if (variant === "default") {
        let colors = "bg-gray-100 text-gray-600"; // pending default
        if (s === "CONFIRMED") colors = "bg-[#CBA135]/10 text-[#a07c22]";
        if (s === "CANCELLED") colors = "bg-red-50 text-red-600";

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors}`}>
                {status}
            </span>
        );
    }

    // Role variants (Manager directory style)
    let roleColor = "text-[#4B5563] bg-[#F3F4F6]"; // default gray

    if (s === "BRANCH" || s === "FINANCE") {
        roleColor = "text-[#CBA135] bg-[#FFF9F2]";
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-bold tracking-widest ${roleColor}`}>
            {s}
        </span>
    );
}
