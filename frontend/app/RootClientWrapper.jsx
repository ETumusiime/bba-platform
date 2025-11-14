"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "./context/CartContext";
import CartIcon from "../components/CartIcon";
import ClientLayout from "./ClientLayout";

export default function RootClientWrapper({ children }) {
  const pathname = usePathname();

  console.log("CURRENT PATHNAME ===>", pathname);

  /* -----------------------------------------------------------
   * 1️⃣ ROUTES THAT MUST NEVER USE ClientLayout
   *    (all shop pages must render standalone)
   * ----------------------------------------------------------- */
  const noLayoutPrefixes = [
    "/cart",
    "/checkout",
    "/books",   // ← REQUIRED FIX
    "/shop"     // ← fallback safety
  ];

  const disableLayout = noLayoutPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  /* -----------------------------------------------------------
   * 2️⃣ TRUE BOOK DETAIL PAGES (only these show cart icon)
   * ----------------------------------------------------------- */
  const isBookDetail =
    pathname.startsWith("/books/") &&
    !pathname.includes("/byYear/") &&
    !pathname.match(/\/books\/byYear\/[^/]+$/) &&
    !pathname.includes("book-selection");

  /* -----------------------------------------------------------
   * 3️⃣ ROUTES WHERE CART MUST NEVER SHOW
   * ----------------------------------------------------------- */
  const hideCartPrefixes = [
    "/login",
    "/register",
    "/parent/login",
    "/student/login",
    "/admin/login",
    "/dashboard",
    "/success",
    "/cart",
    "/checkout",
    "/book-selection",
  ];

  const shouldHideCart =
    pathname === "/" ||
    hideCartPrefixes.some((prefix) => pathname.startsWith(prefix));

  /* -----------------------------------------------------------
   * 4️⃣ FINAL DECISION
   * ----------------------------------------------------------- */
  const showCartIcon = isBookDetail && !shouldHideCart;

  /* -----------------------------------------------------------
   * 5️⃣ RENDER
   * ----------------------------------------------------------- */
  return (
    <CartProvider>
      {disableLayout ? children : <ClientLayout>{children}</ClientLayout>}
      {showCartIcon && <CartIcon />}
    </CartProvider>
  );
}
