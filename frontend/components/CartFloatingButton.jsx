"use client";

import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

export default function CartFloatingButton() {
  const { cart, totalPrice } = useCart();
  const router = useRouter();

  if (!cart.length) return null; // Hide if cart empty

  const itemCount = cart.reduce((acc, i) => acc + (i.quantity || 1), 0);

  return (
    <div
      onClick={() => router.push("/cart")}
      className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white 
                 rounded-full shadow-lg cursor-pointer flex items-center gap-2 px-5 py-3 z-50"
    >
      <span className="text-xl">🛒</span>
      <span className="font-semibold">{itemCount} item{itemCount > 1 && "s"}</span>
      <span className="text-sm opacity-80">
        UGX {Number(totalPrice).toLocaleString()}
      </span>
    </div>
  );
}
