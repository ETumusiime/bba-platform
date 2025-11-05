"use client";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleValidation = () => {
    if (!form.name || !form.email) {
      toast.error("Please enter your name and email");
      return false;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }
    return true;
  };

  // 🧮 Compute totals
  const supplierTotal = totalPrice; // can modify later for markup
  const finalAmount = totalPrice;

  // 🧠 Inline payment config
  const txRef = `BBA-${Date.now()}`;
  const flutterwaveConfig = {
    public_key:
      process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY ||
      "FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx-X",
    tx_ref: txRef,
    amount: finalAmount,
    currency: "UGX",
    payment_options: "card, mobilemoneyuganda, banktransfer, ussd",
    customer: { email: form.email, name: form.name },
    customizations: {
      title: "Bethel Bridge Academy",
      description: "Cambridge Books",
      logo: "/file.svg",
    },
    text: `Confirm & Pay (${finalAmount.toLocaleString()} UGX)`,
    callback: async (resp) => {
      try {
        toast.loading("Verifying payment...");

        const verifyRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transaction_id: resp?.transaction_id,
              tx_ref: txRef,
              parent: { name: form.name, email: form.email },
              items: cart,
              supplierTotal,
            }),
          }
        );

        const data = await verifyRes.json();
        if (data.success) {
          toast.success("✅ Payment verified successfully!");
          clearCart();
          router.push("/"); // later replace with /success
        } else {
          toast.error("Verification failed. Check backend logs.");
        }
      } catch (err) {
        console.error("❌ Verification error:", err);
        toast.error("Error verifying payment.");
      } finally {
        closePaymentModal();
      }
    },
    onClose: () => toast("Payment modal closed."),
  };

  const handlePayClick = (e) => {
    e.preventDefault();
    if (!handleValidation()) return;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Checkout
        </h1>

        {/* 🧾 Order Summary */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Your Order
          </h2>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              Your cart is currently empty.
            </p>
          ) : (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Book Title
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">
                      Qty
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Amount (UGX)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cart.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{item.title}</td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-800 font-medium">
                        {(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="2" className="py-3 px-4 text-right font-semibold">
                      Total:
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700">
                      UGX {totalPrice.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        {/* 👨‍👩‍👧 Parent Information */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Parent Information
          </h2>
          <form onSubmit={handlePayClick} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Sarah K. Namubiru"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. parent@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                required
              />
            </div>

            <div className="md:col-span-2 mt-6">
              <FlutterWaveButton
                {...flutterwaveConfig}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md"
                onClick={handlePayClick}
              />
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
