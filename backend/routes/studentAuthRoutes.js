// backend/routes/studentAuthRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🔐 Helper: Sign JWT for student                                             */
/* -------------------------------------------------------------------------- */
function signToken(student) {
  return jwt.sign(
    {
      id: student.id,
      role: "STUDENT",
      email: student.email,
      fullName: student.fullName,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* -------------------------------------------------------------------------- */
/* 🧑‍🎓 POST /api/student/login                                                */
/* -------------------------------------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    console.log("🎓 Student login attempt:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 🔍 Find student in Prisma table
    const student = await prisma.student.findUnique({
      where: { email },
    });

    if (!student) {
      console.warn("⚠️ No student found with email:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    // 🔑 Compare password
    const valid = await bcrypt.compare(password, student.passwordHash);

    if (!valid) {
      console.warn("❌ Invalid password for:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    // 🎫 Issue token
    const token = signToken(student);

    console.log("🎫 Issued student token:", token.slice(0, 25) + "...");

    return res.json({
      success: true,
      message: "Student logged in successfully",
      data: {
        token,
        student: {
          id: student.id,
          fullName: student.fullName,
          email: student.email,
          schoolYear: student.schoolYear,
        },
      },
    });
  } catch (err) {
    console.error("❌ Student login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

export default router;
