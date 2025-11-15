import express from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../middleware/adminAuth.js";

const prisma = new PrismaClient();
const router = express.Router();

/* ---------------------------------------------------------- */
/* POST /api/admin/student-books/assign                       */
/* ---------------------------------------------------------- */
router.post("/assign", adminAuth, async (req, res) => {
  try {
    const {
      studentId,
      bookId,
      accessCode,
      providerLink,
      expiresAt
    } = req.body;

    if (!studentId || !bookId || !accessCode) {
      return res.status(400).json({
        success: false,
        message: "Missing fields: studentId, bookId, accessCode required",
      });
    }

    const assignment = await prisma.studentBook.create({
      data: {
        studentId,
        bookId,
        accessCode,
        providerLink,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        student: true,
        book: true,
      },
    });

    return res.json({
      success: true,
      message: "Book assigned to student successfully",
      data: assignment,
    });
  } catch (err) {
    console.error("❌ Error assigning book:", err);
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
});

/* ---------------------------------------------------------- */
/* GET /api/admin/student-books                               */
/* ---------------------------------------------------------- */
router.get("/", adminAuth, async (req, res) => {
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
    console.error("❌ Error fetching assignments:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
