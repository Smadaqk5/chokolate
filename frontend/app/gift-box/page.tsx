"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { api, Product } from "@/lib/api";
import { formatPrice, mediaUrl } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";

export default function GiftBoxPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const { addItem } = useCart();

  useEffect(() => {
    api.getProducts({ gift_box_item: true, page_size: 50 }).then((r) => setProducts(r.items)).catch(console.error);
  }, []);

  const total = Object.entries(selected).reduce((sum, [id, qty]) => {
    const p = products.find((pr) => pr.id === id);
    return sum + (p ? (p.sale_price || p.regular_price) * qty : 0);
  }, 0);

  const addAllToCart = () => {
    Object.entries(selected).forEach(([id, qty]) => {
      const p = products.find((pr) => pr.id === id);
      if (p && qty > 0) {
        addItem({
          productId: p.id,
          name: p.name,
          slug: p.slug,
          price: p.sale_price || p.regular_price,
          quantity: qty,
          image: p.images[0]?.image_path,
        });
      }
    });
    alert("Gift box items added to cart!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-bold mb-2">Build Your Own Gift Box</h1>
      <p className="text-[var(--muted)] mb-12">Select items to create a personalized luxury gift box</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => {
            const qty = selected[p.id] || 0;
            const cover = p.images.find((i) => i.is_cover) || p.images[0];
            return (
              <div key={p.id} className={`card p-4 ${qty > 0 ? "border-[var(--accent)]" : ""}`}>
                <div className="relative aspect-square mb-3 bg-cream-dark rounded-sm overflow-hidden">
                  <Image src={mediaUrl(cover?.image_path)} alt={p.name} fill className="object-cover" />
                </div>
                <h3 className="font-serif font-semibold">{p.name}</h3>
                <p className="text-sm text-[var(--muted)] mb-3">{formatPrice(p.sale_price || p.regular_price)}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelected({ ...selected, [p.id]: Math.max(0, qty - 1) })} className="p-1 border rounded-sm"><Minus size={14} /></button>
                  <span className="w-8 text-center">{qty}</span>
                  <button onClick={() => setSelected({ ...selected, [p.id]: qty + 1 })} className="p-1 border rounded-sm"><Plus size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-serif text-xl font-semibold mb-4">Your Gift Box</h2>
          {Object.entries(selected).filter(([, q]) => q > 0).length === 0 ? (
            <p className="text-[var(--muted)] text-sm">Select items to build your box</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {Object.entries(selected).filter(([, q]) => q > 0).map(([id, qty]) => {
                const p = products.find((pr) => pr.id === id);
                return p ? <li key={id} className="flex justify-between text-sm"><span>{p.name} x{qty}</span><span>{formatPrice((p.sale_price || p.regular_price) * qty)}</span></li> : null;
              })}
            </ul>
          )}
          <div className="border-t border-[var(--border)] pt-4 mb-4">
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <button onClick={addAllToCart} disabled={total === 0} className="btn-primary w-full flex items-center justify-center gap-2">
            <ShoppingBag size={18} /> Add to Cart
          </button>
          <Link href="/shop" className="btn-outline w-full mt-3 block text-center">Browse More</Link>
        </div>
      </div>
    </div>
  );
}
