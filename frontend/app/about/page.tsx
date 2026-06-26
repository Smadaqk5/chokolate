export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">About Phylgood Chocolates</h1>
      <div className="prose prose-lg max-w-none text-[var(--muted)] space-y-6">
        <p className="text-xl text-[var(--foreground)] leading-relaxed">
          Welcome to Phylgood Chocolates — Nairobi&apos;s premier destination for luxury gifting. We craft exquisite chocolates, curate stunning floral arrangements, and assemble bespoke gift hampers that turn ordinary moments into unforgettable memories.
        </p>
        <p>
          Founded with a passion for quality and a love for the art of gifting, every product in our collection is handcrafted with premium ingredients and presented with the elegance your loved ones deserve.
        </p>
        <p>
          Whether you&apos;re celebrating a birthday, anniversary, wedding, or simply want to brighten someone&apos;s day, our team is dedicated to creating gifts that speak from the heart.
        </p>
        <div className="card p-8 not-prose">
          <h2 className="font-serif text-2xl font-semibold mb-4">Visit Us</h2>
          <p className="text-[var(--muted)]">Kimathi Chambers, 2nd Floor, Room 209</p>
          <p className="text-[var(--muted)] mt-2">Phone: <a href="tel:+254720516533" className="text-[var(--accent)]">0720 516 533</a></p>
        </div>
      </div>
    </div>
  );
}
