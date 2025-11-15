import express from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* 📊 GET /api/admin/dashboard                                                */
/* -------------------------------------------------------------------------- */
router.get("/", adminAuth, async (req, res) => {
  try {
    /* ------------------------------------------------------------ */
    /* 1️⃣ METRICS (PARENTS / STUDENTS / BOOKS / ORDERS / REVENUE)   */
    /* ------------------------------------------------------------ */
    const [parents, students, books, orders, successfulPayments] =
      await Promise.all([
        prisma.parent.count(),
        prisma.student.count(),
        prisma.book.count(),
        prisma.order.count(),
        prisma.payment.findMany({
          where: { status: "SUCCESS" },
          select: { amount: true },
        }),
      ]);

    const revenue = successfulPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    /* ------------------------------------------------------------ */
    /* 2️⃣ RECENT ACTIVITY (UNIFIED TIMELINE, INTERNATIONAL STYLE)   */
    /* ------------------------------------------------------------ */

    const [latestBooks, latestStudents, latestOrders] = await Promise.all([
      prisma.book.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { title: true, createdAt: true },
      }),

      prisma.student.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { email: true, createdAt: true },
      }),

      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, totalAmount: true, createdAt: true },
      }),
    ]);

    const activity = [
      // 📚 Books
      ...latestBooks.map((b) => ({
        title: `New book added: ${b.title}`,
        time: new Date(b.createdAt).toLocaleString("en-GB"),
      })),

      // 🎓 Students
      ...latestStudents.map((s) => ({
        title: `New student registered: ${s.email}`,
        time: new Date(s.createdAt).toLocaleString("en-GB"),
      })),

      // 🛒 Orders
      ...latestOrders.map((o) => ({
        title: `Order #${o.id} placed — UGX ${o.totalAmount?.toLocaleString()}`,
        time: new Date(o.createdAt).toLocaleString("en-GB"),
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    /* ------------------------------------------------------------ */
    /* 3️⃣ SEND RESPONSE                                             */
    /* ------------------------------------------------------------ */
    return res.json({
      success: true,
      stats: {
        parents,
        students,
        books,
        orders,
        revenue,
      },
      activity,
    });
  } catch (err) {
    console.error("❌ Dashboard metrics error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error loading dashboard",
    });
  }
});

export default router;
