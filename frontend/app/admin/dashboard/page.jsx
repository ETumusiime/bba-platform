"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  KeyRound,
  Users,
  GraduationCap,
  ShoppingCart,
  CreditCard,
  Settings,
  BarChart3,
  Bell,
  Search,
  Sun,
  Moon,
  ArrowRight,
  Loader2,
  History,
  DollarSign
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [theme, setTheme] = useState("light");
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

  /* ---------------------------------------------------------------------- */
  /* 🔐 AUTH CHECK                                                          */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("bba_admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    setMounted(true);
  }, [router]);

  /* ---------------------------------------------------------------------- */
  /* 🎨 THEME LOADING                                                       */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem("bba_admin_theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newMode = theme === "dark" ? "light" : "dark";
    setTheme(newMode);
    localStorage.setItem("bba_admin_theme", newMode);

    if (newMode === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  /* ---------------------------------------------------------------------- */
  /* 📊 LOAD METRICS + ACTIVITY                                             */
  /* ---------------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------------- */
  /* SIDEBAR NAV ITEMS                                                     */
  /* ---------------------------------------------------------------------- */
  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
    },
    {
      label: "Books Management",
      icon: BookOpen,
      href: "/admin/books",
    },
    {
      label: "Assign Access Code",
      icon: KeyRound,
      href: "/admin/assign-code",
    },
    {
      label: "Parents",
      icon: Users,
      href: "/admin/parents",
    },
    {
      label: "Students",
      icon: GraduationCap,
      href: "/admin/students",
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      label: "Payments",
      icon: CreditCard,
      href: "/admin/payments",
    },
    {
      label: "Reports",
      icon: BarChart3,
      href: "/admin/reports",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
    },
  ];

  /* ---------------------------------------------------------------------- */
  /* METRIC CARD                                                            */
  /* ---------------------------------------------------------------------- */
  const Metric = ({ icon, label, value }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-gray-700 dark:text-indigo-300">
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------------- */
  /* QUICK ACTION CARD                                                      */
  /* ---------------------------------------------------------------------- */
  const QuickAction = ({ title, href }) => (
    <a
      href={href}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center hover:shadow-md transition"
    >
      <div>
        <div className="font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Click to open
        </div>
      </div>
      <ArrowRight size={20} className="text-indigo-600 dark:text-indigo-300" />
    </a>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      {/* SIDEBAR */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 text-xl font-bold text-indigo-600 dark:text-indigo-300">
          BethelBridge Admin
        </div>

        <nav className="px-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = router.pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 transition
                ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1">

        {/* TOP BAR */}
        <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
          <div className="font-semibold text-gray-700 dark:text-gray-200">
            Admin Dashboard
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6 space-y-10">

          {/* TITLE */}
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Dashboard
          </h1>

          {/* METRICS */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              <Metric icon={<Users size={22} />} label="Parents" value={stats.parents} />
              <Metric icon={<GraduationCap size={22} />} label="Students" value={stats.students} />
              <Metric icon={<BookOpen size={22} />} label="Books" value={stats.books} />
              <Metric icon={<ShoppingCart size={22} />} label="Orders" value={stats.orders} />
              <Metric icon={<DollarSign size={22} />} label="Revenue" value={`UGX ${stats.revenue.toLocaleString()}`} />
            </div>
          )}

          {/* QUICK ACTIONS */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <QuickAction title="Assign Access Code" href="/admin/assign-code" />
              <QuickAction title="Manage Books" href="/admin/books" />
              <QuickAction title="View Orders" href="/admin/orders" />
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
              Recent Activity
            </h2>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              {activity.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                  No recent activity yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {activity.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 border-b border-gray-100 dark:border-gray-700 pb-3 last:border-none"
                    >
                      <History size={18} className="mt-1 text-indigo-500" />
                      <div>
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
