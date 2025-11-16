import express from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();
const prisma = new PrismaClient();

/* ========================================================================== */
/* 📌 1. GET /api/admin/students — List Students                              */
/* ========================================================================== */
router.get("/", adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      year = "ALL",
    } = req.query;

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const filter = {
      role: "STUDENT",
      AND: [],
    };

    // 🔍 Search filters
    if (search.trim() !== "") {
      filter.AND.push({
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          {
            parent: {
              email: { contains: search, mode: "insensitive" },
            },
          },
        ],
      });
    }

    // 🎓 School Year Filter
    if (year !== "ALL") {
      filter.AND.push({ schoolYear: year });
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where: filter }),

      prisma.student.findMany({
        where: filter,
        skip,
        take,
        include: {
          parent: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: { studentBooks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return res.json({
      success: true,
      data: students,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("❌ Admin Students Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching students",
    });
  }
});

/* ========================================================================== */
/* 📌 2. GET /api/admin/students/:id/books — Assigned Books                  */
/* ========================================================================== */
router.get("/:id/books", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch assigned books
    const books = await prisma.studentBook.findMany({
      where: { studentId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        accessCode: true,
        createdAt: true,
        book: {
          select: {
            isbn: true,
            title: true,
            subject: true,
            year: true,
          },
        },
      },
    });

    const formatted = books.map((b) => ({
      id: b.id,
      accessCode: b.accessCode,
      createdAt: b.createdAt,
      isbn: b.book.isbn,
      title: b.book.title,
      subject: b.book.subject,
      year: b.book.year,
    }));

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error("❌ Fetch student books failed:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load student books",
    });
  }
});

/* ========================================================================== */
/* 📌 3. POST /api/admin/students/:id/reset-password                         */
/* ========================================================================== */
router.post("/:id/reset-password", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const newPassword = Math.random().toString(36).slice(-8);

    await prisma.student.update({
      where: { id },
      data: { password: newPassword },
    });

    return res.json({
      success: true,
      message: "Password reset successfully",
      newPassword,
    });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not reset student password",
    });
  }
});

/* ========================================================================== */
/* 📌 4. DELETE /api/admin/students/:id                                      */
/* ========================================================================== */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.student.delete({ where: { id } });

    return res.json({
      success: true,
      message: "Student deleted",
    });
  } catch (err) {
    console.error("❌ Delete student failed:", err);
    return res.status(500).json({
      success: false,
      message: "Error deleting student",
    });
  }
});

/* ========================================================================== */
/* 📌 5. GET /api/admin/students/:id — Full Student Profile                  */
/* ========================================================================== */
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
            city: true,
            neighbourhood: true,
            createdAt: true,
          },
        },
        studentBooks: {
          include: {
            book: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const assignedBooks = student.studentBooks.map((sb) => ({
      id: sb.id,
      isbn: sb.book.isbn,
      title: sb.book.title,
      subject: sb.book.subject,
      year: sb.book.year,
      assignedAt: sb.createdAt,
      cover_url: sb.book.cover_url,
    }));

    return res.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        schoolYear: student.schoolYear,
        createdAt: student.createdAt,
        parent: student.parent,
        assignedBooks,
      },
    });
  } catch (err) {
    console.error("❌ Student profile load error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching student profile",
    });
  }
});

export default router;
