"use client";

import React from "react";
import { GlobalProviders } from "./providers.jsx";
import ClientLayout from "./ClientLayout";
import { CartProvider } from "../context/CartContext";
import CartIcon from "../components/CartIcon"; // ✅ Relative import, not @/

export default function RootClientWrapper({ children }) {
  return (
    <GlobalProviders>
      <CartProvider>
        <ClientLayout>{children}</ClientLayout>

        {/* ✅ Global Cart Icon (fixed bottom-right, visible for logged-in users) */}
        <CartIcon />
      </CartProvider>
    </GlobalProviders>
  );
}
