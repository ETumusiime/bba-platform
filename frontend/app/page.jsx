"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer"; // ✅ Keep shared footer

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* 🏠 Hero Section */}
      <section className="mt-28 bg-gradient-to-br from-indigo-50 via-white to-sky-50 py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-indigo-800 leading-tight mb-4">
            Empowering Families for Homeschool Success
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            A homeschool support platform — guiding families to
            learn confidently, grow wholly, and connect globally.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push("/about")}
              className="px-6 py-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow"
            >
              Learn More
            </button>
            <button
              onClick={() => router.push("/parent/login")}
              className="px-6 py-3 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* 🙌 Who We Are */}
      <section className="py-16 bg-white px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-indigo-800 mb-6">
            Who We Are
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Bethel Bridge Academy (BBA) is a homeschool support
            platform, empowering families to educate confidently at home.
            Through partnerships, resources, and guidance, we provide a bridge
            between parents, students, tutors, and international learning
            systems.
          </p>
        </div>
      </section>

      {/* 📘 What We Offer */}
      <section className="py-20 bg-indigo-50 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-indigo-800 mb-10">
            What We Offer
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "📚 Book Resources",
                desc: "Access official Cambridge materials through approved partners and digital platforms.",
              },
              {
                title: "🎓 Parent Guidance & Training",
                desc: "Step-by-step homeschool coaching and community mentorship.",
              },
              {
                title: "🧑🏫 Tutor Support",
                desc: "Find trusted tutors and join virtual classrooms aligned with your child’s needs.",
              },
              {
                title: "💡 Skill Development",
                desc: "Future-ready skills — coding, entrepreneurship, creativity, and more.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
              >
                <h4 className="text-xl font-semibold text-indigo-700 mb-2">
                  {card.title}
                </h4>
                <p className="text-gray-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⚙️ How It Works */}
      <section className="py-20 bg-white px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-indigo-800 mb-10">
            How It Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1️⃣",
                title: "Register",
                desc: "Sign up as a parent to access resources and manage your homeschool experience.",
              },
              {
                step: "2️⃣",
                title: "Purchase & Access Books",
                desc: "Buy course materials and redeem book access codes securely through the parent portal.",
              },
              {
                step: "3️⃣",
                title: "Child Studies Online",
                desc: "Your child logs in to the student portal to access digital books and learning tools.",
              },
              {
                step: "4️⃣",
                title: "Track Progress",
                desc: "Parents monitor learning activity and academic growth through the dashboard.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-indigo-50 rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl text-indigo-600 mb-3">{item.step}</div>
                <h4 className="text-xl font-semibold mb-1">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌍 Global Expansion */}
      <section className="py-16 bg-gradient-to-r from-sky-50 to-indigo-50 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-indigo-800 mb-4">
            Growing Beyond Borders 🌍
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            BBA is built to support homeschooling families worldwide — adapting to local education
            systems while maintaining a global standard of excellence.
          </p>
        </div>
      </section>

      {/* 🦶 Footer */}
      <Footer />
    </main>
  );
}
