// backend/routes/cambridgeRoutes.js
import express from "express";
const router = express.Router();

// Local access code → book mapping (temporary mock until Cambridge API is available)
const bookMap = {
  "CUP-ENG-001": { subject: "English", providerUrl: "https://cambridgego.org/book/eng001" },
  "CUP-MATH-001": { subject: "Mathematics", providerUrl: "https://cambridgego.org/book/math001" },
  "CUP-BIO-001": { subject: "Biology", providerUrl: "https://cambridgego.org/book/bio001" },
};

router.get("/validate", (req, res) => {
  const code = req.query.code?.trim().toUpperCase();
  if (!code) return res.status(400).json({ error: "Missing access code" });

  const match = bookMap[code];
  if (!match)
    return res.status(404).json({ error: "Invalid or unrecognized code", valid: false });

  return res.json({ valid: true, subject: match.subject, providerUrl: match.providerUrl });
});

export default router;
