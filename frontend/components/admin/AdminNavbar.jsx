"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    toast.success("👋 Logged out successfully");
    router.replace("/admin/login");
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="flex justify-between items-center px-6 py-3">
        {/* Left section: Logo / Title */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => router.push("/admin/dashboard")}
        >

        </div>

        {/* Right section: User info */}
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-medium hidden sm:inline">
            Welcome, Admin
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
