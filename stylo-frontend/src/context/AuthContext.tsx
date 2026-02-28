"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "stylo_jwt";

export interface User {
  id: number;
  full_name: string;
  email: string;
  avatar_url?: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Helper ──────────────────────────────────────────────────────────────────

async function fetchMe(token: string): Promise<User | null> {
  try {
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true, // true on mount while we check localStorage
    error: null,
  });

  // Restore session from localStorage on first mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    fetchMe(token).then((user) => {
      setState({ user, isLoading: false, error: null });
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Invalid email or password.");
      }
      const { access_token } = await res.json();
      localStorage.setItem(TOKEN_KEY, access_token);
      const user = await fetchMe(access_token);
      setState({ user, isLoading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : "Login failed.",
      }));
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const res = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name: name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail ?? "Registration failed.");
        }
        const { access_token } = await res.json();
        localStorage.setItem(TOKEN_KEY, access_token);
        const user = await fetchMe(access_token);
        setState({ user, isLoading: false, error: null });
      } catch (err) {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: err instanceof Error ? err.message : "Signup failed.",
        }));
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, isLoading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
