"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import CartBadge from "@/components/CartBadge";

export default function Navbar() {
  const [title, setTitle] = useState("Bethel Bridge Academy");

  useEffect(() => {
    // 🧠 Detect which user type is logged in
    const adminToken = localStorage.getItem("adminToken");
    const parentToken = localStorage.getItem("parentToken");

    if (adminToken) {
      setTitle("BBA Admin Panel");
    } else if (parentToken) {
      setTitle("BBA Parent Portal");
    } else {
      setTitle("Bethel Bridge Academy");
    }
  }, []);

  return (
    <nav
      className="
        w-full sticky top-0 z-50
        bg-gradient-to-r from-[#003b73] via-[#004c91] to-[#0066b2]
        text-white shadow-lg transition-all duration-300
      "
    >
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        {/* 🌐 Dynamic Title */}
        <Link
          href="/dashboard"
          className="text-xl md:text-2xl font-semibold tracking-wide hover:opacity-90 transition"
        >
          {title}
        </Link>

        {/* 🔗 Navigation Links + Cart */}
        <div className="flex items-center gap-6">
          <Link
            href="/book-selection"
            className="text-sm md:text-base font-medium hover:text-yellow-300 transition"
          >
            Books
          </Link>

          <Link
            href="/dashboard"
            className="text-sm md:text-base font-medium hover:text-yellow-300 transition"
          >
            Dashboard
          </Link>

          <Link
            href="/logout"
            className="bg-red-600 hover:bg-red-700 text-sm md:text-base px-3 py-1 rounded-md font-medium transition"
          >
            Logout
          </Link>

          {/* 🛒 Cart Icon with Badge */}
          <CartBadge />
        </div>
      </div>
    </nav>
  );
}
