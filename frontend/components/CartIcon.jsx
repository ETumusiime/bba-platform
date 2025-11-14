"use client";

import { useRouter } from "next/navigation";
import { useCart } from "../app/context/CartContext";  // ✅ fixed path
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function CartIcon() {
  const { cart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [bottomOffset, setBottomOffset] = useState(24);

  const hideRoutes = [
    "/",
    "/login",
    "/register",
    "/parent/login",
    "/student/login",
    "/admin/login",
    "/success",
    "/dashboard"
  ];

  if (hideRoutes.includes(pathname)) return null;

  const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

  useEffect(() => {
    const resize = () => {
      setBottomOffset(window.innerWidth < 768 ? 72 : 24);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const goToCart = () => {
    router.push("/cart");
    setTimeout(() => window.scrollTo({ top: 0 }), 1);
  };

  return (
    <button
      onClick={goToCart}
      className="fixed right-6 z-[9999] bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-all flex items-center justify-center"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <ShoppingCartIcon className="h-6 w-6" />

      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
}
