"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import { api, Product, Category } from "@/lib/api";

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const category = searchParams.get("category") || "";
  const occasion = searchParams.get("occasion") || "";

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number | boolean> = { page_size: 24, sort };
    if (category) params.category = category;
    if (occasion) params.occasion = occasion;
    if (search) params.search = search;
    api.getProducts(params).then((r) => setProducts(r.items)).catch(console.error).finally(() => setLoading(false));
  }, [category, occasion, search, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-bold mb-2">Shop</h1>
      <p className="text-[var(--muted)] mb-8">Discover our premium collection of luxury gifts</p>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-md"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input max-w-xs">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <a href="/shop" className={`px-4 py-2 text-sm border rounded-sm ${!category && !occasion ? "bg-[var(--primary)] text-white" : "border-[var(--border)]"}`}>All</a>
        {categories.map((cat) => (
          <a key={cat.id} href={`/shop?category=${cat.slug}`} className={`px-4 py-2 text-sm border rounded-sm ${category === cat.slug ? "bg-[var(--primary)] text-white" : "border-[var(--border)]"}`}>
            {cat.name}
          </a>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="card aspect-square animate-pulse bg-[var(--border)]" />)}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-[var(--muted)] py-20">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
