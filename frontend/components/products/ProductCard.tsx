"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Star } from "lucide-react";
import { Product } from "@/lib/api";
import { formatPrice, mediaUrl } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const coverImage = product.images.find((i) => i.is_cover) || product.images[0];
  const price = product.sale_price || product.regular_price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price,
      image: coverImage?.image_path,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card group"
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-cream-dark">
          <Image
            src={mediaUrl(coverImage?.image_path)}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width:768px) 100vw, 25vw"
          />
          {product.sale_price && (
            <span className="absolute top-3 left-3 bg-gold text-chocolate text-xs font-bold px-2 py-1">SALE</span>
          )}
          {product.new_arrival && (
            <span className="absolute top-3 right-3 bg-chocolate text-gold text-xs font-bold px-2 py-1">NEW</span>
          )}
        </div>
        <div className="p-4">
          {product.category_name && (
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">{product.category_name}</p>
          )}
          <h3 className="font-serif text-lg font-semibold mb-1 group-hover:text-[var(--accent)] transition">{product.name}</h3>
          {product.average_rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star size={14} className="fill-gold text-gold" />
              <span className="text-xs text-[var(--muted)]">{product.average_rating} ({product.review_count})</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{formatPrice(price)}</span>
              {product.sale_price && (
                <span className="text-sm text-[var(--muted)] line-through ml-2">{formatPrice(product.regular_price)}</span>
              )}
            </div>
            <button
              onClick={handleAdd}
              className="p-2 bg-[var(--primary)] text-white rounded-sm hover:bg-[var(--accent)] hover:text-[var(--primary)] transition"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
