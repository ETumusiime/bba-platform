// backend/routes/adminOrdersRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* Helper: Enrich order with assignment stats (quantity-aware)                */
/* -------------------------------------------------------------------------- */
function enrichOrderAssignmentStats(order) {
  if (!order || !order.items) return order;

  let totalCopies = 0;      // sum of all item.quantity
  let assignedCopies = 0;   // sum of assignedCount per item

  const itemsWithStats = order.items.map((item) => {
    const quantity = typeof item.quantity === "number" && item.quantity > 0
      ? item.quantity
      : 1;

    // For now, each OrderItem can have at most ONE student
    // → assignedCount is 1 if student exists, else 0
    const assignedCount = item.student ? 1 : 0;

    const unassignedCount = Math.max(quantity - assignedCount, 0);

    totalCopies += quantity;
    assignedCopies += assignedCount;

    return {
      ...item,
      assignedCount,
      unassignedCount,
    };
  });

  const unassignedCopies = Math.max(totalCopies - assignedCopies, 0);
  const completionPercent =
    totalCopies === 0
      ? 100
      : Math.round((assignedCopies / totalCopies) * 100);

  return {
    ...order,
    items: itemsWithStats,
    assignmentStats: {
      totalCopies,
      assignedCopies,
      unassignedCopies,
      completionPercent,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* GET /api/admin/orders (list with filters)                                  */
/* -------------------------------------------------------------------------- */
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

    // Status filter
    if (status && status !== "ALL") {
      where.status = status.toUpperCase();
    }

    // Date filters
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);

      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Search filters
    const trimmed = search.trim();
    if (trimmed !== "") {
      where.OR = [
        { parentEmail: { contains: trimmed, mode: "insensitive" } },
        { parentName: { contains: trimmed, mode: "insensitive" } },
        { flutterwaveTxRef: { contains: trimmed, mode: "insensitive" } },
      ];
    }

    // Sorting
    let orderBy = {};
    if (sortBy === "amount") {
      orderBy = {
        totalAmount: sortOrder === "asc" ? "asc" : "desc",
      };
    } else {
      orderBy = {
        createdAt: sortOrder === "asc" ? "asc" : "desc",
      };
    }

    const [total, rawOrders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        include: {
          parent: true,
          payments: true,
          items: {
            include: {
              book: true,
              student: true, // ⭐ assigned student
            },
          },
        },
      }),
    ]);

    // ⭐ Quantity-aware assignment stats per order
    const orders = rawOrders.map((o) => enrichOrderAssignmentStats(o));

    res.json({
      orders,
      pagination: {
        page: pageNum,
        pageSize: perPage,
        total,
        totalPages: Math.ceil(total / perPage) || 1,
      },
    });
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

/* -------------------------------------------------------------------------- */
/* GET /api/admin/orders/:id                                                  */
/* -------------------------------------------------------------------------- */
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const rawOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        parent: true,
        payments: true,
        items: {
          include: {
            book: true,
            student: true,
          },
        },
      },
    });

    if (!rawOrder)
      return res.status(404).json({ message: "Order not found" });

    // ⭐ Quantity-aware stats + assignedCount/unassignedCount per item
    const order = enrichOrderAssignmentStats(rawOrder);

    res.json({ order });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Failed to load order" });
  }
});

/* -------------------------------------------------------------------------- */
/* GET /api/admin/orders/verify/:orderId                                      */
/* -------------------------------------------------------------------------- */
router.get("/verify/:orderId", adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { payments: true },
    });

    if (!order)
      return res.json({ success: false, message: "Order not found" });

    const txRef = order.payments?.[0]?.txRef;
    if (!txRef)
      return res.json({
        success: false,
        message: "No payment record found",
      });

    // 🔍 Verify with Flutterwave
    const fwRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    const fwJson = await fwRes.json();
    const newStatus =
      fwJson?.data?.status?.toUpperCase() || "PENDING";

    // Update payment
    await prisma.payment.update({
      where: { id: order.payments[0].id },
      data: { status: newStatus },
    });

    // Update order (and reload all related data for drawer)
    const rawUpdatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status: newStatus },
      include: {
        parent: true,
        payments: true,
        items: {
          include: {
            book: true,
            student: true,
          },
        },
      },
    });

    const updatedOrder = enrichOrderAssignmentStats(rawUpdatedOrder);

    return res.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("Verify error:", err);
    res.json({ success: false, message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* GET /api/admin/orders/:orderId/students                                    */
/* -------------------------------------------------------------------------- */
router.get("/:orderId/students", adminAuth, async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { parent: true },
    });

    if (!order)
      return res.json({ success: false, message: "Order not found" });

    const students = await prisma.student.findMany({
      where: { parentId: order.parentId },
    });

    res.json({ success: true, students });
  } catch (err) {
    console.error("Students load error:", err);
    res.json({ success: false, message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* POST /api/admin/orders/assign                                              */
/* Prevent Double Assignment (Phase 3)                                        */
/* -------------------------------------------------------------------------- */
router.post("/assign", adminAuth, async (req, res) => {
  try {
    const { orderItemId, studentId } = req.body;

    const item = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
    });

    if (!item)
      return res.json({
        success: false,
        message: "Order item not found",
      });

    const orderId = item.orderId;
    const isbn = item.isbn;

    // Count how many copies purchased for this ISBN in this order
    const siblings = await prisma.orderItem.findMany({
      where: { orderId, isbn },
    });

    const totalCopies = siblings.reduce(
      (sum, it) =>
        sum + (typeof it.quantity === "number" && it.quantity > 0 ? it.quantity : 1),
      0
    );

    // Count how many student assignments currently exist for this ISBN in this order
    const assignedItems = siblings.filter((it) => it.studentId !== null);
    const assignedCount = assignedItems.length;

    // ❌ Rule 1 — Cannot exceed purchased quantity (per license count)
    if (assignedCount >= totalCopies) {
      return res.json({
        success: false,
        message: `All ${totalCopies} license(s) already assigned for ISBN ${isbn}`,
      });
    }

    // ❌ Rule 2 — Prevent assigning same student to same book twice in this order
    const alreadyAssignedToStudent = await prisma.orderItem.findFirst({
      where: {
        orderId,
        isbn,
        studentId,
      },
    });

    if (alreadyAssignedToStudent) {
      return res.json({
        success: false,
        message: `This student already has this book assigned`,
      });
    }

    // ✅ All checks passed → Assign student
    const updated = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { studentId },
    });

    res.json({ success: true, updated });
  } catch (err) {
    console.error("Assign error:", err);
    res.json({ success: false, message: err.message });
  }
});

export default router;
