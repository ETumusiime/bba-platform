"use client";

import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  ShoppingCart,
  DollarSign,
  ArrowRight,
  Loader2,
  History,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    parents: 0,
    students: 0,
    books: 0,
    orders: 0,
    revenue: 0,
  });

  const [activity, setActivity] = useState([]);

  const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  /* ------------------------------------------------------------- */
  /* 🔐 AUTH CHECK (layout handles it, but we wait to mount UI)    */
  /* ------------------------------------------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("bba_admin_token");
    if (token) setMounted(true);
  }, []);

  /* ------------------------------------------------------------- */
  /* 📊 LOAD METRICS + ACTIVITY                                   */
  /* ------------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("bba_admin_token");

        const res = await fetch(`${API}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();

        if (json.success) {
          setStats(json.stats);
          setActivity(json.activity);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [API]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-200">
        Loading…
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* METRIC CARD COMPONENT                                         */
  /* ------------------------------------------------------------- */
  const Metric = ({ icon, label, value }) => (
    <div className="bg-gray-800 rounded-xl p-6 shadow text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-gray-300 text-sm">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );

  /* ------------------------------------------------------------- */
  /* QUICK ACTION COMPONENT                                        */
  /* ------------------------------------------------------------- */
  const QuickAction = ({ title, href }) => (
    <a
      href={href}
      className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 shadow flex justify-between items-center transition text-white"
    >
      <div>
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-sm text-gray-300">Click to open →</div>
      </div>
      <ArrowRight size={20} className="text-indigo-300" />
    </a>
  );

  /* ------------------------------------------------------------- */
  /* FINAL CLEAN DASHBOARD UI                                     */
  /* ------------------------------------------------------------- */
  return (
    <div className="space-y-10">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* METRICS */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <Metric icon={<Users size={26} />} label="Parents" value={stats.parents} />
          <Metric icon={<GraduationCap size={26} />} label="Students" value={stats.students} />
          <Metric icon={<BookOpen size={26} />} label="Books" value={stats.books} />
          <Metric icon={<ShoppingCart size={26} />} label="Orders" value={stats.orders} />
          <Metric
            icon={<DollarSign size={26} />}
            label="Revenue"
            value={`UGX ${stats.revenue.toLocaleString()}`}
          />
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction title="Assign Access Code" href="/admin/assign-code" />
          <QuickAction title="Manage Books" href="/admin/books-management" />
          <QuickAction title="View Orders" href="/admin/orders" />
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          {activity.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No recent activity yet.</p>
          ) : (
            <div className="space-y-4">
              {activity.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 border-b border-gray-700 pb-3 last:border-none"
                >
                  <History size={18} className="mt-1 text-indigo-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
