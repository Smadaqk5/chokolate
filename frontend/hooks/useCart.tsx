"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image?: string;
  customization?: string;
  variationId?: string;
  variationName?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variationId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const key = item.variationId || item.productId;
      const existing = prev.find(
        (i) => i.productId === item.productId && (i.variationId || "") === (item.variationId || "")
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && (i.variationId || "") === (item.variationId || "")
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeItem = (productId: string, variationId?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && (i.variationId || "") === (variationId || "")))
    );
  };

  const updateQuantity = (productId: string, quantity: number, variationId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variationId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && (i.variationId || "") === (variationId || "")
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
