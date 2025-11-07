"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/* 🛒 Context Setup                                                            */
/* -------------------------------------------------------------------------- */
const CartContext = createContext();
export const useCart = () => useContext(CartContext);

/* -------------------------------------------------------------------------- */
/* 💾 CartProvider — persistent via localStorage                              */
/* -------------------------------------------------------------------------- */
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // 🔄 Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bba_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch (err) {
      console.warn("⚠️ Failed to load cart:", err);
    }
  }, []);

  // 💽 Save to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem("bba_cart", JSON.stringify(cart));
    } catch (err) {
      console.warn("⚠️ Failed to save cart:", err);
    }
  }, [cart]);

  /* ------------------------------------------------------------------------ */
  /* ➕ Add Item / ❌ Remove Item / 🧹 Clear Cart                              */
  /* ------------------------------------------------------------------------ */
  const add = (item) =>
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.isbn === item.isbn);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          qty: (updated[idx].qty || 1) + (item.qty || 1),
        };
        return updated;
      }
      return [...prev, { ...item, qty: item.qty || 1 }];
    });

  const remove = (isbn) => setCart((prev) => prev.filter((p) => p.isbn !== isbn));
  const clear = () => setCart([]);

  /* ------------------------------------------------------------------------ */
  /* 🧱 Return Provider                                                       */
  /* ------------------------------------------------------------------------ */
  return (
    <CartContext.Provider value={{ cart, add, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}
