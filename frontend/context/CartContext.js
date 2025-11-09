"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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
  const isHydrated = useRef(false);

  /* -------------------------------------------------------------------------- */
  /* 🧭 Load cart from localStorage (only once)                                 */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (isHydrated.current) return; // prevent rehydrating multiple times
    try {
      const stored = localStorage.getItem("bba_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (e) {
      console.error("Failed to load cart:", e);
    } finally {
      isHydrated.current = true;
    }
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 💾 Save cart to localStorage every time it changes                         */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem("bba_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [cart]);

  /* -------------------------------------------------------------------------- */
  /* ➕ Add a Book (guaranteed append, not overwrite)                           */
  /* -------------------------------------------------------------------------- */
  const addBook = async (book) => {
    if (!book?.isbn) {
      toast.error("Invalid book data");
      return;
    }

    const normalized = {
      isbn: book.isbn,
      title: book.title,
      price: Number(book.price || book.price_ugx || 0),
      quantity: 1,
      cover_url:
        book.cover_url?.startsWith?.("http")
          ? book.cover_url
          : book.image_url?.startsWith?.("http")
          ? book.image_url
          : `${API}${book.image_url || book.cover_url || ""}`,
      book_isbn: book.isbn,
    };

    setCart((prevCart) => {
      const existing = prevCart.find(
        (i) => i.isbn === normalized.isbn || i.book_isbn === normalized.isbn
      );

      if (existing) {
        toast.success("📚 Quantity increased");
        const updated = prevCart.map((i) =>
          i.isbn === normalized.isbn || i.book_isbn === normalized.isbn
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
        localStorage.setItem("bba_cart", JSON.stringify(updated)); // immediate persistence
        return updated;
      }

      toast.success("🛒 Added to cart");
      const updated = [...prevCart, normalized];
      localStorage.setItem("bba_cart", JSON.stringify(updated)); // immediate persistence
      return updated;
    });

    // optional backend sync (non-blocking)
    try {
      await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, book_isbn: book.isbn, quantity: 1 }),
      });
    } catch {
      // silent fallback
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🔢 Update Quantity                                                         */
  /* -------------------------------------------------------------------------- */
  const updateQuantity = (isbn, quantity) => {
    setCart((prevCart) => {
      const updated = prevCart
        .map((i) =>
          i.isbn === isbn || i.book_isbn === isbn
            ? { ...i, quantity: Math.max(1, Number(quantity) || 1) }
            : i
        )
        .filter((i) => (i.quantity || 1) > 0);

      localStorage.setItem("bba_cart", JSON.stringify(updated));
      return updated;
    });
  };

  /* -------------------------------------------------------------------------- */
  /* ❌ Remove Book                                                             */
  /* -------------------------------------------------------------------------- */
  const removeBook = async (isbn) => {
    setCart((prevCart) => {
      const updated = prevCart.filter(
        (i) => i.isbn !== isbn && i.book_isbn !== isbn
      );
      localStorage.setItem("bba_cart", JSON.stringify(updated));
      return updated;
    });

    toast("🗑️ Removed from cart", { icon: "🗑️" });

    try {
      await fetch(`/api/cart/remove/${isbn}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1 }),
      });
    } catch {
      // ignore sync errors
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🧹 Clear Cart                                                              */
  /* -------------------------------------------------------------------------- */
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("bba_cart");
    toast("🧹 Cart cleared");
  };

  /* -------------------------------------------------------------------------- */
  /* 💰 Total Price                                                             */
  /* -------------------------------------------------------------------------- */
  const totalPrice = cart.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
    0
  );

  /* -------------------------------------------------------------------------- */
  /* 🎁 Provide Context                                                         */
  /* -------------------------------------------------------------------------- */
  return (
    <CartContext.Provider
      value={{
        cart,
        addBook,
        updateQuantity,
        removeBook,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
