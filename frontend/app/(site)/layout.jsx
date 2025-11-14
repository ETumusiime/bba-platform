"use client";

import PublicNavbar from "../../components/PublicNavbar";
import { usePathname } from "next/navigation";

export default function SiteLayout({ children }) {
  const pathname = usePathname();

  // Show navbar ONLY on homepage + info pages
  const showNavbar =
    pathname === "/" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/faq");

  return (
    <>
      {showNavbar && <PublicNavbar />}
      <main className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </main>
    </>
  );
}
