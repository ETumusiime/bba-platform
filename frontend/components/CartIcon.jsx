"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function CartIcon() {
  const { cart } = useCart();
  const [bottomOffset, setBottomOffset] = useState(24);

  // ✅ Always visible (ignore routes & login for now)
  const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

  // ✅ Adjust for mobile screen height
  useEffect(() => {
    const handleResize = () => {
      setBottomOffset(window.innerWidth < 768 ? 72 : 24);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Link
      href="/cart"
      className="fixed right-6 z-[9999] bg-indigo-600 hover:bg-indigo-700
                 text-white rounded-full p-3 shadow-lg transition-all duration-200
                 flex items-center justify-center group"
      style={{ bottom: `${bottomOffset}px` }}
      title="View Cart"
    >
      <ShoppingCartIcon className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
      {totalItems > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                     font-semibold rounded-full w-5 h-5 flex items-center justify-center"
        >
          {totalItems}
        </span>
      )}
    </Link>
  );
}
