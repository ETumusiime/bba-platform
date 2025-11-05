"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const CartCtx = createContext();
export const useCart = () => useContext(CartCtx);

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // load once
  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("bba_cart") || "[]")); } catch {}
  }, []);

  // save whenever changes
  useEffect(() => {
    try { localStorage.setItem("bba_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  const add = (item) => setCart(prev => {
    const idx = prev.findIndex(p => p.isbn === item.isbn);
    if (idx >= 0) {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], qty: (copy[idx].qty || 1) + (item.qty || 1) };
      return copy;
    }
    return [...prev, { ...item, qty: item.qty || 1 }];
  });

  const remove = (isbn) => setCart(prev => prev.filter(p => p.isbn !== isbn));
  const clear = () => setCart([]);

  return (
    <CartCtx.Provider value={{ cart, add, remove, clear }}>
      {children}
    </CartCtx.Provider>
  );
}
