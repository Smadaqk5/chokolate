export default function FAQPage() {
  const faqs = [
    { q: "How do I place an order?", a: "Browse our shop, add items to your cart, and proceed to checkout. You can choose pickup or delivery." },
    { q: "How do I pay?", a: "We accept M-Pesa payments. After placing your order, pay to our Till Number and use your order number as reference. Our team will verify and confirm your payment." },
    { q: "Where is the pickup location?", a: "Kimathi Chambers, 2nd Floor, Room 209. You'll receive a notification when your order is ready for collection." },
    { q: "Do you deliver?", a: "Yes! We deliver across Nairobi. Delivery fees vary by zone and are shown at checkout." },
    { q: "Can I customize my gift?", a: "Absolutely! Many of our products support customization. Use our Gift Box Builder or Custom Chocolate Builder for personalized gifts." },
    { q: "What is your return policy?", a: "Due to the perishable nature of our products, we cannot accept returns. However, if there's an issue with your order, please contact us immediately." },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-[var(--muted)] mb-12">Everything you need to know about ordering from Phylgood Chocolates</p>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="card p-6 group">
            <summary className="font-serif text-lg font-semibold cursor-pointer list-none flex justify-between items-center">
              {faq.q}
              <span className="text-[var(--accent)] group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-[var(--muted)] mt-4 leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
