"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  Image, Star, BarChart3, MessageSquare, LogOut
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push("/login");
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-chocolate text-cream shrink-0 hidden md:block">
        <div className="p-6 border-b border-cream/10">
          <Link href="/admin" className="font-serif text-xl font-bold text-gold">Admin Panel</Link>
          <p className="text-xs text-cream/60 mt-1">Phylgood Chocolates</p>
        </div>
        <nav className="p-4 space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm transition ${active ? "bg-gold/20 text-gold" : "hover:bg-cream/10"}`}>
                <Icon size={18} /> {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-cream/10 mt-auto">
          <Link href="/" className="block text-sm text-cream/60 hover:text-gold mb-3">← Back to Store</Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-cream/60 hover:text-red-400"><LogOut size={16} /> Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 bg-[var(--background)] overflow-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
