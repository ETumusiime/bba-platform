"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function PublicNavbar() {
  const router = useRouter();

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* 🏫 Logo / Home */}
        <h1
          className="text-2xl sm:text-3xl font-bold text-indigo-700 cursor-pointer"
          onClick={() => router.push("/")}
        >
          Bethel Bridge Academy
        </h1>

        {/* 🔗 Navigation Links */}
        <div className="hidden sm:flex gap-4 items-center">
          {/* ✅ Student Login (opens working student portal) */}
          <button
            onClick={() => router.push("/student/login")}
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow"
          >
            🧑‍🎓 Student Login
          </button>

          {/* ✅ Parent Login (opens working parent portal) */}
          <button
            onClick={() => router.push("/parent/login")}
            className="px-4 py-2 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-medium"
          >
            👩‍👧 Parent Login
          </button>

          {/* ✅ Info Pages */}
          <button
            onClick={() => router.push("/about")}
            className="px-4 py-2 rounded-md text-gray-600 hover:text-indigo-700 text-sm"
          >
            About
          </button>
          <button
            onClick={() => router.push("/contact")}
            className="px-4 py-2 rounded-md text-gray-600 hover:text-indigo-700 text-sm"
          >
            Contact
          </button>
          <button
            onClick={() => router.push("/faq")}
            className="px-4 py-2 rounded-md text-gray-600 hover:text-indigo-700 text-sm"
          >
            FAQ
          </button>
        </div>
      </nav>
    </header>
  );
}
