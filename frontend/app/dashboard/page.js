"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

/**
 * Parent Dashboard
 * Works as a client component.
 * Auth is handled via cookie by middleware; this only re-checks for safety.
 */
export default function ParentDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [openSection, setOpenSection] = useState("academics");

  /* -------------------------------------------------------------------------- */
  /* 🔐  Quick client-side guard — if no cookie, redirect to login              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const hasParentCookie =
      document.cookie.includes("bba_parent_token=") ||
      localStorage.getItem("bba_parent_token");

    if (!hasParentCookie) {
      console.warn("🚫 No parent token found; redirecting to login …");
      router.replace("/login?next=/dashboard"); // ✅ updated from /auth/login
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600 text-lg">
        Loading dashboard…
      </main>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 🧭  Section toggler                                                        */
  /* -------------------------------------------------------------------------- */
  const toggleSection = (section) =>
    setOpenSection(openSection === section ? "" : section);

  /* -------------------------------------------------------------------------- */
  /* 🚀  Navigation + handlers                                                  */
  /* -------------------------------------------------------------------------- */
  const goToBooks = () => router.push("/book-selection");
  const goToProfile = () => router.push("/profile");

  const handleLogout = () => {
    localStorage.removeItem("bba_parent_token");
    document.cookie =
      "bba_parent_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    toast.success("👋 Logged out successfully");
    router.replace("/login"); // ✅ updated from /auth/login
  };

  const comingSoon = () =>
    toast("🚧 Coming Soon ✨", { icon: "⏳", duration: 2500 });

  /* -------------------------------------------------------------------------- */
  /* 🎨  UI Rendering                                                           */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 py-8 px-4 flex flex-col items-center">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800 mb-3 sm:mb-0">
          Parent Dashboard
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md shadow hover:bg-gray-200 transition"
          >
            ⬅ Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ========== ACADEMICS HUB ========== */}
      <Accordion
        title="📘 Academics Hub"
        color="text-blue-900"
        section="academics"
        openSection={openSection}
        toggleSection={toggleSection}
      >
        <DashboardCard title="Browse Book Catalogue" icon="📚" onClick={goToBooks} />
        <DashboardCard title="Register for Labs" icon="🧪" onClick={comingSoon} />
        <DashboardCard title="Register for Exams" icon="🧾" onClick={comingSoon} />
        <DashboardCard title="Book a Tutor" icon="🎓" onClick={comingSoon} />
        <DashboardCard title="University Connect" icon="🏛️" onClick={comingSoon} />
        <DashboardCard title="Lesson Summaries" icon="🧮" onClick={comingSoon} />
        <DashboardCard title="Progress Reports" icon="📈" onClick={comingSoon} />
      </Accordion>

      {/* ========== TALENT & ACTIVITIES HUB ========== */}
      <Accordion
        title="🎭 Talent & Activities Hub"
        color="text-orange-800"
        section="talent"
        openSection={openSection}
        toggleSection={toggleSection}
      >
        <DashboardCard title="Sports" icon="⚽" onClick={comingSoon} />
        <DashboardCard title="Music" icon="🎵" onClick={comingSoon} />
        <DashboardCard title="Dance" icon="💃" onClick={comingSoon} />
        <DashboardCard title="Creative Skills" icon="🧩" onClick={comingSoon} />
      </Accordion>

      {/* ========== PARENT GROWTH HUB ========== */}
      <Accordion
        title="🌱 Parent Growth & Community Hub"
        color="text-green-800"
        section="growth"
        openSection={openSection}
        toggleSection={toggleSection}
      >
        <DashboardCard title="Parent Academy" icon="🎓" onClick={comingSoon} />
        <DashboardCard title="Faith & Family Growth" icon="🙏" onClick={comingSoon} />
      </Accordion>

      {/* ========== ADMIN HUB ========== */}
      <Accordion
        title="👨‍👩‍👧 Parent Administration Hub"
        color="text-indigo-700"
        section="admin"
        openSection={openSection}
        toggleSection={toggleSection}
      >
        {/* ✅ Updated Section */}
        <DashboardCard
          title="Manage Students"
          icon="👨‍👩‍🎓"
          onClick={() => router.push("/parent/students")}
        />
        <DashboardCard
          title="Register Student"
          icon="🆕"
          onClick={() => router.push("/parent/students/new")}
        />
        <DashboardCard
          title="Student Access Codes"
          icon="🔑"
          onClick={comingSoon}
        />
        <DashboardCard title="My Orders" icon="🛍️" onClick={comingSoon} />
        <DashboardCard title="Subscription & Billing" icon="💳" onClick={comingSoon} />
      </Accordion>

      {/* ========== PERSONAL SETTINGS ========== */}
      <Accordion
        title="👤 Personal Settings"
        color="text-gray-700"
        section="profile"
        openSection={openSection}
        toggleSection={toggleSection}
      >
        <DashboardCard title="My Profile" icon="👤" onClick={goToProfile} />
      </Accordion>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-8">
        © 2025{" "}
        <span className="font-semibold text-indigo-700">
          Bethel Bridge Academy
        </span>
        . All rights reserved.
      </footer>
    </main>
  );
}

/* -------------------------- 🧩 COMPONENTS -------------------------- */
function Accordion({ title, color, section, openSection, toggleSection, children }) {
  const isOpen = openSection === section;

  return (
    <div className="w-full max-w-6xl mb-4 border border-gray-200 rounded-xl bg-white shadow-sm">
      <button
        onClick={() => toggleSection(section)}
        className={`w-full flex justify-between items-center px-5 py-4 font-semibold ${color} text-lg sm:text-xl`}
      >
        <span>{title}</span>
        <span className="text-gray-400 text-2xl">{isOpen ? "−" : "+"}</span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-5 bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl p-6 flex flex-col items-center justify-center
                 shadow-md hover:shadow-xl transition-all text-center
                 bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:border-blue-300"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-blue-900 text-sm sm:text-base">{title}</h3>
    </div>
  );
}
