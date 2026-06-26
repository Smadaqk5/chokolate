export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">Terms & Conditions</h1>
      <div className="space-y-6 text-[var(--muted)] leading-relaxed">
        <p>By using the Phylgood Chocolates website and placing orders, you agree to these terms and conditions.</p>
        <h2 className="font-serif text-2xl font-semibold text-[var(--foreground)]">Orders & Payment</h2>
        <p>All orders require M-Pesa payment to our designated Till Number. Orders are confirmed only after payment verification by our team.</p>
        <h2 className="font-serif text-2xl font-semibold text-[var(--foreground)]">Pickup & Delivery</h2>
        <p>Pickup is available at Kimathi Chambers, 2nd Floor, Room 209. Delivery is available within Nairobi with applicable fees.</p>
        <h2 className="font-serif text-2xl font-semibold text-[var(--foreground)]">Product Quality</h2>
        <p>We strive for the highest quality in all our products. Due to the perishable nature of our items, returns are not accepted unless there is a quality issue reported within 24 hours.</p>
        <h2 className="font-serif text-2xl font-semibold text-[var(--foreground)]">Contact</h2>
        <p>Questions about these terms? Reach us at 0720 516 533 or info@phylgoodchocolates.com.</p>
      </div>
    </div>
  );
}
