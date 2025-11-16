import express from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();
const prisma = new PrismaClient();

/* ========================================================================== */
/* 📌 ADMIN — PARENTS MANAGEMENT ROUTES                                      */
/* ========================================================================== */

/**
 * ---------------------------------------------------------------------------
 * 1️⃣ GET /api/admin/parents
 *    → Search + Pagination + Sorting
 * ---------------------------------------------------------------------------
 */
router.get("/", adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "ALL",
      sort = "desc",
    } = req.query;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where = {
      role: "PARENT",
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        status === "APPROVED"
          ? { approved: true }
          : status === "PENDING"
          ? { approved: false }
          : {},
      ],
    };

    const [parents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          country: true,
          city: true,
          address: true,
          approved: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: parents,
      pagination: {
        page: Number(page),
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error("❌ Error fetching parents:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch parents",
    });
  }
});

/**
 * ---------------------------------------------------------------------------
 * 2️⃣ POST /api/admin/parents/:id/approve
 *    → Approve a parent account
 * ---------------------------------------------------------------------------
 */
router.post("/:id/approve", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const parent = await prisma.user.update({
      where: { id },
      data: { approved: true },
    });

    return res.json({
      success: true,
      message: "Parent approved",
      parent,
    });
  } catch (err) {
    console.error("❌ Error approving parent:", err);
    return res.status(500).json({
      success: false,
      message: "Could not approve parent",
    });
  }
});

/**
 * ---------------------------------------------------------------------------
 * 3️⃣ DELETE /api/admin/parents/:id
 *    → Delete a parent (and optionally cascade future logic)
 * ---------------------------------------------------------------------------
 */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { id } });

    return res.json({
      success: true,
      message: "Parent deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting parent:", err);
    return res.status(500).json({
      success: false,
      message: "Could not delete parent",
    });
  }
});

export default router;
