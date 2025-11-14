// backend/modules/orders/orders.routes.js
import express from "express";
import {
  createOrder,
  getOrder,
  getOrderByTagHandler,
  initOrderForFlutterwave,
  updateOrderStatusFromFlutterwave,
} from "./orders.controller.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🩺 Health check                                                            */
/* -------------------------------------------------------------------------- */
router.get("/", (req, res) => res.send("📦 Orders API ready"));

/* -------------------------------------------------------------------------- */
/* 🆕 Create order (original workflow, not used in FlutterwaveButton)        */
/* -------------------------------------------------------------------------- */
router.post("/", createOrder);

/* -------------------------------------------------------------------------- */
/* 🌍 1. Initialize order for Flutterwave                                     */
/* -------------------------------------------------------------------------- */
router.post("/init", initOrderForFlutterwave);

/* -------------------------------------------------------------------------- */
/* 🌍 2. Update order status after payment                                    */
/* -------------------------------------------------------------------------- */
router.post("/update-status", updateOrderStatusFromFlutterwave);

/* -------------------------------------------------------------------------- */
/* 🌍 3. Fetch order by txRef (for receipt page)                              */
/* -------------------------------------------------------------------------- */
/* Must come BEFORE "/:id" to avoid conflicts */
router.get("/by-txref/:txRef", async (req, res) => {
  try {
    const { txRef } = req.params;

    const order = await prisma.order.findFirst({
      where: { txRef },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error("❌ Error fetching order by txRef:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching order by txRef",
    });
  }
});

/* -------------------------------------------------------------------------- */
/* Fetch order by human-readable orderTag                                     */
/* -------------------------------------------------------------------------- */
router.get("/by-tag/:orderTag", getOrderByTagHandler);

/* -------------------------------------------------------------------------- */
/* Fetch order by internal numeric ID                                         */
/* -------------------------------------------------------------------------- */
router.get("/:id", getOrder);

export default router;
