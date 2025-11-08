// backend/modules/notifications/sendChildWelcomeEmail.js
import sgMail from "@sendgrid/mail";
const FROM_EMAIL = process.env.SENDGRID_FROM || "no-reply@bethelbridge.academy";

export function sendChildWelcomeEmail({
  parentEmail,
  childEmail,
  childName,
  username,
  tempPassword,
  studentLoginUrl,
}) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY missing; skipping email.");
    return Promise.resolve();
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const html = `
  <div style="font-family:Arial,sans-serif;padding:16px;color:#111">
    <h2 style="margin:0 0 8px">Student account created</h2>
    <p>We created an account for <strong>${childName}</strong>.</p>
    <div style="margin:12px 0;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb">
      <p style="margin:0 0 6px"><strong>Username:</strong> ${username}</p>
      <p style="margin:0 0 6px"><strong>Temporary password:</strong> ${tempPassword}</p>
      <p style="margin:0">They will be prompted to change it on first login.</p>
    </div>
    <p><a href="${studentLoginUrl}" style="display:inline-block;padding:10px 14px;border-radius:6px;background:#2563eb;color:#fff;text-decoration:none">Open Student Login</a></p>
    <p style="margin-top:16px;font-size:12px;color:#6b7280">If you didn’t request this, contact support.</p>
  </div>`;

  const to = [parentEmail, ...(childEmail ? [childEmail] : [])];
  return sgMail.send({ to, from: FROM_EMAIL, subject: "BBA — Student account created", html });
}
