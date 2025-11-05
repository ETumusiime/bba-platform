"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext"; // ✅ access global cart

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart(); // ✅ real-time access

  // 🧮 Calculate total quantity across all items
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // 🧭 Page visibility rules
  const hideCartOn = ["/login", "/register", "/dashboard", "/book-selection"];
  const showCart = !hideCartOn.includes(pathname);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("👋 Logged out successfully");
    router.replace("/admin/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-blue-700 text-white shadow-md">
      <h1
        onClick={() => router.push("/")}
        className="text-lg font-semibold cursor-pointer"
      >
        Bethel Bridge Academy
      </h1>

      <div className="flex items-center space-x-6">
        {/* Dashboard link only visible to logged-in admin routes */}
        {!pathname.startsWith("/admin") && (
          <Link
            href="/dashboard"
            className="hover:text-blue-200 transition duration-200"
          >
            Dashboard
          </Link>
        )}

        {/* Logout visible on all authenticated routes */}
        {pathname !== "/login" && (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        )}

        {/* 🛒 Cart Icon (hidden on some pages) */}
        {showCart && (
          <div className="relative cursor-pointer">
            <Link href="/cart">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9h14l-2-9M9 21a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
            </Link>

            {/* 🔴 Badge */}
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
