"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  ShoppingCart,
  CreditCard,
  Cog,
  BarChart3,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

import "../globals.css";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  /* ------------------------------------------------------ */
  /* 🌙 Load saved theme                                    */
  /* ------------------------------------------------------ */
  useEffect(() => {
    const saved = localStorage.getItem("bba_admin_theme");

    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  /* ------------------------------------------------------ */
  /* 🌙 Toggle Theme                                        */
  /* ------------------------------------------------------ */
  const toggleTheme = () => {
    const newMode = !dark;
    setDark(newMode);
    localStorage.setItem("bba_admin_theme", newMode ? "dark" : "light");

    if (newMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  /* ------------------------------------------------------ */
  /* 📌 Sidebar Navigation Items                            */
  /* ------------------------------------------------------ */
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    {
      label: "Books Management",
      icon: <BookOpen size={18} />,
      sub: [
        { href: "/admin/books", label: "All Books" },
        { href: "/admin/assign-code", label: "Assign Access Code" },
        { href: "/admin/assignments", label: "View Assignments" },
      ],
    },
    { href: "/admin/parents", label: "Parents", icon: <Users size={18} /> },
    { href: "/admin/students", label: "Students", icon: <GraduationCap size={18} /> },
    { href: "/admin/orders", label: "Orders", icon: <ShoppingCart size={18} /> },
    { href: "/admin/payments", label: "Payments", icon: <CreditCard size={18} /> },
    { href: "/admin/reports", label: "Reports", icon: <BarChart3 size={18} /> },
    { href: "/admin/settings", label: "Settings", icon: <Cog size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      {/* -------------------------------------------------- */}
      {/* SIDEBAR                                            */}
      {/* -------------------------------------------------- */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-4 text-xl font-bold text-indigo-600 dark:text-indigo-400">
          BethelBridge Admin
        </div>

        <nav className="px-2">
          {navItems.map((item, idx) =>
            item.sub ? (
              <div key={idx} className="mb-4">
                <div className="flex items-center gap-2 p-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {item.icon}
                  {item.label}
                </div>

                <div className="ml-6 border-l border-gray-200 dark:border-gray-700">
                  {item.sub.map((sub, sidx) => (
                    <Link
                      key={sidx}
                      href={sub.href}
                      className={`block py-2 pl-4 pr-2 rounded text-sm
                        ${
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
                className={`flex items-center gap-2 p-2 rounded text-sm mb-1
                  ${
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

      {/* -------------------------------------------------- */}
      {/* MAIN AREA                                          */}
      {/* -------------------------------------------------- */}
      <div className="flex flex-col flex-1">

        {/* ---------------- TOP BAR ---------------- */}
        <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
          <div className="font-semibold text-gray-600 dark:text-gray-200">
            Admin Panel
          </div>

          <div className="flex items-center gap-4">

            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.removeItem("bba_admin_token");
                window.location.href = "/admin/login";
              }}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        {/* ---------------- PAGE CONTENT ---------------- */}
        <main className="p-6 flex-1 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
