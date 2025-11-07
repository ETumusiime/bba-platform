"use client";
import React from "react";
import Footer from "../../components/Footer";

export default function FAQPage() {
  const faqs = [
    {
      q: "What curriculum does BBA support?",
      a: "We currently focus on the Cambridge International Curriculum with plans to expand to other systems globally.",
    },
    {
      q: "Do I need to register as a school?",
      a: "No. BBA supports individual homeschooling families and connects them to certified learning resources.",
    },
    {
      q: "Can I access resources offline?",
      a: "Yes, many materials can be downloaded or accessed via our approved book partners.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-800 pt-28 px-6 flex flex-col">
      <div className="max-w-5xl mx-auto flex-grow">
        <h1 className="text-4xl font-bold text-indigo-800 text-center mb-10">
          Frequently Asked Questions
        </h1>

        <div className="space-y-6">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="border border-indigo-100 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                {item.q}
              </h3>
              <p className="text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
