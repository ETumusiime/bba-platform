import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Trial expiry middleware
 * Blocks parents whose trial has expired or subscription is inactive.
 */
export async function checkTrialStatus(req, res, next) {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({ message: "Unauthorized — no user in request" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check subscription status
    if (user.subscriptionStatus !== "active") {
      const today = new Date();
      const trialEnd = user.trialEndDate ? new Date(user.trialEndDate) : null;

      if (!trialEnd || trialEnd < today) {
        return res.status(403).json({
          message: "Trial expired. Please subscribe to continue.",
          redirect: "/billing",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Trial check failed:", error);
    res.status(500).json({ message: "Server error during trial check" });
  }
}
