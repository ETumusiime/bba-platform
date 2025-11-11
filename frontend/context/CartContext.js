"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // 🧭 Load from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bba_cart");
      if (stored) setCart(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load cart:", e);
    }
  }, []);

  // 💾 Persist cart changes to localStorage
  useEffect(() => {
    if (cart && Array.isArray(cart)) {
      try {
        localStorage.setItem("bba_cart", JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to save cart:", e);
      }
    }
  }, [cart]);

  /* -------------------------------------------------------------------------- */
  /* ➕ Add Book — fully idempotent merge                                       */
  /* -------------------------------------------------------------------------- */
  const addBook = (book) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.isbn === book.isbn || i.book_isbn === book.isbn
      );

      let updated;
      if (existing) {
        updated = prev.map((i) =>
          i.isbn === book.isbn || i.book_isbn === book.isbn
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
        toast.success("📚 Book quantity increased");
      } else {
        updated = [
          ...prev,
          {
            isbn: book.isbn,
            title: book.title,
            price: Number(book.price || 0),
            quantity: 1,
            cover_url:
              book.cover_url?.startsWith?.("http")
                ? book.cover_url
                : book.image_url?.startsWith?.("http")
                ? book.image_url
                : `${API}${book.image_url || book.cover_url || ""}`,
            book_isbn: book.isbn,
          },
        ];
        toast.success("🛒 Book added to cart");
      }

      // ✅ Persist new state immediately
      try {
        localStorage.setItem("bba_cart", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist updated cart:", e);
      }

      return updated;
    });
  };

  /* -------------------------------------------------------------------------- */
  /* ➖ Update Quantity                                                        */
  /* -------------------------------------------------------------------------- */
  const updateQuantity = (isbn, quantity) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.isbn === isbn || i.book_isbn === isbn
            ? { ...i, quantity: Math.max(1, Number(quantity) || 1) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  /* -------------------------------------------------------------------------- */
  /* ❌ Remove Book                                                           */
  /* -------------------------------------------------------------------------- */
  const removeBook = (isbn) => {
    setCart((prev) => {
      const updated = prev.filter(
        (i) => i.isbn !== isbn && i.book_isbn !== isbn
      );
      localStorage.setItem("bba_cart", JSON.stringify(updated));
      toast("🗑️ Book removed from cart", { icon: "🗑️" });
      return updated;
    });
  };

  /* -------------------------------------------------------------------------- */
  /* 🧹 Clear Cart                                                            */
  /* -------------------------------------------------------------------------- */
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("bba_cart");
    toast("🧹 Cart cleared");
  };

  /* -------------------------------------------------------------------------- */
  /* 💰 Compute Total                                                         */
  /* -------------------------------------------------------------------------- */
  const totalPrice = cart.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addBook, updateQuantity, removeBook, clearCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}
