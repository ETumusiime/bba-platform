// backend/routes/studentBooks.js
import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* 🔐 Helper: Require student auth (JWT in Authorization header)              */
/* -------------------------------------------------------------------------- */
function requireStudentAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Missing student token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== "STUDENT") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized as student" });
    }

    // Attach to request for later use
    req.student = decoded;
    next();
  } catch (err) {
    console.error("❌ Student auth error:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

/* -------------------------------------------------------------------------- */
/* 📚 GET /api/student/books  → list student's books                          */
/* -------------------------------------------------------------------------- */
router.get("/", requireStudentAuth, async (req, res) => {
  try {
    const studentId = req.student.id;

    const books = await prisma.studentBook.findMany({
      where: {
        studentId,
        status: "active",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: books.map((b) => ({
        id: b.id,
        isbn: b.isbn,
        title: b.title,
        provider: b.provider,
        providerLink: b.providerLink,
        // we NEVER expose raw code to UI
        expiresAt: b.expiresAt,
        status: b.status,
      })),
    });
  } catch (err) {
    console.error("❌ Error fetching student books:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching student books",
    });
  }
});

export default router;
