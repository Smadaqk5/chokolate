"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.getCustomers().then(setCustomers).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Customers</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[var(--border)]"><th className="text-left p-4">Name</th><th className="text-left p-4">Email</th><th className="text-left p-4">Phone</th><th className="text-right p-4">Orders</th><th className="text-right p-4">Total Spent</th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={String(c.id)} className="border-b border-[var(--border)]">
                <td className="p-4">{String(c.first_name)} {String(c.last_name)}</td>
                <td className="p-4">{String(c.email)}</td>
                <td className="p-4">{String(c.phone_number || "—")}</td>
                <td className="p-4 text-right">{String(c.order_count)}</td>
                <td className="p-4 text-right">{formatPrice(Number(c.total_spent))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
