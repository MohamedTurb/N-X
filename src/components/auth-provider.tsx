"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, type AuthUser } from "../services/auth-api";
import { useToast } from "./toast-provider";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setSession: (token: string, user: AuthUser) => void;
};

const AUTH_STORAGE_KEY = "nox-auth-v1";

const AuthContext = createContext<AuthContextValue | null>(null);

type StoredSession = {
  token: string;
  user: AuthUser;
};

function loadSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function saveSession(session: StoredSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const { showToast } = useToast();

  useEffect(() => {
    const session = loadSession();

    if (session) {
      setToken(session.token);
      setUser(session.user);
      setStatus("authenticated");
      return;
    }

    setStatus("anonymous");
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const setSession = (nextToken: string, nextUser: AuthUser) => {
      setToken(nextToken);
      setUser(nextUser);
      setStatus("authenticated");
      saveSession({ token: nextToken, user: nextUser });
    };

    const logout = () => {
      setToken(null);
      setUser(null);
      setStatus("anonymous");
      saveSession(null);
      showToast("Signed out", "info");
    };

    const login = async (email: string, password: string) => {
      const response = await authApi.login({ email, password });
      setSession(response.token, response.user);
      showToast("Welcome back", "success");
    };

    const register = async (username: string, email: string, password: string) => {
      const response = await authApi.register({ username, email, password });
      setSession(response.token, response.user);
      showToast("Account created", "success");
    };

    return {
      user,
      token,
      status,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      setSession,
    };
  }, [showToast, status, token, user]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!token || !user) {
      saveSession(null);
      return;
    }

    saveSession({ token, user });
  }, [status, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}