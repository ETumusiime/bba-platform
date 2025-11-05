import axios from "axios";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

/**
 * Initiate a payment via Flutterwave (UGX → split between BBA & Mallory)
 * Supports TEST (sandbox) mode with inline checkout (no hosted links)
 * and LIVE mode with subaccount split payments.
 */
export async function initiatePayment(req, res) {
  try {
    const { order_id, parent_email, parent_name } = req.body;

    if (!order_id || !parent_email) {
      return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    // ✅ Fetch order details
    const order = await prisma.orders.findUnique({ where: { id: order_id } });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const amount = Number(order.total_ugx);
    const tx_ref = `BBA-${order_id}-${Date.now()}`;

    // ✅ Detect environment (test vs live)
    const isTestMode = process.env.FLW_PUBLIC_KEY?.includes("_TEST-");
    console.log(`🔧 Payment Environment: ${isTestMode ? "TEST (Sandbox)" : "LIVE (Production)"}`);

    // ✅ Build Flutterwave payload
    const payload = {
      tx_ref,
      amount,
      currency: "UGX",
      redirect_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-success`,
      customer: {
        email: parent_email,
        name: parent_name || "Parent",
      },
      customizations: {
        title: "Bethel Bridge Academy",
        description: "Cambridge Book Purchase",
        logo: "https://www.bethelbridgeacademy.com/logo.png",
      },
      payment_options: "card, mobilemoneyuganda, banktransfer",
    };

    // ✅ Add subaccounts only in live mode (disable in sandbox)
    if (!isTestMode) {
      payload.subaccounts = [
        { id: process.env.BBA_ACCOUNT_ID, transaction_split_ratio: 20 }, // 20% to BBA
        { id: process.env.MALLORY_ACCOUNT_ID, transaction_split_ratio: 80 }, // 80% to Mallory
      ];
      console.log("💰 Live mode: Subaccounts added for split payment.");
    } else {
      console.log("🧪 Sandbox mode: Skipping subaccounts to avoid invalid links.");
    }

    // ✅ Send request to Flutterwave (mainly for transaction registration)
    const response = await axios.post(`${process.env.FLW_BASE_URL}/payments`, payload, {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("🔍 Flutterwave API response:", JSON.stringify(response.data, null, 2));

    // ✅ Save tx_ref and mark order as pending
    await prisma.orders.update({
      where: { id: order_id },
      data: { tx_ref, status: "PENDING_PAYMENT" },
    });

    // ✅ Return inline checkout data (no hosted link)
    return res.json({
      success: true,
      message: "Payment initialized successfully (use inline widget)",
      tx_ref,
      amount,
      currency: payload.currency,
      customer: payload.customer,
      title: payload.customizations.title,
      description: payload.customizations.description,
    });
  } catch (error) {
    console.error("❌ initiatePayment error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Payment initiation failed",
      error: error.response?.data || error.message,
    });
  }
}
