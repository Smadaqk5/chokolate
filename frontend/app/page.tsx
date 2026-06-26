"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gift, Heart, Sparkles } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { api, Product, Category, Occasion } from "@/lib/api";

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);

  useEffect(() => {
    api.getProducts({ featured: true, page_size: 8 }).then((r) => setFeatured(r.items)).catch(console.error);
    api.getCategories().then(setCategories).catch(console.error);
    api.getOccasions().then(setOccasions).catch(console.error);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-chocolate text-cream overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,#d4af37_0%,transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <p className="text-gold uppercase tracking-[0.3em] text-sm mb-4">Premium Luxury Gifting</p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
              Gifts Crafted with <span className="text-gold">Love</span>
            </h1>
            <p className="text-cream/80 text-lg mb-8 leading-relaxed">
              Discover handcrafted chocolates, exquisite flowers, artisan pastries, and curated hampers — perfect for every special moment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-accent inline-flex items-center gap-2">
                Shop Collection <ArrowRight size={18} />
              </Link>
              <Link href="/gift-box" className="btn-outline border-cream/30 text-cream hover:bg-cream/10 inline-flex items-center gap-2">
                Build a Gift Box <Gift size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Sparkles, title: "Handcrafted Quality", desc: "Every gift is made with premium ingredients and meticulous care." },
            { icon: Gift, title: "Custom Gift Boxes", desc: "Build your own personalized gift box with our curated selection." },
            { icon: Heart, title: "Made with Love", desc: "From our kitchen in Nairobi to your loved ones — with passion." },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6">
              <f.icon className="mx-auto mb-4 text-[var(--accent)]" size={32} />
              <h3 className="font-serif text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-[var(--muted)] text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Explore our curated collections of premium gifts</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="card p-6 text-center hover:border-[var(--accent)] transition group">
                <h3 className="font-serif text-lg font-semibold group-hover:text-[var(--accent)] transition">{cat.name}</h3>
                <p className="text-xs text-[var(--muted)] mt-1">{cat.product_count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="section-title">Featured Collection</h2>
          <p className="section-subtitle">Our most loved gifts, handpicked for you</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
              View All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="section-title">Shop by Occasion</h2>
          <p className="section-subtitle">Find the perfect gift for every celebration</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {occasions.slice(0, 10).map((occ) => (
              <Link key={occ.id} href={`/shop?occasion=${occ.slug}`} className="card p-4 text-center hover:shadow-md transition">
                <h3 className="font-serif font-semibold">{occ.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-chocolate text-cream">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl font-bold mb-4">Ready to Spread Joy?</h2>
          <p className="text-cream/80 mb-8">Visit us at Kimathi Chambers, 2nd Floor, Room 209 — or order online for pickup and delivery.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="btn-accent">Start Shopping</Link>
            <Link href="/contact" className="btn-outline border-cream/30 text-cream">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
