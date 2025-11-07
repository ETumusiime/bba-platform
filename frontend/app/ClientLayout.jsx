"use client";

import { usePathname } from "next/navigation";
import PublicNavbar from "../components/PublicNavbar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // ✅ Only show PublicNavbar on homepage and info pages
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/faq");

  return (
    <>
      {isPublic && <PublicNavbar />}
      <main className="min-h-screen flex flex-col">{children}</main>
    </>
  );
}
