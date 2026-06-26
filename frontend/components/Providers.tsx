"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <LayoutShell>{children}</LayoutShell>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
