// backend/modules/payments/payments.controller.js
import axios from "axios";
import {
  sendOrderReceiptToMoses,
  sendAdminOrderNotice,
} from "../notifications/sendgrid.js";

// Pricing markup: +11 % + UGX 5 000
export function applyMarkup(supplierTotalUGX) {
  const markupPercent = 0.11;
  const fixedFeeUGX = 5000;
  const markup = Math.round(supplierTotalUGX * markupPercent) + fixedFeeUGX;
  const finalAmount = supplierTotalUGX + markup;
  return { markup, finalAmount };
}

// POST /api/payments/verify
export async function verifyPayment(req, res) {
  const { transaction_id, tx_ref, parent, items, supplierTotal } = req.body || {};
  if (!transaction_id || !tx_ref)
    return res.status(400).json({ ok: false, message: "Missing transaction_id or tx_ref" });

  try {
    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
    const { data } = await axios.get(verifyUrl, {
      headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
      timeout: 20000,
    });

    const verified =
      data?.status === "success" && data?.data?.status === "successful";
    if (!verified)
      return res.status(200).json({ ok: false, message: "Payment not successful", raw: data });

    const { markup, finalAmount } = applyMarkup(Number(supplierTotal || 0));
    const summary = {
      tx_ref,
      transaction_id,
      amountPaidUGX: finalAmount,
      supplierTotalUGX: Number(supplierTotal || 0),
      markupUGX: markup,
      parent,
      items,
      paidAt: data?.data?.created_at || new Date().toISOString(),
      flw_status: data?.data?.status,
    };

    await sendOrderReceiptToMoses(summary);
    await sendAdminOrderNotice(summary);

    return res.status(200).json({ ok: true, message: "Payment verified & emails sent", summary });
  } catch (err) {
    console.error("verifyPayment error:", err?.response?.data || err.message);
    return res.status(500).json({
      ok: false,
      message: "Server error verifying transaction",
      error: err?.response?.data || err.message,
    });
  }
}
