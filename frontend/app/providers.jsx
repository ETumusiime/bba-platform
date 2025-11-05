"use client";
import React from "react";
import { CartProvider } from "@/context/CartContext";

export function GlobalProviders({ children }) {
  console.log("🛒 CartProvider mounted globally via GlobalProviders");
  return <CartProvider>{children}</CartProvider>;
}
