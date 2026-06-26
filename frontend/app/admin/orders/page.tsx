"use client";

import { useEffect, useState } from "react";
import { api, Order } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

const STATUSES = ["awaiting_payment", "payment_confirmed", "preparing", "ready_for_pickup", "out_for_delivery", "completed", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    const params: Record<string, string> = {};
    if (filter) params.status = filter;
    if (search) params.search = search;
    api.getAdminOrders(params).then((r) => setOrders(r.items)).catch(console.error);
  };

  useEffect(() => { load(); }, [filter, search]);

  const updateStatus = async (orderId: string, status: string) => {
    await api.updateOrderStatus(orderId, status);
    load();
  };

  const markPaid = async (orderId: string) => {
    await api.verifyPayment(orderId);
    load();
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Order Management</h1>
      <div className="flex gap-4 mb-6">
        <input className="input max-w-xs" placeholder="Search order number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--card)]">
              <th className="text-left p-4">Order</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Method</th>
              <th className="text-right p-4">Total</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-[var(--border)]">
                <td className="p-4 font-medium">{o.order_number}</td>
                <td className="p-4">{o.guest_name || o.guest_email || "—"}</td>
                <td className="p-4"><span className="capitalize px-2 py-1 bg-[var(--accent)]/10 rounded-sm text-xs">{o.order_status.replace(/_/g, " ")}</span></td>
                <td className="p-4 capitalize">{o.delivery_method}</td>
                <td className="p-4 text-right font-semibold">{formatPrice(o.total)}</td>
                <td className="p-4">
                  <div className="flex gap-2 flex-wrap">
                    {o.order_status === "awaiting_payment" && (
                      <button onClick={() => markPaid(o.id)} className="text-xs btn-accent py-1 px-2">Mark Paid</button>
                    )}
                    <select onChange={(e) => updateStatus(o.id, e.target.value)} defaultValue="" className="text-xs border rounded-sm px-2 py-1">
                      <option value="" disabled>Update Status</option>
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
