import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* ✅ REGISTER A NEW PARENT (no auto login)                                   */
/* -------------------------------------------------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if email already exists
    const check = await pool.query("SELECT id FROM parents WHERE email=$1", [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set 7-day free trial period
    const trialStart = new Date();
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialStart.getDate() + 7);

    // Insert parent record
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

    // ✅ Return message only (no token)
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
/* ✅ LOGIN PARENT                                                            */
/* -------------------------------------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // Fetch parent by email
    const { rows } = await pool.query("SELECT * FROM parents WHERE email=$1", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const parent = rows[0];

    // Compare password
    const isValid = await bcrypt.compare(password, parent.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: parent.id, email: parent.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

export default router;
