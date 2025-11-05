"use client";
import { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-gray">
      {/* Sidebar (fixed for desktop, slide-in for mobile) */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <AdminNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
