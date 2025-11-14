// backend/modules/payments/payments.service.js
import axios from "axios";
import {
  findOrderByTxRef,
  markOrderAsPaid,
} from "../orders/orders.service.js";

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

/**
 * Call Flutterwave verify endpoint
 */
export async function verifyFlutterwaveTx(transactionId) {
  if (!FLW_SECRET_KEY) {
    throw new Error("FLW_SECRET_KEY is not set in backend .env");
  }

  const url = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;

  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
    },
    timeout: 20000,
  });

  return data;
}

/**
 * High-level verification:
 * - Verify with Flutterwave
 * - Look up order by txRef
 * - Compare amount
 * - Mark order as PAID
 */
export async function verifyAndSettleOrder({ transactionId, txRef }) {
  if (!transactionId || !txRef) {
    throw new Error("Missing transactionId or txRef");
  }

  const flwData = await verifyFlutterwaveTx(transactionId);

  const ok =
    flwData?.status === "success" &&
    flwData?.data?.status === "successful";

  if (!ok) {
    return {
      success: false,
      reason: "FLW status is not successful",
      raw: flwData,
    };
  }

  const paidAmount = Number(flwData?.data?.amount || 0);
  const currency = flwData?.data?.currency || "UGX";

  const order = await findOrderByTxRef(txRef);

  if (!order) {
    return {
      success: false,
      reason: "Order not found for txRef",
      raw: flwData,
    };
  }

  // Simple amount check (we can make this stricter later)
  if (currency !== "UGX") {
    return {
      success: false,
      reason: `Unexpected currency ${currency}`,
      raw: flwData,
    };
  }

  if (paidAmount < order.totalAmountUGX) {
    return {
      success: false,
      reason: `Paid amount ${paidAmount} < order total ${order.totalAmountUGX}`,
      raw: flwData,
    };
  }

  const updated = await markOrderAsPaid(order.id, {
    transactionId: flwData?.data?.id,
    flwStatus: flwData?.data?.status,
    flwRaw: flwData,
  });

  return {
    success: true,
    order: updated,
    flw: flwData,
  };
}
