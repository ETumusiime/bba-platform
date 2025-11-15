// backend/routes/adminStudentBookRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🔒 Middleware: Require Admin                                               */
/* -------------------------------------------------------------------------- */
function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
}

/* -------------------------------------------------------------------------- */
/* 🟩 POST /api/admin/student-books                                           */
/* Create a StudentBook entry                                                 */
/* -------------------------------------------------------------------------- */
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      studentId,
      bookId,
      accessCode,
      provider,
      providerLink,
      expiresAt,
    } = req.body;

    if (!studentId || !bookId || !accessCode) {
      return res.status(400).json({
        success: false,
        message: "studentId, bookId and accessCode are required",
      });
    }

    const assignment = await prisma.studentBook.create({
      data: {
        studentId,
        bookId,
        accessCode,
        provider: provider || "Digital Reader",
        providerLink: providerLink || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        book: true,
        student: true,
      },
    });

    return res.json({
      success: true,
      message: "Book assigned to student successfully",
      data: assignment,
    });
  } catch (err) {
    console.error("❌ Assign student book error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while assigning book",
    });
  }
});

/* -------------------------------------------------------------------------- */
/* 🟦 GET /api/admin/student-books                                            */
/* List all assigned books                                                    */
/* -------------------------------------------------------------------------- */
router.get("/", requireAdmin, async (req, res) => {
  try {
    const assignments = await prisma.studentBook.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        book: true,
      },
    });

    return res.json({
      success: true,
      data: assignments,
    });
  } catch (err) {
    console.error("List error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching assigned books",
    });
  }
});

/* -------------------------------------------------------------------------- */
/* 🟥 DELETE /api/admin/student-books/:id                                     */
/* -------------------------------------------------------------------------- */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    await prisma.studentBook.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Assignment removed",
    });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error deleting assignment",
    });
  }
});

export default router;
