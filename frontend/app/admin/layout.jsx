"use client";

import "../globals.css";

/**
 * 🧭 Admin Layout (Clean Version — No Sidebar)
 * 
 * This layout removes the sidebar from all admin pages.
 * If you ever want to reintroduce a sidebar, 
 * create a nested layout inside specific folders like:
 *    /admin/dashboard/layout.jsx
 * That way, only dashboard pages get the sidebar — not everything.
 */
export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
