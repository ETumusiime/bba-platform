"use client";
import React from "react";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800 pt-28 px-6 flex flex-col">
      <div className="max-w-5xl mx-auto text-center flex-grow">
        <h1 className="text-4xl font-bold text-indigo-800 mb-6">
          About Bethel Bridge Academy
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Bethel Bridge Academy (BBA) is a homeschool support
          platform designed to empower parents and students through access to
          quality learning resources, mentorship, and technology. Our mission is
          to simplify homeschooling while connecting families to global
          education opportunities.
        </p>
      </div>
      <Footer />
    </main>
  );
}
