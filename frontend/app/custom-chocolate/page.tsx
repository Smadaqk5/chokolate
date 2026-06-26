"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

const CHOCOLATE_TYPES = [
  { id: "dark", name: "Dark Chocolate", price: 800 },
  { id: "milk", name: "Milk Chocolate", price: 700 },
  { id: "white", name: "White Chocolate", price: 750 },
];

const SHAPES = ["Heart", "Bar", "Round", "Square", "Custom Letter"];
const TOPPINGS = ["Almonds", "Hazelnuts", "Sea Salt", "Gold Dust", "Dried Fruit", "Caramel"];

export default function CustomChocolatePage() {
  const [type, setType] = useState("dark");
  const [shape, setShape] = useState("Heart");
  const [toppings, setToppings] = useState<string[]>([]);
  const [engraving, setEngraving] = useState("");
  const { addItem } = useCart();

  const basePrice = CHOCOLATE_TYPES.find((t) => t.id === type)?.price || 800;
  const toppingPrice = toppings.length * 100;
  const total = basePrice + toppingPrice + (engraving ? 200 : 0);

  const toggleTopping = (t: string) => {
    setToppings((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const addToCart = () => {
    addItem({
      productId: `custom-${Date.now()}`,
      name: `Custom ${CHOCOLATE_TYPES.find((t) => t.id === type)?.name} (${shape})`,
      slug: "custom-chocolate",
      price: total,
      customization: `Shape: ${shape}, Toppings: ${toppings.join(", ") || "None"}${engraving ? `, Engraving: ${engraving}` : ""}`,
    });
    alert("Custom chocolate added to cart!");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-bold mb-2">Custom Chocolate Builder</h1>
      <p className="text-[var(--muted)] mb-12">Design your perfect personalized chocolate</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">Chocolate Type</h2>
            <div className="grid grid-cols-3 gap-3">
              {CHOCOLATE_TYPES.map((t) => (
                <button key={t.id} onClick={() => setType(t.id)} className={`p-3 border rounded-sm text-sm ${type === t.id ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)]"}`}>
                  {t.name}<br /><span className="text-xs text-[var(--muted)]">{formatPrice(t.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">Shape</h2>
            <div className="flex flex-wrap gap-2">
              {SHAPES.map((s) => (
                <button key={s} onClick={() => setShape(s)} className={`px-4 py-2 border rounded-sm text-sm ${shape === s ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)]"}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">Toppings (+KES 100 each)</h2>
            <div className="flex flex-wrap gap-2">
              {TOPPINGS.map((t) => (
                <button key={t} onClick={() => toggleTopping(t)} className={`px-4 py-2 border rounded-sm text-sm ${toppings.includes(t) ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)]"}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">Engraving (+KES 200)</h2>
            <input className="input" placeholder="Name or message to engrave" value={engraving} onChange={(e) => setEngraving(e.target.value)} maxLength={20} />
          </div>
        </div>

        <div className="card p-8 h-fit sticky top-24">
          <h2 className="font-serif text-2xl font-semibold mb-6">Your Creation</h2>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between"><span>Type</span><span>{CHOCOLATE_TYPES.find((t) => t.id === type)?.name}</span></div>
            <div className="flex justify-between"><span>Shape</span><span>{shape}</span></div>
            <div className="flex justify-between"><span>Toppings</span><span>{toppings.join(", ") || "None"}</span></div>
            {engraving && <div className="flex justify-between"><span>Engraving</span><span>{engraving}</span></div>}
          </div>
          <div className="border-t border-[var(--border)] pt-4 mb-6">
            <div className="flex justify-between text-xl font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <button onClick={addToCart} className="btn-primary w-full mb-3">Add to Cart</button>
          <Link href="/shop" className="btn-outline w-full block text-center">Browse Products</Link>
        </div>
      </div>
    </div>
  );
}
