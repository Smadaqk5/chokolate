"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone_number: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl font-bold text-center mb-2">Create Account</h1>
      <p className="text-[var(--muted)] text-center mb-8">Join Phylgood Chocolates</p>
      <form onSubmit={handleSubmit} className="card p-8 space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <input required className="input" placeholder="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <input required className="input" placeholder="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </div>
        <input required type="email" className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Phone Number" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
        <input required type="password" minLength={6} className="input" placeholder="Password (min 6 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Creating..." : "Create Account"}</button>
        <p className="text-center text-sm text-[var(--muted)]">Already have an account? <Link href="/login" className="text-[var(--accent)] hover:underline">Sign In</Link></p>
      </form>
    </div>
  );
}
