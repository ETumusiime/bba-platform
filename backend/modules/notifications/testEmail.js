// backend/modules/notifications/testEmail.js
import { sendOrderReceiptToMoses, sendAdminOrderNotice } from "./sendgrid.js";

export async function testSendGrid(req, res) {
  const fakeOrder = {
    tx_ref: "BBA-TEST-" + Date.now(),
    amountPaidUGX: 5000,
    parent: { name: "Test Parent", email: "sandbox@bba.com" },
    items: [
      { title: "Cambridge Primary English Learner’s Book 1", qty: 1, price: 5000 },
    ],
  };

  try {
    console.log("🚀 Triggering test SendGrid emails...");
    await sendOrderReceiptToMoses(fakeOrder);
    await sendAdminOrderNotice(fakeOrder);
    console.log("✅ Test emails queued to SendGrid");
    res.json({ ok: true, message: "Test emails triggered." });
  } catch (err) {
    console.error("❌ testSendGrid error:", err.response?.body || err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
