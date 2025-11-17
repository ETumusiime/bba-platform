"use client";
import React from "react";
import Footer from "../../components/Footer";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800 pt-28 px-6 flex flex-col">
      <div className="max-w-5xl mx-auto text-center flex-grow">
        <h1 className="text-4xl font-bold text-indigo-800 mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-8">
          We’d love to hear from you. Reach us via email or phone for any
          support, partnership, or inquiry.
        </p>
        <div className="bg-indigo-50 rounded-xl p-8 inline-block">
          <p className="text-gray-700 mb-2">
            📧 Email: info@bethelbridgeacademy.com
          </p>
          <p className="text-gray-700 mb-2">📞 Phone: +256 701 429122</p>
          <p className="text-gray-700">
            📍 Location: Kampala, Uganda (expanding globally)
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
