"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-indigo-900 text-gray-100 py-10 mt-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
        
        {/* 🏫 About Section */}
        <div>
          <h4 className="text-lg font-semibold mb-2 text-white">
            Bethel Bridge Academy
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            Empowering Parents and Students for Lifelong Learning.
          </p>
        </div>

        {/* 🔗 Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-2 text-white">
            Quick Links
          </h4>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="/about" className="text-gray-200 hover:text-white">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="text-gray-200 hover:text-white">
                Contact
              </a>
            </li>
            <li>
              <a href="/faq" className="text-gray-200 hover:text-white">
                FAQ
              </a>
            </li>
            <li>
              <a href="/privacy" className="text-gray-200 hover:text-white">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* 📬 Contact Section */}
        <div>
          <h4 className="text-lg font-semibold mb-2 text-white">
            Get in Touch
          </h4>
          <p className="text-sm text-gray-200">
            Email: info@bethelbridgeacademy.com
          </p>
          <p className="text-sm text-gray-200">
            Phone: +256 700 000000
          </p>
          <p className="text-sm text-gray-400 mt-2">
            © {new Date().getFullYear()} Bethel Bridge Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
