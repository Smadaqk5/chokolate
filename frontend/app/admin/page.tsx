"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, Star } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.getDashboard().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div>Loading dashboard...</div>;

  const cards = [
    { label: "Total Orders", value: stats.total_orders, icon: ShoppingCart, color: "text-blue-500" },
    { label: "Pending Orders", value: stats.pending_orders, icon: AlertTriangle, color: "text-orange-500" },
    { label: "Total Revenue", value: formatPrice(stats.total_revenue as number), icon: DollarSign, color: "text-green-500" },
    { label: "Customers", value: stats.total_customers, icon: Users, color: "text-purple-500" },
    { label: "Products", value: stats.total_products, icon: Package, color: "text-indigo-500" },
    { label: "Low Stock", value: stats.low_stock_products, icon: AlertTriangle, color: "text-red-500" },
    { label: "Pending Reviews", value: stats.pending_reviews, icon: Star, color: "text-yellow-500" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted)]">{card.label}</span>
                <Icon size={20} className={card.color} />
              </div>
              <p className="text-2xl font-bold">{String(card.value)}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-xl font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-[var(--accent)]">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--border)]"><th className="text-left py-2">Order</th><th className="text-left py-2">Status</th><th className="text-right py-2">Total</th></tr></thead>
            <tbody>
              {((stats.recent_orders as { order_number: string; order_status: string; total: number }[]) || []).map((o) => (
                <tr key={o.order_number} className="border-b border-[var(--border)]">
                  <td className="py-3">{o.order_number}</td>
                  <td className="py-3 capitalize">{o.order_status.replace(/_/g, " ")}</td>
                  <td className="py-3 text-right">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
