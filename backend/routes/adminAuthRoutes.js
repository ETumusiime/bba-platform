import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ Temporary static admin credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bba.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "bba12345";

/* -------------------------------------------------------------------------- */
/* 🟢 POST /api/admin/auth/login  —  Verify credentials & issue token          */
/* -------------------------------------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { email, role: "admin" },
      process.env.JWT_SECRET || "bbasecret",
      { expiresIn: "1d" }
    );

    res.json({ message: "✅ Login successful", token });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
