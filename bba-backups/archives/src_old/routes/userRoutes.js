// backend/src/routes/userRoutes.js
import express from "express";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ===========================================
 *  USERS ROUTES (Protected by Admin Login)
 * ===========================================
 */

// Protect all /api/users routes
router.use(verifyAdmin);

// Example: Fetch all users (demo data for MVP)
router.get("/", async (req, res) => {
  try {
    // Replace with DB query when connected to PostgreSQL
    const users = [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ];

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
