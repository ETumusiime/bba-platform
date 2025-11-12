"use client";

import React, { useState } from "react";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import toast, { Toaster } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function TestPaymentPage() {
  const [amount, setAmount] = useState(10000);
  const [email, setEmail] = useState("edwin.tumusiime@gmail.com");
  const [name, setName] = useState("Edwin Tumusiime");
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState(null);

  function buildPaymentConfig() {
    const txRef = `BBA-${Date.now()}`;
    return {
      // ✅ Use real key directly from .env
      public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
      tx_ref: txRef,
      amount: Number(amount),
      currency: "UGX",
      payment_options: "card, mobilemoneyuganda, banktransfer, ussd",

      customer: {
        email,
        name,
      },

      customizations: {
        title: "BBA Test Payment",
        description: "Sandbox Inline Checkout",
        logo: "/file.svg",
      },

      text: `Pay UGX ${Number(amount).toLocaleString()} (Sandbox)`,

      callback: async (resp) => {
        console.log("✅ Payment complete:", resp);
        toast.loading("Verifying payment...");

        try {
          const verifyRes = await fetch(`${API_URL}/api/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transaction_id: resp?.transaction_id,
              tx_ref: txRef,
              parent: { name, email },
              items: [{ title: "Sandbox Item", qty: 1, price: Number(amount) }],
              supplierTotal: Number(amount),
            }),
          });

          const data = await verifyRes.json();
          if (data.success) {
            toast.success("✅ Payment verified successfully!");
          } else {
            toast.error("Verification failed — check backend logs.");
          }
        } catch (err) {
          console.error("❌ Verification error:", err);
          toast.error("Error verifying payment");
        } finally {
          closePaymentModal();
        }
      },

      onClose: () => toast("Payment modal closed."),
    };
  }

  function handleInitialize() {
    const cfg = buildPaymentConfig();
    setConfig(cfg);
    setReady(true);
    toast.success("Payment initialized — ready to test inline checkout!");
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Toaster />
      <h1 className="text-2xl font-semibold mb-4 text-blue-800">
        Flutterwave Inline Checkout — Sandbox
      </h1>
      <p className="mb-4 text-gray-600">
        This page runs a sandbox inline test for Flutterwave payments.
      </p>

      <div className="space-y-3 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Parent Name"
          className="border rounded w-full px-3 py-2"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Parent Email"
          className="border rounded w-full px-3 py-2"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (UGX)"
          className="border rounded w-full px-3 py-2"
        />
      </div>

      <button
        onClick={handleInitialize}
        className="bg-blue-600 text-white px-5 py-2 rounded mb-4 w-full"
      >
        Initialize Payment
      </button>

      {ready && config && (
        <FlutterWaveButton
          {...config}
          className="bg-green-600 text-white px-5 py-3 rounded w-full"
        />
      )}
    </div>
  );
}
