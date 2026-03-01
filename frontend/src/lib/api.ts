"use client";

/**
 * Centralised API client.
 * All requests go through /api/* which is proxied to the backend via Next.js rewrites.
 */

const API_BASE = "/api";

interface ApiOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    token?: string;
}

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export async function api<T = unknown>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<ApiResponse<T>> {
    const { method = "GET", body, token } = options;

    // Read token from localStorage if not provided
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    try {
        const init: RequestInit = { method, headers };
        if (body) init.body = JSON.stringify(body);

        const res = await fetch(`${API_BASE}${endpoint}`, init);

        const json = await res.json();
        return json;
    } catch (err) {
        console.error("[API Error]", err);
        return { success: false, error: "Network error. Is the backend running?" };
    }
}

// ─── Convenience methods ────────────────────────────────────

export const apiGet = <T = unknown>(endpoint: string) =>
    api<T>(endpoint, { method: "GET" });

export const apiPost = <T = unknown>(endpoint: string, body: unknown) =>
    api<T>(endpoint, { method: "POST", body });

export const apiPut = <T = unknown>(endpoint: string, body: unknown) =>
    api<T>(endpoint, { method: "PUT", body });

export const apiDelete = <T = unknown>(endpoint: string) =>
    api<T>(endpoint, { method: "DELETE" });
