"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-indigo-900 text-gray-200 py-8 mt-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
        <div>
          <h4 className="text-lg font-semibold mb-2 text-white">
            Bethel Bridge Academy
          </h4>
          <p className="text-sm">
            Empowering Parents and Students for Lifelong Learning.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-2 text-white">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="/about" className="hover:text-white">About</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
            <li><a href="/faq" className="hover:text-white">FAQ</a></li>
            <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-2 text-white">
            Get in Touch
          </h4>
          <p className="text-sm">Email: info@bethelbridgeacademy.com</p>
          <p className="text-sm">Phone: +256 700 000000</p>
          <p className="text-sm mt-2">
            © {new Date().getFullYear()} Bethel Bridge Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
