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

// Small helper to safely clean values
const clean = (v) => (v ?? "").toString().trim();

/**
 * @route   POST /api/parent/children
 * @desc    Register a new student (child) under the logged-in parent
 * @access  Private (Parent)
 */
router.post("/children", requireParentAuth, async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    dob, // YYYY-MM-DD
    schoolYear, // 1–13
    whatsapp_phone, // optional
    address = {}, // { country, city, neighbourhood }
  } = req.body || {};

  // ---------------- Validation ----------------
  if (!firstName || !lastName || !email || !dob || !schoolYear) {
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

    // ---------------- Address ----------------
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

    // ---------------- Generate Password ----------------
    const tempPassword = crypto.randomBytes(9).toString("base64url"); // e.g., Ab3x_29lPQ
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // ---------------- Create Child ----------------
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
        // unique_violation (email already exists)
        throw Object.assign(new Error("A student with this email already exists."), {
          status: 409,
        });
      }
      throw e;
    }

    // ---------------- Cohort ----------------
    let cohortId;
    const existingCohort = await client.query(
      `SELECT id FROM cohorts
       WHERE country=$1 AND city=$2 AND neighbourhood=$3 AND school_year=$4
       LIMIT 1`,
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

    // ---------------- Cohort Membership ----------------
    await client.query(
      `INSERT INTO cohort_members (cohort_id, child_id, created_at)
       VALUES ($1,$2,NOW())
       ON CONFLICT DO NOTHING`,
      [cohortId, child.id]
    );

    await client.query("COMMIT");

    // ---------------- Send Email ----------------
    const studentLoginUrl =
      `${process.env.PUBLIC_WEB_ORIGIN || "http://localhost:3000"}/student/login`;

    sendChildWelcomeEmail({
      parentEmail: req.user.email, // from JWT
      childEmail: child.email,
      childName: `${child.first_name} ${child.last_name}`,
      username: child.email,
      tempPassword,
      studentLoginUrl,
    }).catch((e) => console.error("sendChildWelcomeEmail error:", e));

    // ---------------- Success Response ----------------
    return res.json({
      success: true,
      child: {
        id: child.id,
        firstName: child.first_name,
        lastName: child.last_name,
        email: child.email,
        schoolYear: child.school_year,
      },
      credentials: {
        username: child.email,
        tempPassword,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error creating student:", err);
    const status = err.status || 500;
    res.status(status).json({
      error: err.message || "Internal Server Error",
    });
  } finally {
    client.release();
  }
});

export default router;
