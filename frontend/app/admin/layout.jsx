"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  ShoppingCart,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import "../globals.css";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  // Pages that should NOT show sidebar/topbar
  const authPages = ["/admin/login"];

  /* Handle Admin Auth */
  useEffect(() => {
    const token = localStorage.getItem("bba_admin_token");

    // If trying to access protected routes without token → login
    if (!authPages.includes(pathname) && !token) {
      router.replace("/admin/login");
    }

    // If logged in and tries to access login → dashboard
    if (authPages.includes(pathname) && token) {
      router.replace("/admin/dashboard");
    }
  }, [pathname, router]);

  /* Theme handling */
  useEffect(() => {
    const saved = localStorage.getItem("bba_admin_theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem("bba_admin_theme", newDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newDark);
  };

  /* Sidebar Links (Correct Paths Matching Your Real Folders) */
  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    {
      label: "Books Management",
      icon: <BookOpen size={18} />,
      sub: [
        { href: "/admin/books-management", label: "Books Management" },
        { href: "/admin/assign-code", label: "Assign Access Code" },
        { href: "/admin/assignments", label: "View Assignments" },
        { href: "/admin/upload-book", label: "Upload Book" },
        { href: "/admin/view-books", label: "View Books" },
      ],
    },
    { href: "/admin/parents", label: "Parents", icon: <Users size={18} /> },
    { href: "/admin/students", label: "Students", icon: <GraduationCap size={18} /> },
    { href: "/admin/orders", label: "Orders", icon: <ShoppingCart size={18} /> },
  ];

  // Hide layout for login page
  if (authPages.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-4 text-xl font-bold text-indigo-600 dark:text-indigo-400">
          BBA Admin
        </div>

        <nav className="px-2">
          {navItems.map((item, idx) =>
            item.sub ? (
              <div key={idx} className="mb-4">
                <div className="flex items-center gap-2 p-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {item.icon}
                  {item.label}
                </div>

                <div className="ml-6 border-l border-gray-300 dark:border-gray-600">
                  {item.sub.map((sub, sidx) => (
                    <Link
                      key={sidx}
                      href={sub.href}
                      className={`block py-2 pl-4 text-sm ${
                        pathname === sub.href
                          ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                          : "text-gray-500 dark:text-gray-400 hover:text-indigo-500"
                      }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center gap-2 p-2 rounded text-sm mb-1 ${
                  pathname === item.href
                    ? "bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 font-semibold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          )}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1">
        {/* Top Bar */}
        <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
          <div className="font-semibold">Admin Panel</div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("bba_admin_token");
                router.replace("/admin/login");
              }}
              className="bg-red-600 text-white px-3 py-1 text-sm rounded flex items-center gap-1"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
