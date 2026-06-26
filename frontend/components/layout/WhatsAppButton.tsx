"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/254720516533?text=Hello%20Phylgood%20Chocolates!%20I%20would%20like%20to%20inquire%20about%20your%20products."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-2 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={24} />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">
        Chat on WhatsApp
      </span>
    </a>
  );
}
