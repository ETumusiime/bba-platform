// backend/routes/studentBooks.js
import express from "express";
import { prisma } from "../lib/prisma.js";
import { verifyChildToken } from "../middleware/verifyChildToken.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 📚 GET — Fetch Student Assignments (Protected)                             */
/* -------------------------------------------------------------------------- */
router.get("/", verifyChildToken, async (req, res) => {
  try {
    const assignments = await prisma.childAssignment.findMany({
      where: { childId: req.childId },
      orderBy: { createdAt: "desc" },
    });
    return res.json(assignments);
  } catch (err) {
    console.error("❌ Error fetching student assignments:", err);
    return res.status(500).json({ error: "Server error fetching assignments" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧾 POST — Redeem Access Code (Protected)                                   */
/* -------------------------------------------------------------------------- */
router.post("/redeem", verifyChildToken, async (req, res) => {
  try {
    const { accessCode, subject, providerUrl } = req.body;
    if (!accessCode || !subject)
      return res.status(400).json({ error: "Missing required fields" });

    // ✅ Check if already redeemed
    const existing = await prisma.childAssignment.findFirst({
      where: { childId: req.childId, accessCode },
    });

    if (existing) {
      return res.json({
        success: true,
        message: "Already redeemed",
        assignment: existing,
      });
    }

    const assignment = await prisma.childAssignment.create({
      data: {
        childId: req.childId,
        subject,
        accessCode,
        providerUrl: providerUrl || "",
      },
    });

    return res.json({
      success: true,
      message: "Access code redeemed successfully",
      assignment,
    });
  } catch (err) {
    console.error("❌ Error redeeming code:", err);
    return res.status(500).json({ error: "Server error redeeming code" });
  }
});

/* -------------------------------------------------------------------------- */
/* ❌ DELETE — Remove Redeemed Book (Protected)                                */
/* -------------------------------------------------------------------------- */
router.delete("/:id", verifyChildToken, async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await prisma.childAssignment.findUnique({
      where: { id },
    });

    if (!assignment)
      return res.status(404).json({ error: "Assignment not found" });

    if (assignment.childId !== req.childId)
      return res.status(403).json({ error: "Forbidden" });

    await prisma.childAssignment.delete({ where: { id } });
    return res.json({ success: true, message: "Assignment deleted" });
  } catch (err) {
    console.error("❌ Error deleting assignment:", err);
    return res.status(500).json({ error: "Server error deleting assignment" });
  }
});

export default router;
