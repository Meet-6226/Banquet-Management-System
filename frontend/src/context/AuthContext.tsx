"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    branchId?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Role → Dashboard path mapping ──────────────────────────

const ROLE_DASHBOARD: Record<string, string> = {
    ADMIN: "/admin/dashboard",
    BRANCH_MANAGER: "/bm/dashboard",
    SALES_EXECUTIVE: "/bm/dashboard",
    KITCHEN_MANAGER: "/bm/dashboard",
    INVENTORY_MANAGER: "/bm/inventory",
    FINANCE_MANAGER: "/fm/dashboard",
    EVENT_MANAGER: "/em/dashboard",
    VENDOR: "/em/vendors",
    CUSTOMER: "/bm/bookings",
};

export function getRoleDashboard(role: string): string {
    return ROLE_DASHBOARD[role] || "/admin/dashboard";
}

// ─── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Restore session from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await apiPost<{ user: User; token: string }>("/auth/login", { email, password });

            if (res.success && res.data) {
                const { user: userData, token: authToken } = res.data;
                setUser(userData);
                setToken(authToken);
                localStorage.setItem("token", authToken);
                localStorage.setItem("user", JSON.stringify(userData));

                // Redirect based on role
                router.push(getRoleDashboard(userData.role));
                return { success: true };
            }

            return { success: false, error: res.error || "Login failed" };
        } catch {
            return { success: false, error: "Network error" };
        }
    }, [router]);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token && !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
