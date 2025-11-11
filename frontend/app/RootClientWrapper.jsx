"use client";

import React from "react";
import { GlobalProviders } from "./providers.jsx";
import ClientLayout from "./ClientLayout";
import { CartProvider } from "../context/CartContext"; // ✅ Global Cart Context
import CartFloatingButton from "../components/CartFloatingButton"; // ✅ Floating Cart Button

export default function RootClientWrapper({ children }) {
  return (
    <GlobalProviders>
      {/* ✅ CartProvider wraps entire client tree to persist cart across routes */}
      <CartProvider>
        <ClientLayout>{children}</ClientLayout>

        {/* ✅ Global floating cart button (visible when items exist) */}
        <CartFloatingButton />
      </CartProvider>
    </GlobalProviders>
  );
}
