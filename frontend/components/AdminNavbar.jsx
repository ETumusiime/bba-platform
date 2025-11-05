"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    // 🔐 Clear all admin session data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");

    toast.success("👋 Logged out successfully");

    // ✅ Use replace instead of push to prevent "back navigation" to protected pages
    router.replace("/admin/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-blue-700 text-white shadow-md">
      <h1 className="text-lg font-semibold tracking-wide">BBA Admin</h1>

      <div className="flex items-center space-x-5">
        <Link
          href="/admin/books-management"
          className="hover:text-blue-200 transition duration-200"
        >
          📚 Manage Books
        </Link>

        <Link
          href="/admin/upload-book"
          className="hover:text-blue-200 transition duration-200"
        >
          📘 Upload Book
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded transition font-medium"
        >
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}
