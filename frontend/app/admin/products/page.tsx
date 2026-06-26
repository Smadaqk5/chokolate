"use client";

import { useEffect, useState } from "react";
import { api, Product } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts({ page_size: 100, status: "active" }).then((r) => setProducts(r.items)).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Product Management</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">SKU</th>
              <th className="text-left p-4">Category</th>
              <th className="text-right p-4">Price</th>
              <th className="text-right p-4">Stock</th>
              <th className="text-left p-4">Flags</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[var(--border)]">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-[var(--muted)]">{p.sku}</td>
                <td className="p-4">{p.category_name}</td>
                <td className="p-4 text-right">{formatPrice(p.sale_price || p.regular_price)}</td>
                <td className="p-4 text-right">{p.stock_quantity}</td>
                <td className="p-4">
                  <div className="flex gap-1 flex-wrap">
                    {p.featured && <span className="text-xs bg-gold/20 px-2 py-0.5 rounded">Featured</span>}
                    {p.best_seller && <span className="text-xs bg-blue-100 px-2 py-0.5 rounded">Best Seller</span>}
                    {p.new_arrival && <span className="text-xs bg-green-100 px-2 py-0.5 rounded">New</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
