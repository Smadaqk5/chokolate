import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Phylgood Chocolates | Premium Luxury Gifting",
  description: "Handcrafted chocolates, flowers, pastries, gummies, and curated gift hampers. Premium luxury gifting in Nairobi, Kenya.",
  keywords: ["chocolates", "gifts", "Nairobi", "luxury", "hampers", "flowers"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
