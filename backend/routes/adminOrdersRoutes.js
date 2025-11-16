// backend/routes/adminOrdersRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/admin/orders
 * Supports:
 * - pagination
 * - search (orderTag, parentEmail, parentName, txRef)
 * - status filters
 * - date range filters
 * - sorting
 */
router.get("/", adminAuth, async (req, res) => {
  try {
    const {
      page = "1",
      pageSize = "10",
      search = "",
      status = "ALL",
      dateFrom = "",
      dateTo = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Number(page) || 1;
    const perPage = Number(pageSize) || 10;
    const skip = (pageNum - 1) * perPage;

    const where = {};

    // Status filter (Order.paymentStatus)
    if (status && status !== "ALL") {
      where.paymentStatus = status.toLowerCase();
    }

    // Date range filter (createdAt)
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Search filter
    const trimmed = search.trim();
    if (trimmed !== "") {
      const numericId = Number(trimmed);

      where.OR = [
        { orderTag: { contains: trimmed, mode: "insensitive" } },
        { parentEmail: { contains: trimmed, mode: "insensitive" } },
        { parentName: { contains: trimmed, mode: "insensitive" } },
        { flutterwaveTxRef: { contains: trimmed, mode: "insensitive" } },
      ];

      // If someone searches by internal UUID directly
      if (!Number.isNaN(numericId)) {
        where.OR.push({ id: trimmed });
      }
    }

    // Sorting
    let orderBy = {};
    if (sortBy === "amount") {
      orderBy = {
        grandTotalUGX: sortOrder === "asc" ? "asc" : "desc",
      };
    } else {
      orderBy = {
        createdAt: sortOrder === "asc" ? "asc" : "desc",
      };
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        include: {
          items: true, // OrderItem[]
          studentBooks: {
            include: { order: false }, // no recursion
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / perPage) || 1;

    res.json({
      orders,
      pagination: {
        page: pageNum,
        pageSize: perPage,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

/**
 * GET /api/admin/orders/:id
 * Returns full detail view of one order
 */
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const id = req.params.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true, // all OrderItem entries
        studentBooks: true, // all StudentBook assignments
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Failed to load order" });
  }
});

export default router;
