// backend/routes/parent.children.js
import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "../db.js";
import { requireParentAuth } from "../middleware/authMiddleware.js";
import { sendChildWelcomeEmail } from "../modules/notifications/sendChildWelcomeEmail.js";

const router = express.Router();
const clean = (s) => (s ?? "").toString().trim();

router.post("/", requireParentAuth, async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    dob,
    schoolYear,
    whatsapp_phone,          // optional
    address = {},            // { country, city, neighbourhood }
  } = req.body || {};

  // Validate
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
    return res.status(422).json({ error: "City and neighbourhood are required." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Address
    const insAddr = await client.query(
      `INSERT INTO addresses (country, city, neighbourhood)
       VALUES ($1,$2,$3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [country, city, neighbourhood]
    );
    let addressId = insAddr.rows[0]?.id;
    if (!addressId) {
      const sel = await client.query(
        `SELECT id FROM addresses WHERE country=$1 AND city=$2 AND neighbourhood=$3`,
        [country, city, neighbourhood]
      );
      addressId = sel.rows[0]?.id;
    }

    // 2) Temp password + hash
    const tempPassword = crypto.randomBytes(9).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // 3) Insert child
    let child;
    try {
      const insChild = await client.query(
        `INSERT INTO children
         (parent_id, full_name, date_of_birth, email, school_year, password_hash, address_id, whatsapp_phone, created_at, updated_at, must_change_password)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW(),TRUE)
         RETURNING id, full_name, email, school_year`,
        [
          req.user.id,
          `${clean(firstName)} ${clean(lastName)}`,
          dob,
          email,
          year,
          passwordHash,
          addressId,
          clean(whatsapp_phone) || null,
        ]
      );
      child = insChild.rows[0];
    } catch (e) {
      if (e?.code === "23505") {
        throw Object.assign(new Error("Email already in use."), { status: 409 });
      }
      throw e;
    }

    // 4) Upsert cohort
    const insCohort = await client.query(
      `INSERT INTO cohorts (country, city, neighbourhood, school_year)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (country, city, neighbourhood, school_year)
       DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [country, city, neighbourhood, year]
    );
    const cohortId = insCohort.rows[0].id;

    // 5) Member link (one cohort per child)
    await client.query(
      `INSERT INTO cohort_members (cohort_id, child_id, invited_via, created_at, updated_at)
       VALUES ($1,$2,'email',NOW(),NOW())
       ON CONFLICT DO NOTHING`,
      [cohortId, child.id]
    );

    await client.query("COMMIT");

    // 6) Email (fire-and-forget)
    const studentLoginUrl = `${process.env.PUBLIC_WEB_ORIGIN || "http://localhost:3000"}/student/login`;
    sendChildWelcomeEmail({
      parentEmail: req.user.email,
      childEmail: child.email,
      childName: child.full_name,
      username: child.email,
      tempPassword,
      studentLoginUrl,
    }).catch((e) => console.error("sendChildWelcomeEmail error:", e));

    // 7) Response (one-time creds)
    return res.json({
      success: true,
      child: {
        id: child.id,
        name: child.full_name,
        email: child.email,
        schoolYear: child.school_year,
      },
      credentials: { username: child.email, tempPassword },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return res.status(err.status || 500).json({ error: err.message || "Internal error." });
  } finally {
    client.release();
  }
});

export default router;
