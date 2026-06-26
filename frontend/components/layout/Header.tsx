"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X, Sun, Moon, User, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/occasions", label: "Occasions" },
  { href: "/gift-box", label: "Gift Box" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-[var(--card)]/95 backdrop-blur border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="font-serif text-2xl md:text-3xl font-bold text-[var(--primary)] tracking-wide">
            Phylgood <span className="text-[var(--accent)]">Chocolates</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-[var(--accent)] transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 hover:text-[var(--accent)] transition" aria-label="Toggle theme">
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link href="/wishlist" className="p-2 hover:text-[var(--accent)] transition hidden sm:block" aria-label="Wishlist">
              <Heart size={20} />
            </Link>
            <Link href={user ? "/dashboard" : "/login"} className="p-2 hover:text-[var(--accent)] transition" aria-label="Account">
              <User size={20} />
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-xs font-medium text-[var(--accent)] hidden md:block">Admin</Link>
            )}
            <Link href="/cart" className="relative p-2 hover:text-[var(--accent)] transition" aria-label="Cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--accent)] text-[var(--primary)] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-[var(--border)] bg-[var(--card)] px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 font-medium" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          {isAdmin && <Link href="/admin" className="block py-2 font-medium text-[var(--accent)]" onClick={() => setOpen(false)}>Admin Dashboard</Link>}
        </nav>
      )}
    </header>
  );
}
