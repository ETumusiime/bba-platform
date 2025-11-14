// backend/modules/payments/payments.controller.js
import { verifyAndSettleOrder } from "./payments.service.js";

export async function verifyPayment(req, res) {
  try {
    const { transactionId, txRef } = req.body || {};

    if (!transactionId || !txRef) {
      return res.status(400).json({
        success: false,
        message: "Missing transactionId or txRef",
      });
    }

    const result = await verifyAndSettleOrder({ transactionId, txRef });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.reason || "Payment not successful",
        raw: result.raw,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order marked as PAID",
      order: {
        id: result.order.id,
        orderTag: result.order.orderTag,
        txRef: result.order.txRef,
        status: result.order.status,
      },
    });
  } catch (err) {
    console.error("❌ verifyPayment error:", err?.response?.data || err);
    return res.status(500).json({
      success: false,
      message: "Server error verifying payment",
    });
  }
}

export function paymentsHealth(req, res) {
  res.send("💳 Payments API ready (verify enabled)");
}
