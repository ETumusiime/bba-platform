// backend/routes/parentStudentsRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🔐 Middleware: Verify parent token (Bearer JWT)                            */
/* -------------------------------------------------------------------------- */
function verifyParent(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "PARENT") {
      return res.status(403).json({ success: false, message: "Not a parent" });
    }

    req.parent = decoded;
    next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

/* -------------------------------------------------------------------------- */
/* GET /api/parent/students → list all students for logged-in parent          */
/* -------------------------------------------------------------------------- */
router.get("/", verifyParent, async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { parentId: String(req.parent.id) },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: students });
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* POST /api/parent/students → register a new student                         */
/* -------------------------------------------------------------------------- */
router.post("/", verifyParent, async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      dateOfBirth,
      schoolYear,
      whatsapp,
      country,
      city,
      neighbourhood,
    } = req.body;

    if (!fullName || !email || !password || !dateOfBirth || !schoolYear) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const student = await prisma.student.create({
      data: {
        parentId: String(req.parent.id),
        fullName,
        email,
        passwordHash,
        dateOfBirth: new Date(dateOfBirth),
        schoolYear,
        whatsapp: whatsapp || null,
        country: country || "Uganda",
        city: city || "",
        neighbourhood: neighbourhood || "",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: student,
      credentials: {
        username: student.email,
        tempPassword: password,
      },
    });
  } catch (err) {
    console.error("❌ Error creating student:", err);

    if (err.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "This email is already used by another student.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* -------------------------------------------------------------------------- */
/* PATCH /api/parent/students/:id → update student                            */
/* -------------------------------------------------------------------------- */
router.patch("/:id", verifyParent, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findFirst({
      where: { id, parentId: String(req.parent.id) },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const updated = await prisma.student.update({
      where: { id },
      data: req.body,
    });

    return res.json({
      success: true,
      message: "Student updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Update error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* -------------------------------------------------------------------------- */
/* POST /api/parent/students/:id/reset-password                               */
/* -------------------------------------------------------------------------- */
router.post("/:id/reset-password", verifyParent, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findFirst({
      where: { id, parentId: String(req.parent.id) },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const newPass =
      req.body.newPassword ||
      Math.random().toString(36).slice(-10);

    const passwordHash = await bcrypt.hash(newPass, 10);

    await prisma.student.update({
      where: { id },
      data: { passwordHash },
    });

    return res.json({
      success: true,
      message: "Password reset successful",
      credentials: { username: student.email, tempPassword: newPass },
    });
  } catch (err) {
    console.error("❌ Password reset error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* -------------------------------------------------------------------------- */
/* POST /api/parent/students/:id/request-delete                               */
/* -------------------------------------------------------------------------- */
router.post("/:id/request-delete", verifyParent, async (req, res) => {
  console.log(
    `📩 Parent ${req.parent.id} requested delete for student ${req.params.id}`
  );

  return res.json({
    success: true,
    message: "Delete request submitted. Admin will review it.",
  });
});

export default router;
