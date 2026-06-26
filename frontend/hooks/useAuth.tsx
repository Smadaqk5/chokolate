"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { first_name: string; last_name: string; email: string; phone_number?: string; password: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.getMe().then(setUser).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem("token", res.access_token);
    setUser(res.user);
  };

  const register = async (data: { first_name: string; last_name: string; email: string; phone_number?: string; password: string }) => {
    const res = await api.register(data);
    localStorage.setItem("token", res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const isAdmin = user?.role === "Admin" || user?.role === "Staff";

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
