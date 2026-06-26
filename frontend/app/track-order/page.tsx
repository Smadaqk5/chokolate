"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, Order } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

const STATUS_STEPS = ["awaiting_payment", "payment_confirmed", "preparing", "ready_for_pickup", "out_for_delivery", "completed"];

function TrackContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const track = async () => {
    if (!orderNumber) return;
    setError("");
    try {
      const o = await api.trackOrder(orderNumber);
      setOrder(o);
    } catch {
      setError("Order not found");
      setOrder(null);
    }
  };

  useEffect(() => {
    if (searchParams.get("order")) track();
  }, []);

  const currentStep = order ? STATUS_STEPS.indexOf(order.order_status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8 text-center">Track Your Order</h1>
      <div className="flex gap-2 mb-8">
        <input className="input flex-1" placeholder="Enter order number (e.g. PGC-20250626-1234)" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        <button onClick={track} className="btn-primary">Track</button>
      </div>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {order && (
        <div className="card p-8">
          <p className="text-sm text-[var(--muted)]">Order Number</p>
          <p className="font-serif text-2xl font-bold mb-6">{order.order_number}</p>
          <div className="mb-8">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentStep ? "bg-[var(--accent)] text-[var(--primary)]" : "bg-[var(--border)] text-[var(--muted)]"}`}>{i + 1}</div>
                <span className={`capitalize ${i <= currentStep ? "font-medium" : "text-[var(--muted)]"}`}>{step.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <p className="font-semibold mb-2">Order Total: {formatPrice(order.total)}</p>
            <p className="text-sm text-[var(--muted)] capitalize">Payment: {order.payment_status} • Method: {order.delivery_method}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return <Suspense fallback={<div className="p-12 text-center">Loading...</div>}><TrackContent /></Suspense>;
}
