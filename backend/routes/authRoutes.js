// backend/routes/authRoutes.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

// Debug: verify the loaded secret in dev only
if (process.env.NODE_ENV !== "production") {
  console.log("🔑 Auth route loaded JWT_SECRET =", process.env.JWT_SECRET);
}

/* -------------------------------------------------------------------------- */
/* ✅ REGISTER A NEW PARENT (no auto login)                                   */
/* -------------------------------------------------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const check = await pool.query("SELECT id FROM parents WHERE email=$1", [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const trialStart = new Date();
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialStart.getDate() + 7);

    const insertQuery = `
      INSERT INTO parents (name, email, phone, password_hash, trial_start_date, trial_end_date, is_trial_used)
      VALUES ($1, $2, $3, $4, $5, $6, false)
      RETURNING id, name, email, trial_start_date, trial_end_date;
    `;

    const { rows } = await pool.query(insertQuery, [
      name,
      email,
      phone,
      hashedPassword,
      trialStart,
      trialEnd,
    ]);

    const parent = rows[0];

    res.json({
      success: true,
      message: "✅ Registration successful! Please log in to continue.",
      parent,
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ LOGIN PARENT (uses .env secret only, includes role)                     */
/* -------------------------------------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const { rows } = await pool.query("SELECT * FROM parents WHERE email=$1", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const parent = rows[0];
    const isValid = await bcrypt.compare(password, parent.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🔍 Debug — verify signing secret
    console.log("🧾 Signing parent token using secret =", process.env.JWT_SECRET);

    const token = jwt.sign(
      { id: parent.id, email: parent.email, role: "PARENT" },
      process.env.JWT_SECRET, // ✅ only .env key, no fallback
      { expiresIn: "7d" }
    );

    console.log("🎫 Issued parent token (first 30 chars):", token.slice(0, 30) + "...");
    console.log("🎫 Issued parent token with role:", {
      id: parent.id,
      email: parent.email,
      role: "PARENT",
    });

    res.json({
      success: true,
      message: "✅ Login successful",
      token,
      parent: {
        id: parent.id,
        name: parent.name,
        email: parent.email,
        trial_start_date: parent.trial_start_date,
        trial_end_date: parent.trial_end_date,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ GET PARENT PROFILE (Protected route)                                   */
/* -------------------------------------------------------------------------- */
router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      "SELECT id, name, email, trial_start_date, trial_end_date FROM parents WHERE id=$1",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Parent not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Profile token verification failed:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧪 Debug route (for testing connectivity)                                  */
/* -------------------------------------------------------------------------- */
router.get("/test", (req, res) => {
  console.log("✅ /api/auth/test hit successfully");
  res.send("Auth route working ✅");
});

export default router;
