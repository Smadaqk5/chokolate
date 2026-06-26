"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminReportsPage() {
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    api.getSalesReport(period).then(setReport).catch(console.error);
  }, [period]);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Sales Reports</h1>
      <select className="input max-w-xs mb-6" value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="day">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
      </select>
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: report.total_orders },
            { label: "Completed", value: report.completed_orders },
            { label: "Revenue", value: `KES ${Number(report.total_revenue).toLocaleString()}` },
            { label: "Avg Order Value", value: `KES ${Math.round(Number(report.average_order_value)).toLocaleString()}` },
          ].map((c) => (
            <div key={c.label} className="card p-6">
              <p className="text-sm text-[var(--muted)]">{c.label}</p>
              <p className="text-2xl font-bold mt-1">{String(c.value)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
