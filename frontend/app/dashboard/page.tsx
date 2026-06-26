"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api, Order } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) api.getMyOrders().then(setOrders).catch(console.error);
  }, [user, loading, router]);

  if (loading || !user) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold">My Dashboard</h1>
          <p className="text-[var(--muted)]">Welcome, {user.first_name}!</p>
        </div>
        <button onClick={logout} className="btn-outline text-sm">Sign Out</button>
      </div>

      <div className="card p-6 mb-8">
        <h2 className="font-serif text-xl font-semibold mb-4">Account Details</h2>
        <p><strong>Email:</strong> {user.email}</p>
        {user.phone_number && <p><strong>Phone:</strong> {user.phone_number}</p>}
      </div>

      <h2 className="font-serif text-2xl font-semibold mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-[var(--muted)]">No orders yet. <Link href="/shop" className="text-[var(--accent)]">Start shopping</Link></p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{order.order_number}</p>
                <p className="text-sm text-[var(--muted)] capitalize">{order.order_status.replace(/_/g, " ")} • {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(order.total)}</p>
                <Link href={`/track-order?order=${order.order_number}`} className="text-sm text-[var(--accent)]">Track</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
