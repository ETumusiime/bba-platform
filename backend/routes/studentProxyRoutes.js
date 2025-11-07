// backend/routes/studentProxyRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

/**
 * GET /api/student/books/proxy?ticket=...
 * Securely verifies JWT + access code ownership before redirecting.
 */
router.get("/proxy", async (req, res) => {
  try {
    const { ticket } = req.query;
    if (!ticket) {
      return res.status(400).send("Missing ticket");
    }

    // 🔒 Extract token from header or cookie
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.bba_child_token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).send("Unauthorized: Missing token");
    }

    // 🧾 Verify JWT validity
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.warn("❌ Invalid JWT:", err.message);
      return res.status(401).send("Invalid or expired token");
    }

    const childId = decoded.id;

    // 🔍 Check access code ownership in DB
    const assignment = await prisma.childAssignment.findUnique({
      where: { accessCode: ticket },
    });

    if (!assignment) {
      return res.status(404).send("Invalid or unknown access code");
    }

    if (assignment.childId !== childId) {
      console.warn(`⚠️ Access denied: Child ${childId} tried to open ${assignment.childId}`);
      return res.status(403).send("Forbidden: Access code not assigned to you");
    }

    // ✅ All good → Redirect to provider URL
    const redirectUrl =
      assignment.providerUrl?.trim() || "https://cambridgego.org";

    console.log(
      `🎓 Verified student ${childId} for ${assignment.subject} → Redirecting to: ${redirectUrl}`
    );

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ Error in student proxy route:", err);
    res.status(500).send("Server error resolving book link");
  }
});

export default router;
