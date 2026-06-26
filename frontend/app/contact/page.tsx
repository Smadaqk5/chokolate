"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { api } from "@/lib/api";

const MAPS_EMBED = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.673483897343!2d36.81889237448293!3d-1.2823687356208324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f11fb2e00e4cd%3A0x4cc3600212b09277!2sKimathi%20Chambers.!5e1!3m2!1sen!2ske!4v1782430669129!5m2!1sen!2ske" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitContact(form);
      setSent(true);
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">Contact Us</h1>
        <p className="text-[var(--muted)]">We&apos;d love to hear from you</p>
        <p className="font-serif text-2xl text-[var(--accent)] mt-4">Phylgood Chocolates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-serif text-xl font-semibold mb-6">Get in Touch</h2>
            <div className="space-y-4">
              <a href="tel:+254720516533" className="flex items-center gap-3 hover:text-[var(--accent)] transition">
                <Phone className="text-[var(--accent)]" size={20} />
                <span>0720 516 533</span>
              </a>
              <a href="https://wa.me/254720516533" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[var(--accent)] transition">
                <Phone className="text-[var(--accent)]" size={20} />
                <span>WhatsApp: 0720 516 533</span>
              </a>
              <a href="mailto:info@phylgoodchocolates.com" className="flex items-center gap-3 hover:text-[var(--accent)] transition">
                <Mail className="text-[var(--accent)]" size={20} />
                <span>info@phylgoodchocolates.com</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="text-[var(--accent)] mt-0.5" size={20} />
                <div>
                  <p className="font-medium">Pickup Location</p>
                  <p className="text-sm text-[var(--muted)]">Kimathi Chambers, 2nd Floor, Room 209</p>
                  <a href="https://maps.google.com/?q=Kimathi+Chambers" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm mt-3 inline-block">Get Directions</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-[var(--accent)] mt-0.5" size={20} />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-[var(--muted)] whitespace-pre-line">{"Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">Send a Message</h2>
            {sent ? (
              <p className="text-green-600">Thank you! Your message has been sent.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input required type="email" className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input required className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <textarea required className="input" rows={4} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                  <Send size={18} /> {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="w-full aspect-video" dangerouslySetInnerHTML={{ __html: MAPS_EMBED.replace('width="600"', 'width="100%"').replace('height="450"', 'height="100%"') }} />
        </div>
      </div>
    </div>
  );
}
