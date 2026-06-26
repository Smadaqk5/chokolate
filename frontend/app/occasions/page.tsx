"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Occasion } from "@/lib/api";

export default function OccasionsPage() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);

  useEffect(() => {
    api.getOccasions().then(setOccasions).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-bold mb-2">Shop by Occasion</h1>
      <p className="text-[var(--muted)] mb-12">Find the perfect gift for every celebration</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {occasions.map((occ) => (
          <Link key={occ.id} href={`/shop?occasion=${occ.slug}`} className="card p-8 text-center hover:border-[var(--accent)] hover:shadow-lg transition group">
            <h2 className="font-serif text-xl font-semibold group-hover:text-[var(--accent)] transition">{occ.name}</h2>
            <p className="text-sm text-[var(--muted)] mt-2">{occ.product_count} products</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
