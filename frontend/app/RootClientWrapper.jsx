"use client";

import React from "react";
import ClientLayout from "./ClientLayout";
import { CartProvider } from "../context/CartContext";
import CartIcon from "../components/CartIcon";
import { usePathname } from "next/navigation";

export default function RootClientWrapper({ children }) {
  const pathname = usePathname();

  /**
   * 👇 Pages where ClientLayout must NOT be used
   * (login pages should be very clean, no menu, no layout)
   */
  const noLayoutRoutes = [
    "/login",
    "/register",
    "/parent/login",
    "/student/login",
    "/admin/login"
  ];

  /**
   * 👇 Pages where the floating Cart Icon MUST NOT appear
   */
  const hideCartIconRoutes = [
    "/",
    "/login",
    "/register",
    "/parent/login",
    "/student/login",
    "/admin/login",
    "/dashboard",
    "/admin",
    "/parent",
    "/success"
  ];

  const disableLayout = noLayoutRoutes.includes(pathname);
  const hideCartIcon = hideCartIconRoutes.includes(pathname);

  return (
    <CartProvider>
      {/* Layout Engine */}
      {disableLayout ? children : <ClientLayout>{children}</ClientLayout>}

      {/* Floating Cart Icon - only on allowed pages */}
      {!hideCartIcon && <CartIcon />}
    </CartProvider>
  );
}
