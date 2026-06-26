"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice, mediaUrl } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-4xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-[var(--muted)] mb-8">Discover our premium collection and find the perfect gift.</p>
        <Link href="/shop" className="btn-primary inline-flex items-center gap-2">Continue Shopping <ArrowRight size={18} /></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">Shopping Cart</h1>
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variationId || ""}`} className="card p-4 flex gap-4 items-center">
            <div className="relative w-20 h-20 shrink-0 bg-cream-dark rounded-sm overflow-hidden">
              <Image src={mediaUrl(item.image)} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <Link href={`/product/${item.slug}`} className="font-serif font-semibold hover:text-[var(--accent)]">{item.name}</Link>
              {item.variationName && <p className="text-sm text-[var(--muted)]">{item.variationName}</p>}
              {item.customization && <p className="text-sm text-[var(--muted)]">Custom: {item.customization}</p>}
              <p className="font-medium mt-1">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variationId)} className="p-1 border rounded-sm"><Minus size={14} /></button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variationId)} className="p-1 border rounded-sm"><Plus size={14} /></button>
            </div>
            <p className="font-semibold w-24 text-right">{formatPrice(item.price * item.quantity)}</p>
            <button onClick={() => removeItem(item.productId, item.variationId)} className="p-2 text-red-500 hover:bg-red-50 rounded-sm"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <div className="flex justify-between text-xl font-semibold mb-6">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
          Proceed to Checkout <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
