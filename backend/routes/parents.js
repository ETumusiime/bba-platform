import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkTrialStatus } from "../middleware/trialMiddleware.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/me", verifyToken, checkTrialStatus, async (req, res) => {
  try {
    const email = req.user.email;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.role !== "PARENT") {
      return res.status(404).json({ message: "Parent not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      trial_end_date: user.trialEndDate,
      subscription_status: user.subscriptionStatus,
    });
  } catch (error) {
    console.error("❌ Error fetching parent profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
