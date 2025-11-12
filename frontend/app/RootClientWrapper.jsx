"use client";

import React from "react";
import { CartProvider } from "../context/CartContext"; // ✅ Single shared context
import CartIcon from "../components/CartIcon";
import ClientLayout from "./ClientLayout";

export default function RootClientWrapper({ children }) {
  return (
    <CartProvider>
      <ClientLayout>{children}</ClientLayout>
      <CartIcon />
    </CartProvider>
  );
}
