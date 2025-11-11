"use client";

import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CartFloatingButton() {
  const router = useRouter();
  const { cart } = useCart();
  const [animate, setAnimate] = useState(false);

  // 🧮 Count total books (sum of all quantities)
  const bookCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  useEffect(() => {
    if (cart.length === 0) return;
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 400);
    return () => clearTimeout(timer);
  }, [cart]);

  if (!cart.length) return null;

  return (
    <button
      onClick={() => router.push("/cart")}
      className={`fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 
                  rounded-full text-white font-semibold shadow-lg z-50
                  transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 
                  ${animate ? "scale-110" : "scale-100"}`}
    >
      🛒 {bookCount} {bookCount === 1 ? "book added" : "books added"}
    </button>
  );
}
