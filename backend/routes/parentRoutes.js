import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🔐 Middleware: verify parent authentication via JWT                         */
/* -------------------------------------------------------------------------- */
function verifyParent(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "PARENT") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    req.parent = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/* -------------------------------------------------------------------------- */
/* 📋 1️⃣ Get all children registered by this parent                           */
/* -------------------------------------------------------------------------- */
router.get("/children", verifyParent, async (req, res) => {
  try {
    const parentId = req.parent.id;
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email, dob, school_year, whatsapp_phone 
       FROM children WHERE parent_id = $1 ORDER BY created_at DESC`,
      [parentId]
    );

    res.json({ success: true, children: rows });
  } catch (err) {
    console.error("❌ Error fetching children:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✏️ 2️⃣ Edit / Update child information (PATCH)                              */
/* -------------------------------------------------------------------------- */
router.patch("/children/:id", verifyParent, async (req, res) => {
  try {
    const { first_name, last_name, email, dob, school_year, whatsapp_phone } = req.body;
    const childId = req.params.id;

    await pool.query(
      `UPDATE children 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             email = COALESCE($3, email),
             dob = COALESCE($4, dob),
             school_year = COALESCE($5, school_year),
             whatsapp_phone = COALESCE($6, whatsapp_phone)
       WHERE id = $7`,
      [first_name, last_name, email, dob, school_year, whatsapp_phone, childId]
    );

    res.json({ success: true, message: "Student details updated successfully" });
  } catch (err) {
    console.error("❌ Error updating student:", err);
    res.status(500).json({ error: "Failed to update student" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🔄 3️⃣ Reset a student's password                                           */
/* -------------------------------------------------------------------------- */
router.post("/children/:id/reset-password", verifyParent, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: "Missing new password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE children SET password_hash = $1 WHERE id = $2`, [
      hashedPassword,
      req.params.id,
    ]);

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("❌ Password reset failed:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🗑️ 4️⃣ Delete a child account (soft delete for now)                         */
/* -------------------------------------------------------------------------- */
router.delete("/children/:id", verifyParent, async (req, res) => {
  try {
    await pool.query(`DELETE FROM children WHERE id = $1`, [req.params.id]);
    res.json({ success: true, message: "Student account deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting student:", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 5️⃣ Test route                                                          */
/* -------------------------------------------------------------------------- */
router.get("/test", (req, res) => {
  res.send("✅ Parent routes operational");
});

export default router;
