import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🔐 Middleware: Verify parent token (Bearer JWT)                            */
/* -------------------------------------------------------------------------- */
function verifyParent(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "PARENT") {
      return res.status(403).json({ error: "Access denied: not a parent" });
    }
    req.parent = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/* -------------------------------------------------------------------------- */
/* 🧾 Register a new student (child)                                           */
/* -------------------------------------------------------------------------- */
router.post("/", verifyParent, async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    dob,
    schoolYear,
    whatsapp_phone,
    address = {},
    password,
  } = req.body;

  if (!firstName || !lastName || !email || !dob || !schoolYear || !password) {
    return res.status(422).json({ error: "Missing required fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const country = address.country || "Uganda";
    const city = address.city || "Unknown City";
    const neighbourhood = address.neighbourhood || "Unknown Neighbourhood";

    // ensure address exists
    let addressId;
    const existingAddress = await pool.query(
      `SELECT id FROM addresses WHERE country=$1 AND city=$2 AND neighbourhood=$3 LIMIT 1`,
      [country, city, neighbourhood]
    );

    if (existingAddress.rows.length) {
      addressId = existingAddress.rows[0].id;
    } else {
      const newAddr = await pool.query(
        `INSERT INTO addresses (country, city, neighbourhood) VALUES ($1,$2,$3) RETURNING id`,
        [country, city, neighbourhood]
      );
      addressId = newAddr.rows[0].id;
    }

    // check duplicate email
    const exists = await pool.query("SELECT id FROM children WHERE email=$1", [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "A student with this email already exists." });
    }

    // insert child
    const insert = await pool.query(
      `INSERT INTO children 
        (first_name, last_name, email, dob, school_year, whatsapp_phone, password_hash, parent_id, address_id, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
       RETURNING id, first_name, last_name, email, school_year`,
      [
        firstName,
        lastName,
        email,
        dob,
        schoolYear,
        whatsapp_phone || null,
        hashedPassword,
        req.parent.id,
        addressId,
      ]
    );

    const child = insert.rows[0];

    res.json({
      success: true,
      message: "Student account created successfully",
      child,
      credentials: {
        username: child.email,
        tempPassword: password,
      },
    });
  } catch (err) {
    console.error("❌ Error creating student:", err);
    res.status(500).json({ error: "Server error while creating student" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✏️ Update student details                                                  */
/* -------------------------------------------------------------------------- */
router.patch("/:id", verifyParent, async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    dob,
    school_year,
    whatsapp_phone,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE children
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           dob = COALESCE($4, dob),
           school_year = COALESCE($5, school_year),
           whatsapp_phone = COALESCE($6, whatsapp_phone)
       WHERE id = $7
       RETURNING id, first_name, last_name, email, dob, school_year, whatsapp_phone`,
      [first_name, last_name, email, dob, school_year, whatsapp_phone, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ success: true, student: result.rows[0] });
  } catch (err) {
    console.error("❌ Update student error:", err);
    res.status(500).json({ error: "Server error updating student" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🔑 Reset student password                                                  */
/* -------------------------------------------------------------------------- */
router.post("/:id/reset-password", verifyParent, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Missing new password" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "UPDATE children SET password_hash = $1 WHERE id = $2 RETURNING id, email",
      [hashed, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    console.log("✅ Password reset for:", result.rows[0].email);
    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ error: "Server error resetting password" });
  }
});

export default router;
