import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "./utils";

const TOKEN_KEY = "tsl_auth_token";

export interface AuthUser {
    id: number;
    login: string;
}

interface UseAuthReturn {
    user: AuthUser | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
}

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

/** 在需要鑒權的 fetch 裡使用，自動帶上 Bearer token */
export function authHeaders(): HeadersInit {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /** 用現有 token 驗證身份，拿回 user info */
    const fetchMe = useCallback(async (token: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser({ id: data.id, login: data.login });
            } else {
                // token 過期或無效
                clearToken();
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Mount：從 localStorage 讀 token，驗證一次
    useEffect(() => {
        // OAuth callback 帶回的 token 在 URL fragment（?token=...）
        // github.rs 的 redirect 是 /?token=<jwt>（fragment 不會送到 server）
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");

        if (urlToken) {
            // 把 token 存起來，清掉 URL
            saveToken(urlToken);
            const clean = new URL(window.location.href);
            clean.searchParams.delete("token");
            window.history.replaceState({}, "", clean.toString());
            fetchMe(urlToken);
        } else {
            const stored = getToken();
            if (stored) {
                fetchMe(stored);
            } else {
                setIsLoading(false);
            }
        }
    }, [fetchMe]);

    const login = useCallback(() => {
        window.location.href = `${API_BASE_URL}/api/auth/github`;
    }, []);

    const logout = useCallback(() => {
        clearToken();
        setUser(null);
        // 通知後端（optional，JWT 是 stateless 但保持一致的介面）
        fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST" }).catch(
            () => {},
        );
    }, []);

    return { user, isLoading, login, logout };
};
