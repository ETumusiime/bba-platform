import axios from "axios";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { notifyPaymentConfirmed } from "../notifications/sendgrid.js";

dotenv.config();
const prisma = new PrismaClient();

/**
 * Verify payment via Flutterwave
 */
export async function verifyPayment(req, res) {
  try {
    const { tx_ref } = req.body;

    if (!tx_ref) return res.status(400).json({ message: "Missing tx_ref" });

    // ✅ Verify payment from Flutterwave
    const response = await axios.get(
      `${process.env.FLW_BASE_URL}/transactions/verify_by_reference?tx_ref=${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    const flwData = response.data.data;
    if (flwData.status !== "successful")
      return res.status(400).json({ message: "Payment not successful yet" });

    // ✅ Update order
    const order = await prisma.orders.update({
      where: { tx_ref },
      data: { status: "PAID", payment_verified_at: new Date() },
    });

    // ✅ Send confirmation email
    await notifyPaymentConfirmed(order);

    return res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("❌ verifyPayment error:", error.response?.data || error.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
}
