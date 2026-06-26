"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy } from "lucide-react";
import { api, Order, BusinessSettings } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (orderNumber) api.trackOrder(orderNumber).then(setOrder).catch(console.error);
    api.getSettings().then(setSettings).catch(console.error);
  }, [orderNumber]);

  const copyTill = () => {
    navigator.clipboard.writeText(settings?.mpesa_till_number || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) return <div className="p-12 text-center">Loading order details...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle className="mx-auto text-green-500 mb-6" size={64} />
      <h1 className="font-serif text-4xl font-bold mb-2">Order Placed!</h1>
      <p className="text-[var(--muted)] mb-8">Thank you for choosing Phylgood Chocolates</p>

      <div className="card p-8 text-left mb-8">
        <p className="text-sm text-[var(--muted)] mb-1">Order Number</p>
        <p className="font-serif text-2xl font-bold text-[var(--accent)] mb-6">{order.order_number}</p>

        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/30 p-6 rounded-sm mb-6">
          <h2 className="font-serif text-xl font-semibold mb-4">Payment Instructions</h2>
          <p className="mb-2">Please complete your M-Pesa payment:</p>
          <div className="flex items-center justify-between bg-[var(--card)] p-4 rounded-sm mb-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Till Number</p>
              <p className="text-2xl font-bold">{settings?.mpesa_till_number || "Contact us"}</p>
            </div>
            <button onClick={copyTill} className="btn-outline text-sm flex items-center gap-1">
              <Copy size={14} /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="font-semibold">Amount: {formatPrice(order.total, settings?.currency)}</p>
          <p className="text-sm text-[var(--muted)] mt-2">Use your order number as the payment reference.</p>
        </div>

        {order.delivery_method === "pickup" && (
          <div className="p-4 bg-cream-dark rounded-sm mb-4">
            <p className="font-semibold mb-1">Pickup Location</p>
            <p className="text-sm whitespace-pre-line">Kimathi Chambers{"\n"}2nd Floor, Room 209</p>
            <p className="text-sm text-[var(--muted)] mt-3">You will receive a notification once your order is ready for collection.</p>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Status</span><span className="font-medium capitalize">{order.order_status.replace(/_/g, " ")}</span></div>
          <div className="flex justify-between"><span>Total</span><span className="font-semibold">{formatPrice(order.total)}</span></div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href={`/track-order?order=${order.order_number}`} className="btn-primary">Track Order</Link>
        <Link href="/shop" className="btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
