"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin/books-management", label: "📚 Books" },
    { href: "/admin/parents-management", label: "👨‍👩‍👧 Parents" },
    { href: "/admin/orders-management", label: "🧾 Orders" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex bg-white shadow-card w-64 h-screen fixed left-0 top-0 flex-col border-r border-gray-200 z-40">
        <div className="px-6 py-4 text-brand-blue font-bold text-lg border-b">
          Admin Menu
        </div>
        <nav className="flex-1 overflow-y-auto">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-6 py-3 font-medium text-sm transition ${
                  active
                    ? "bg-brand-blue text-white"
                    : "text-gray-700 hover:bg-brand-gray hover:text-brand-blue"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-card transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="px-6 py-4 text-brand-blue font-bold text-lg border-b flex justify-between items-center">
          <span>Admin Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-xl font-bold text-gray-500 hover:text-brand-blue"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)} // auto-close on navigation
                className={`block px-6 py-3 font-medium text-sm transition ${
                  active
                    ? "bg-brand-blue text-white"
                    : "text-gray-700 hover:bg-brand-gray hover:text-brand-blue"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
