// backend/modules/notifications/sendgrid.js
import sgMail from "@sendgrid/mail";

/* -------------------------------------------------------------------------- */
/* ⚙️ Env & bootstrap                                                         */
/* -------------------------------------------------------------------------- */
const {
  SENDGRID_API_KEY,
  EMAIL_FROM,
  MOSES_EMAIL,
  BBA_ADMIN_EMAIL,
} = process.env;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("🚀 SendGrid initialized successfully.");
} else {
  console.warn("⚠️ SENDGRID_API_KEY missing — email sending is disabled.");
}

function hasMailSetup() {
  if (!SENDGRID_API_KEY) return false;
  if (!EMAIL_FROM) {
    console.warn("⚠️ EMAIL_FROM missing — emails will be skipped.");
    return false;
  }
  return true;
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */
function formatUGX(value) {
  if (value === null || value === undefined || isNaN(Number(value))) return "UGX 0";
  try {
    return `UGX ${Number(value).toLocaleString("en-UG", { maximumFractionDigits: 0 })}`;
  } catch {
    return `UGX ${value}`;
  }
}

function escapeHtml(unsafe = "") {
  return String(unsafe)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseItems(items_json) {
  try {
    const parsed = typeof items_json === "string" ? JSON.parse(items_json) : items_json;
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return [parsed];
  } catch (e) {
    console.error("❌ Failed to parse items_json:", e);
  }
  return [];
}

function toText(html = "") {
  // very light html → text
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/* -------------------------------------------------------------------------- */
/* HTML Shell + table                                                         */
/* -------------------------------------------------------------------------- */
function baseShell(title, body) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#f6f7fb;padding:28px">
    <div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #e6ecff;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.04);overflow:hidden">
      <div style="background:#004aad;color:#fff;padding:18px 24px">
        <h2 style="margin:0;font-size:18px;letter-spacing:.5px">${escapeHtml(title)}</h2>
      </div>
      <div style="padding:22px 24px;color:#222">${body}</div>
      <div style="background:#f2f6ff;color:#4a5677;padding:14px 24px;font-size:12px">
        Bethel Bridge Academy • Kampala, Uganda
      </div>
    </div>
  </div>`.trim();
}

function itemsTable(items = []) {
  const rows = items
    .map(
      (it) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(it.title)}</td>
          <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #eee;">${escapeHtml(it.qty || 1)}</td>
          <td style="padding:8px 12px;text-align:right;border-bottom:1px solid #eee;">${formatUGX(it.price || 0)}</td>
        </tr>`
    )
    .join("");

  return `
  <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:8px;border-collapse:collapse;overflow:hidden">
    <thead style="background:#f7f9ff">
      <tr>
        <th style="padding:10px 12px;text-align:left">Book Title</th>
        <th style="padding:10px 12px;text-align:center">Qty</th>
        <th style="padding:10px 12px;text-align:right">Amount (UGX)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`.trim();
}

/* -------------------------------------------------------------------------- */
/* ✉️ Payment Flow Emails (Flutterwave)                                       */
/* -------------------------------------------------------------------------- */

/** 1) Receipt → Moses (Planet Bookstore) */
export async function sendOrderReceiptToMoses(summary) {
  if (!hasMailSetup()) return;
  try {
    const { parent = {}, items = [] } = summary;

    const body = `
      <p>Hello Moses,</p>
      <p>A parent has completed payment for Cambridge books via BBA (Sandbox).</p>
      <h3>Order Details</h3>${itemsTable(items)}
      <p><strong>Parent:</strong> ${escapeHtml(parent.name || "-")} (${escapeHtml(parent.email || "-")})<br/>
         <strong>Total Paid:</strong> ${formatUGX(summary.amountPaidUGX)} <br/>
         <strong>Tx Ref:</strong> ${escapeHtml(summary.tx_ref)}</p>
      <p>Please forward this order to Mallory and coordinate access codes.</p>`.trim();

    await sgMail.send({
      to: MOSES_EMAIL,
      from: EMAIL_FROM,
      subject: "BBA — Paid Order Receipt (Sandbox)",
      html: baseShell("New Paid Order — BBA", body),
      text: toText(body),
    });

    console.log("📨 Email sent to Moses (receipt).");
  } catch (err) {
    console.error("❌ sendOrderReceiptToMoses failed:", err.response?.body || err);
  }
}

/** 2) Internal notice → BBA Admin */
export async function sendAdminOrderNotice(summary) {
  if (!hasMailSetup()) return;
  try {
    const { parent = {}, items = [] } = summary;

    const body = `
      <p>Hi BBA Admin,</p>
      <p>A payment has been verified via Flutterwave (Sandbox).</p>
      ${itemsTable(items)}
      <p><strong>Parent:</strong> ${escapeHtml(parent.name || "-")} (${escapeHtml(parent.email || "-")})<br/>
         <strong>Amount Paid:</strong> ${formatUGX(summary.amountPaidUGX)}<br/>
         <strong>Tx Ref:</strong> ${escapeHtml(summary.tx_ref)}</p>`.trim();

    await sgMail.send({
      to: BBA_ADMIN_EMAIL,
      from: EMAIL_FROM,
      subject: "BBA — Payment Verified (Sandbox)",
      html: baseShell("Payment Verified — Internal Notice", body),
      text: toText(body),
    });

    console.log("📨 Email sent to Admin (verification notice).");
  } catch (err) {
    console.error("❌ sendAdminOrderNotice failed:", err.response?.body || err);
  }
}

/** 3) Optional — Admin → Parent codes */
export async function sendParentAccessCodesEmail({ parent, codes = [] }) {
  if (!hasMailSetup()) return;
  try {
    const list = codes
      .map((c) => `<li><strong>${escapeHtml(c.title)}:</strong> ${escapeHtml(c.code)}</li>`)
      .join("");
    const body = `
      <p>Hello ${escapeHtml(parent.name || "Parent")},</p>
      <p>Thank you for your purchase. Here are your access codes:</p>
      <ul>${list}</ul>`.trim();

    await sgMail.send({
      to: parent.email,
      from: EMAIL_FROM,
      subject: "Your Cambridge Access Codes — BBA",
      html: baseShell("Your Cambridge Access Codes", body),
      text: toText(body),
    });

    console.log("📨 Email sent to Parent (access codes).");
  } catch (err) {
    console.error("❌ sendParentAccessCodesEmail failed:", err.response?.body || err);
  }
}

/* -------------------------------------------------------------------------- */
/* 🧱 Keep legacy helpers (used elsewhere)                                    */
/* -------------------------------------------------------------------------- */
export async function notifyNewOrder(order) {
  if (!hasMailSetup()) return;
  try {
    const { parent_name, parent_email } = order || {};
    const items = parseItems(order.items_json);
    const subject = `📘 New Order from ${parent_name}`;

    const htmlBody = `
      <p>New order received from <strong>${escapeHtml(parent_name)}</strong> &lt;${escapeHtml(
        parent_email || ""
      )}&gt;</p>
      ${itemsTable(items)}
      <p><strong>Total:</strong> ${formatUGX(order.total_ugx)}</p>
      <p>Status: <strong>PENDING_PAYMENT</strong></p>
    `.trim();

    await sgMail.send({
      to: [MOSES_EMAIL, BBA_ADMIN_EMAIL].filter(Boolean),
      from: EMAIL_FROM,
      subject,
      html: baseShell(subject, htmlBody),
      text: toText(htmlBody),
    });

    console.log("✅ notifyNewOrder: HTML email sent to Moses + Admin.");
  } catch (error) {
    console.error("❌ Error sending order email:", error.response?.body || error);
  }
}

export async function notifyPaymentConfirmed(order) {
  if (!hasMailSetup()) return;
  try {
    const { parent_name, parent_email, total_ugx } = order || {};
    const htmlBody = `
      <p>Dear ${escapeHtml(parent_name || "Parent")},</p>
      <p>Your payment of <strong>${formatUGX(total_ugx)}</strong> has been received successfully.</p>
      <p>Your child’s books will be available in your <strong>BBA Dashboard</strong> within 5–7 days.</p>
      <p>Thank you for choosing <strong>Bethel Bridge Academy</strong>!</p>
    `.trim();

    await sgMail.send({
      to: parent_email,
      from: EMAIL_FROM,
      subject: "✅ Payment Confirmed — Bethel Bridge Academy",
      html: baseShell("🎉 Payment Confirmed!", htmlBody),
      text: toText(htmlBody),
    });

    console.log("✅ notifyPaymentConfirmed: confirmation sent to parent.");
  } catch (err) {
    console.error("❌ Error sending payment confirmation:", err.response?.body || err);
  }
}
