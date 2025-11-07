"use client";

import { usePathname } from "next/navigation";
import PublicNavbar from "../components/PublicNavbar"; // ✅ use public navbar instead of admin one

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // ✅ Hide Navbar only on login and registration pages
  const hideNavbar =
    pathname === "/student/login" ||
    pathname === "/parent/login" ||
    pathname.startsWith("/register");

  return (
    <>
      {/* ✅ Show Public Navbar everywhere except auth/register pages */}
      {!hideNavbar && <PublicNavbar />}

      {/* ✅ Unified main wrapper for consistent spacing */}
      <main className="min-h-screen flex flex-col">
        {children}
      </main>
    </>
  );
}
