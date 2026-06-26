"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Star, ShoppingBag, Minus, Plus } from "lucide-react";
import { api, Product } from "@/lib/api";
import { formatPrice, mediaUrl } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [customization, setCustomization] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    api.getProduct(slug).then(setProduct).catch(console.error);
  }, [slug]);

  if (!product) return <div className="p-12 text-center">Loading...</div>;

  const coverImage = product.images.find((i) => i.is_cover) || product.images[0];
  const variation = product.variations.find((v) => v.id === selectedVariation);
  const price = variation?.price || product.sale_price || product.regular_price;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price,
      quantity,
      image: coverImage?.image_path,
      customization: customization || undefined,
      variationId: selectedVariation || undefined,
      variationName: variation?.variation_name,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="relative aspect-square bg-cream-dark rounded-sm overflow-hidden">
          <Image src={mediaUrl(coverImage?.image_path)} alt={product.name} fill className="object-cover" priority />
        </div>

        <div>
          {product.category_name && <p className="text-sm text-[var(--muted)] uppercase tracking-wider mb-2">{product.category_name}</p>}
          <h1 className="font-serif text-4xl font-bold mb-4">{product.name}</h1>
          {product.average_rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(product.average_rating) ? "fill-gold text-gold" : "text-[var(--border)]"} />
              ))}
              <span className="text-sm text-[var(--muted)]">({product.review_count} reviews)</span>
            </div>
          )}
          <div className="mb-6">
            <span className="text-2xl font-semibold">{formatPrice(price)}</span>
            {product.sale_price && !variation && (
              <span className="text-lg text-[var(--muted)] line-through ml-3">{formatPrice(product.regular_price)}</span>
            )}
          </div>
          <p className="text-[var(--muted)] mb-6 leading-relaxed">{product.full_description || product.short_description}</p>

          {product.variations.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Option</label>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v.id)}
                    className={`px-4 py-2 border rounded-sm text-sm ${selectedVariation === v.id ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)]"}`}
                  >
                    {v.variation_name} — {formatPrice(v.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.customizable && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Customization</label>
              <input type="text" value={customization} onChange={(e) => setCustomization(e.target.value)} placeholder="e.g. Name to engrave" className="input" />
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-[var(--border)] rounded-sm">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-[var(--card)]"><Minus size={16} /></button>
              <span className="px-4 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-[var(--card)]"><Plus size={16} /></button>
            </div>
            <button onClick={handleAdd} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <ShoppingBag size={18} /> Add to Cart
            </button>
          </div>

          <div className="text-sm text-[var(--muted)] space-y-1">
            <p>SKU: {product.sku}</p>
            {product.pickup_available && <p>✓ Pickup available at Kimathi Chambers</p>}
            {product.delivery_available && <p>✓ Delivery available across Nairobi</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
