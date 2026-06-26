import Link from "next/link";
import { Phone, MapPin } from "lucide-react";

export default function Footer() {
  const tiktokUrl = "https://www.tiktok.com/@phylgoodchocolates_ke?is_from_webapp=1&sender_device=pc";
  const mapsUrl = "https://maps.google.com/?q=Kimathi+Chambers";

  return (
    <footer className="bg-chocolate text-cream mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="font-serif text-2xl font-bold text-gold mb-4">Phylgood Chocolates</h3>
            <p className="text-cream/80 text-sm leading-relaxed">
              Premium luxury gifting — handcrafted chocolates, flowers, pastries, and curated hampers for every occasion.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg text-gold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><Link href="/shop" className="hover:text-gold transition">Shop</Link></li>
              <li><Link href="/occasions" className="hover:text-gold transition">Shop by Occasion</Link></li>
              <li><Link href="/gift-box" className="hover:text-gold transition">Build a Gift Box</Link></li>
              <li><Link href="/gallery" className="hover:text-gold transition">Gallery</Link></li>
              <li><Link href="/faq" className="hover:text-gold transition">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg text-gold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-cream/80">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-gold" />
                <a href="tel:+254720516533" className="hover:text-gold transition">0720 516 533</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-gold" />
                <a href="https://wa.me/254720516533" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition">WhatsApp: 0720 516 533</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                <span>Kimathi Chambers, 2nd Floor, Room 209</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg text-gold mb-4">Follow Us</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li>
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition">TikTok</a>
              </li>
              <li>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition">Google Maps</a>
              </li>
              <li><Link href="/privacy" className="hover:text-gold transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gold transition">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/20 mt-12 pt-8 text-center text-sm text-cream/60">
          <p>&copy; {new Date().getFullYear()} Phylgood Chocolates. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
