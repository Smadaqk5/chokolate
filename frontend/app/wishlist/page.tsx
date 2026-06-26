"use client";

import Link from "next/link";

export default function WishlistPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="font-serif text-4xl font-bold mb-4">Wishlist</h1>
      <p className="text-[var(--muted)] mb-8">Sign in to save your favorite products to your wishlist.</p>
      <Link href="/login" className="btn-primary">Sign In</Link>
    </div>
  );
}
