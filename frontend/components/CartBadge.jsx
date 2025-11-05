"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function CartBadge() {
  const { cart } = useCart();
  const itemCount = cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition"
      title="View Cart"
    >
      {/* 🛒 Cart Icon */}
      <ShoppingCartIcon className="w-7 h-7 text-gray-700" />

      {/* 🔢 Badge Count */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
