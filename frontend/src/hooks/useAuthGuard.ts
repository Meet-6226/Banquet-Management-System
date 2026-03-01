"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Redirect to login if not authenticated.
 * Optionally restrict to specific roles.
 */
export function useAuthGuard(allowedRoles?: string[]) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace("/");
            return;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            router.replace("/");
        }
    }, [isAuthenticated, isLoading, user, allowedRoles, router]);

    return { isLoading, isAuthenticated, user };
}
