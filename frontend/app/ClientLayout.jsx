"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // ✅ Hide Navbar only on login ("/") and registration pages
  const hideNavbar = pathname === "/" || pathname.startsWith("/register");

  return (
    <>
      {/* ✅ Navbar hidden on login and register pages */}
      {!hideNavbar && <Navbar />}

      {/* ✅ Unified main wrapper for consistent spacing */}
      <main className="min-h-screen flex flex-col">
        {children}
      </main>
    </>
  );
}
