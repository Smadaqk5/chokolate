"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { api, BusinessSettings } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [form, setForm] = useState({
    guest_name: user ? `${user.first_name} ${user.last_name}` : "",
    guest_email: user?.email || "",
    guest_phone: user?.phone_number || "",
    gift_message: "",
    notes: "",
    preferred_date: "",
    preferred_time: "",
    recipient_name: "",
    address: "",
    city: "Nairobi",
    landmark: "",
    delivery_notes: "",
    delivery_phone: "",
  });

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  useEffect(() => {
    if (items.length === 0) router.push("/cart");
  }, [items.length, router]);

  if (items.length === 0) {
    return <div className="p-12 text-center">Redirecting to cart...</div>;
  }

  const deliveryFee = deliveryMethod === "delivery" ? (settings?.delivery_charge || 500) : 0;
  const orderTotal = total + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const order = await api.placeOrder({
        items: items.map((i) => ({
          product_id: i.productId,
          variation_id: i.variationId,
          quantity: i.quantity,
          customization: i.customization,
        })),
        delivery_method: deliveryMethod,
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        guest_phone: form.guest_phone,
        gift_message: form.gift_message,
        notes: form.notes,
        preferred_date: form.preferred_date,
        preferred_time: form.preferred_time,
        delivery_info: deliveryMethod === "delivery" ? {
          recipient_name: form.recipient_name,
          address: form.address,
          city: form.city,
          landmark: form.landmark,
          delivery_notes: form.delivery_notes,
          phone: form.delivery_phone,
        } : undefined,
        pickup_info: deliveryMethod === "pickup" ? {
          pickup_date: form.preferred_date,
          pickup_time: form.preferred_time,
        } : undefined,
      });
      clearCart();
      router.push(`/order-confirmation?order=${order.order_number}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">Delivery Method</h2>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setDeliveryMethod("pickup")} className={`p-4 border rounded-sm text-left ${deliveryMethod === "pickup" ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)]"}`}>
                <p className="font-semibold">Pickup</p>
                <p className="text-sm text-[var(--muted)]">Collect from our store</p>
              </button>
              <button type="button" onClick={() => setDeliveryMethod("delivery")} className={`p-4 border rounded-sm text-left ${deliveryMethod === "delivery" ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)]"}`}>
                <p className="font-semibold">Delivery</p>
                <p className="text-sm text-[var(--muted)]">{formatPrice(settings?.delivery_charge || 500)} fee</p>
              </button>
            </div>

            {deliveryMethod === "pickup" && (
              <div className="mt-4 p-4 bg-cream-dark rounded-sm">
                <p className="font-semibold mb-1">Pickup Point</p>
                <p className="text-sm whitespace-pre-line">Kimathi Chambers{"\n"}2nd Floor, Room 209</p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">Your Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required className="input" placeholder="Full Name" value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} />
              <input required type="email" className="input" placeholder="Email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} />
              <input required className="input" placeholder="Phone Number" value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} />
              <input type="date" className="input" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
              <input className="input" placeholder="Preferred Time" value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })} />
            </div>
          </div>

          {deliveryMethod === "delivery" && (
            <div className="card p-6">
              <h2 className="font-serif text-xl font-semibold mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required className="input md:col-span-2" placeholder="Recipient Name" value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} />
                <input required className="input md:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <input required className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input className="input" placeholder="Landmark" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
                <input className="input" placeholder="Delivery Phone" value={form.delivery_phone} onChange={(e) => setForm({ ...form, delivery_phone: e.target.value })} />
                <textarea className="input md:col-span-2" placeholder="Delivery Notes" rows={2} value={form.delivery_notes} onChange={(e) => setForm({ ...form, delivery_notes: e.target.value })} />
              </div>
            </div>
          )}

          <div className="card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">Gift Message (Optional)</h2>
            <textarea className="input" rows={3} placeholder="Write a personal message..." value={form.gift_message} onChange={(e) => setForm({ ...form, gift_message: e.target.value })} />
            <textarea className="input mt-4" rows={2} placeholder="Order notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>
            {items.map((item) => (
              <div key={`${item.productId}-${item.variationId}`} className="flex justify-between text-sm mb-2">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-[var(--border)] mt-4 pt-4 space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{formatPrice(deliveryFee)}</span></div>
              <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{formatPrice(orderTotal)}</span></div>
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
