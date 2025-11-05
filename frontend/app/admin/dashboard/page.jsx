"use client";
import { useRouter } from "next/navigation";
import { FaBook, FaPlusCircle, FaUsers, FaClipboardList } from "react-icons/fa";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <main className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* 🔹 Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">📊 Admin Dashboard</h1>
        <button
          onClick={() => router.push("/admin/upload-book")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          + Upload New Book
        </button>
      </div>

      {/* 🔹 Quick Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-md rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
          <FaBook className="text-blue-600 text-3xl" />
          <div>
            <p className="text-gray-500 text-sm">Total Books</p>
            <h2 className="text-xl font-bold text-gray-800">328</h2>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
          <FaUsers className="text-green-600 text-3xl" />
          <div>
            <p className="text-gray-500 text-sm">Registered Parents</p>
            <h2 className="text-xl font-bold text-gray-800">142</h2>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
          <FaClipboardList className="text-yellow-500 text-3xl" />
          <div>
            <p className="text-gray-500 text-sm">Pending Orders</p>
            <h2 className="text-xl font-bold text-gray-800">27</h2>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
          <FaPlusCircle className="text-purple-600 text-3xl" />
          <div>
            <p className="text-gray-500 text-sm">New This Week</p>
            <h2 className="text-xl font-bold text-gray-800">12</h2>
          </div>
        </div>
      </section>

      {/* 🔹 Recent Activity Section */}
      <section className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🕒 Recent Activities</h2>
        <ul className="divide-y divide-gray-100">
          {[
            "Uploaded new Year 11 Physics book",
            "Approved 5 new parent registrations",
            "Updated prices for Upper Secondary books",
            "Reviewed 2 pending orders",
          ].map((activity, i) => (
            <li key={i} className="py-3 text-gray-700 text-sm flex justify-between items-center">
              <span>{activity}</span>
              <span className="text-gray-400 text-xs">2h ago</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
