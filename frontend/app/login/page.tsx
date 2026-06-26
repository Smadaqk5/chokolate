"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      const me = await api.getMe();
      const isStaff = me.role === "Admin" || me.role === "Staff";
      router.push(isStaff ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl font-bold text-center mb-2">Welcome Back</h1>
      <p className="text-[var(--muted)] text-center mb-8">Sign in to your account</p>
      <form onSubmit={handleSubmit} className="card p-8 space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input required type="email" className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" className="input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Signing in..." : "Sign In"}</button>
        <p className="text-center text-sm text-[var(--muted)]">Don&apos;t have an account? <Link href="/register" className="text-[var(--accent)] hover:underline">Register</Link></p>
      </form>
    </div>
  );
}
