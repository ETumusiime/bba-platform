// backend/routes/studentAuthRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db.js";

dotenv.config();

const router = express.Router();

/**
 * @route   POST /api/student/login
 * @desc    Student login (authenticate student and issue token)
 * @access  Public
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("🎓 Student login attempt:", email);

  // ✅ Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // 🔍 Find student by email (case-insensitive)
    const { rows } = await pool.query(
      "SELECT * FROM children WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      console.warn("⚠️ No student found with email:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const child = rows[0];
    console.log("✅ Found student:", child.email);

    if (!child.password_hash) {
      console.warn("⚠️ No password hash found for:", email);
      return res.status(401).json({ error: "Account missing password" });
    }

    // 🔑 Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, child.password_hash);
    console.log("🔍 bcrypt.compare →", isMatch ? "✅ Match" : "❌ Mismatch");

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 🎟️ Create JWT token for student
    const token = jwt.sign(
      { id: child.id, email: child.email, role: "CHILD" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("🎫 Issued child token (first 30 chars):", token.slice(0, 30) + "...");

    // ✅ Success response
    res.json({
      success: true,
      message: "✅ Login successful",
      token,
      child: {
        id: child.id,
        first_name: child.first_name,
        last_name: child.last_name,
        email: child.email,
        school_year: child.school_year,
      },
    });
  } catch (err) {
    console.error("❌ Student login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
