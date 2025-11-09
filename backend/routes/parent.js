// backend/routes/parent.js
import dotenv from "dotenv";
dotenv.config();
console.log("🧩 Parent route using JWT_SECRET =", process.env.JWT_SECRET);

import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "../db.js";
import { requireParentAuth } from "../middleware/authMiddleware.js";
import { sendChildWelcomeEmail } from "../modules/notifications/sendChildWelcomeEmail.js";

const router = express.Router();
const clean = (v) => (v ?? "").toString().trim();

/* -------------------------------------------------------------------------- */
/* 🧠 Register a new student                                                  */
/* -------------------------------------------------------------------------- */
router.post("/children", requireParentAuth, async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    dob,
    schoolYear,
    whatsapp_phone,
    address = {},
    password,
  } = req.body || {};

  if (!firstName || !lastName || !email || !dob || !schoolYear || !password) {
    return res.status(422).json({ error: "Missing required fields." });
  }

  const year = Number(schoolYear);
  if (!Number.isInteger(year) || year < 1 || year > 13) {
    return res.status(422).json({ error: "Invalid school year." });
  }

  const country = clean(address.country) || "Uganda";
  const city = clean(address.city);
  const neighbourhood = clean(address.neighbourhood);
  if (!city || !neighbourhood) {
    return res
      .status(422)
      .json({ error: "City and neighbourhood are required." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Address
    let addressId;
    const existingAddress = await client.query(
      `SELECT id FROM addresses WHERE country=$1 AND city=$2 AND neighbourhood=$3 LIMIT 1`,
      [country, city, neighbourhood]
    );

    if (existingAddress.rows.length) {
      addressId = existingAddress.rows[0].id;
    } else {
      const newAddress = await client.query(
        `INSERT INTO addresses (country, city, neighbourhood, created_at)
         VALUES ($1,$2,$3,NOW()) RETURNING id`,
        [country, city, neighbourhood]
      );
      addressId = newAddress.rows[0].id;
    }

    // Password hash
    const passwordHash = await bcrypt.hash(password, 12);

    // Create child
    let child;
    try {
      const insertChild = await client.query(
        `INSERT INTO children
         (parent_id, first_name, last_name, email, dob, school_year,
          password_hash, must_change_password, whatsapp_phone, address_id, created_at)
         VALUES
         ($1,$2,$3,$4,$5,$6,$7,TRUE,$8,$9,NOW())
         RETURNING id, first_name, last_name, email, school_year`,
        [
          req.user.id,
          clean(firstName),
          clean(lastName),
          email,
          dob,
          year,
          passwordHash,
          clean(whatsapp_phone) || null,
          addressId,
        ]
      );
      child = insertChild.rows[0];
    } catch (e) {
      if (e.code === "23505") {
        throw Object.assign(new Error("A student with this email already exists."), {
          status: 409,
        });
      }
      throw e;
    }

    // Cohort linking
    let cohortId;
    const existingCohort = await client.query(
      `SELECT id FROM cohorts WHERE country=$1 AND city=$2 AND neighbourhood=$3 AND school_year=$4 LIMIT 1`,
      [country, city, neighbourhood, year]
    );

    if (existingCohort.rows.length) {
      cohortId = existingCohort.rows[0].id;
    } else {
      const newCohort = await client.query(
        `INSERT INTO cohorts (country, city, neighbourhood, school_year)
         VALUES ($1,$2,$3,$4)
         RETURNING id`,
        [country, city, neighbourhood, year]
      );
      cohortId = newCohort.rows[0].id;
    }

    await client.query(
      `INSERT INTO cohort_members (cohort_id, child_id, created_at)
       VALUES ($1,$2,NOW()) ON CONFLICT DO NOTHING`,
      [cohortId, child.id]
    );

    await client.query("COMMIT");

    // Email notification
    const studentLoginUrl =
      `${process.env.PUBLIC_WEB_ORIGIN || "http://localhost:3000"}/student/login`;

    sendChildWelcomeEmail({
      parentEmail: req.user.email,
      childEmail: child.email,
      childName: `${child.first_name} ${child.last_name}`,
      username: child.email,
      tempPassword: password,
      studentLoginUrl,
    }).catch((e) => console.error("sendChildWelcomeEmail error:", e));

    res.json({
      success: true,
      child,
      credentials: { username: child.email, tempPassword: password },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error creating student:", err);
    res.status(err.status || 500).json({ error: err.message });
  } finally {
    client.release();
  }
});

/* -------------------------------------------------------------------------- */
/* 📋 GET /api/parent/children — list all students                            */
/* -------------------------------------------------------------------------- */
router.get("/children", requireParentAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email, school_year, dob, whatsapp_phone
       FROM children WHERE parent_id=$1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, children: rows });
  } catch (err) {
    console.error("❌ Fetch children failed:", err);
    res.status(500).json({ error: "Failed to load students" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✏️ PATCH /api/parent/children/:id — update student info                   */
/* -------------------------------------------------------------------------- */
router.patch("/children/:id", requireParentAuth, async (req, res) => {
  const { first_name, last_name, school_year } = req.body || {};
  const childId = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE children
       SET first_name=COALESCE($1, first_name),
           last_name=COALESCE($2, last_name),
           school_year=COALESCE($3, school_year)
       WHERE id=$4 AND parent_id=$5
       RETURNING id, first_name, last_name, email, school_year`,
      [first_name, last_name, school_year, childId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found or not yours." });
    }

    res.json({ success: true, student: result.rows[0] });
  } catch (err) {
    console.error("❌ Update student failed:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🔑 POST /api/parent/children/:id/reset-password                           */
/* -------------------------------------------------------------------------- */
router.post("/children/:id/reset-password", requireParentAuth, async (req, res) => {
  const { password } = req.body;
  const childId = req.params.id;

  if (!password || password.length < 8) {
    return res.status(422).json({ error: "Password must be at least 8 characters." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `UPDATE children
       SET password_hash=$1, must_change_password=TRUE
       WHERE id=$2 AND parent_id=$3
       RETURNING email, first_name, last_name`,
      [passwordHash, childId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found or not yours." });
    }

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Password reset failed:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🗑️ POST /api/parent/children/:id/request-delete                           */
/* -------------------------------------------------------------------------- */
router.post("/children/:id/request-delete", requireParentAuth, async (req, res) => {
  const childId = req.params.id;

  try {
    // For now, just log or mark for review — later this can email admin
    console.log(`🗑️ Parent ${req.user.email} requested deletion for child ID: ${childId}`);
    res.json({
      success: true,
      message: "Delete request logged. Admin will review this account.",
    });
  } catch (err) {
    console.error("❌ Delete request failed:", err);
    res.status(500).json({ error: "Failed to request delete" });
  }
});

export default router;
