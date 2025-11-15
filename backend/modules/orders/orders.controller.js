// backend/modules/orders/orders.controller.js
import {
  createOrderWithItems,
  getOrderById,
  getOrderByTag,
  markOrderAsPaid,
} from "./orders.service.js";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* 🟢 EXISTING createOrder (Old flow - keep intact)                           */
/* -------------------------------------------------------------------------- */
export async function createOrder(req, res) {
  try {
    const {
      parentId,
      parentName,
      parentEmail,
      parentPhone,
      country,
      city,
      addressLine,
      paymentMethod,
      baseTotalUGX,
      fxRateUGXtoGBP,
      items,
    } = req.body || {};

    if (!parentId || !parentName || !parentEmail || !parentPhone) {
      return res.status(400).json({
        success: false,
        message: "Missing parent details",
      });
    }

    if (!baseTotalUGX || Number(baseTotalUGX) <= 0) {
      return res.status(400).json({
        success: false,
        message: "baseTotalUGX is required",
      });
    }

    const { order, pricing, orderTag } = await createOrderWithItems({
      parentId,
      parentName,
      parentEmail,
      parentPhone,
      country,
      city,
      addressLine,
      paymentMethod,
      baseTotalUGX: Number(baseTotalUGX),
      fxRateUGXtoGBP:
        fxRateUGXtoGBP !== undefined ? Number(fxRateUGXtoGBP) : undefined,
      items,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: { order, pricing, orderTag },
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating order",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🟢 GET ORDER BY ID                                                         */
/* -------------------------------------------------------------------------- */
export async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);

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
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching order",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🟢 GET ORDER BY HUMAN TAG                                                  */
/* -------------------------------------------------------------------------- */
export async function getOrderByTagHandler(req, res) {
  try {
    const { orderTag } = req.params;
    const order = await getOrderByTag(orderTag);

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
  } catch (error) {
    console.error("❌ Error fetching order by tag:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching order by tag",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🟢 INIT ORDER FOR FLUTTERWAVE BUTTON FLOW                                  */
/* -------------------------------------------------------------------------- */
export async function initOrderForFlutterwave(req, res) {
  try {
    const {
      parentName,
      parentEmail,
      parentPhone,
      country,
      city,
      addressLine,
      cart,
      studentAssignments = [], // Reserved for future student mapping
    } = req.body || {};

    if (!parentName || !parentEmail) {
      return res.status(400).json({
        success: false,
        message: "parentName and parentEmail are required",
      });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty or invalid",
      });
    }

    // Compute backend-authoritative total
    const grandTotalUGX = cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    if (grandTotalUGX <= 0) {
      return res.status(400).json({
        success: false,
        message: "Calculated total amount is invalid",
      });
    }

    // Generate txRef and orderTag
    const random = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, "0");

    const txRef = `BBA-${Date.now()}-${random}`;
    const orderTag = txRef;

    // Temporary until login is integrated
    const parentId = "TEMP_PARENT_0001";

    // Static FX for now
    const fxRateUGXtoGBP = 1 / 5000;
    const malloryUGX = grandTotalUGX;
    const malloryGBP = malloryUGX * fxRateUGXtoGBP;

    // Create order (NO items_json)
    const order = await prisma.order.create({
      data: {
        orderTag,
        parentId,
        parentName,
        parentEmail,
        parentPhone: parentPhone || "",

        country: country || "Uganda",
        city: city || "",
        addressLine: addressLine || "",

        grandTotalUGX,
        baseTotalUGX: grandTotalUGX,
        markupUGX: 0,
        fixedFeeUGX: 0,
        malloryUGX,
        malloryGBP,
        fxRateUGXtoGBP,

        paymentMethod: "flutterwave",
        paymentStatus: "pending",

        flutterwaveTxRef: txRef,

        items: {
          create: cart.map((item) => ({
            bookId: item.book_isbn || item.isbn,
            isbn: item.isbn || item.book_isbn,
            title: item.title || "",
            studentId: "TEMP_STUDENT",
            quantity: Number(item.quantity || 1),
            basePriceUGX: Number(item.price || 0),
            retailPriceUGX: Number(item.price || 0),
          })),
        },
      },
      include: { items: true },
    });

    return res.status(201).json({
      success: true,
      message: "Order initialized successfully",
      data: {
        orderId: order.id,
        txRef,
        orderTag,
        amount: grandTotalUGX,
      },
    });
  } catch (error) {
    console.error("❌ Error initializing order for Flutterwave:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error initializing order",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🟢 UPDATE ORDER STATUS AFTER FLUTTERWAVE PAYMENT                           */
/* -------------------------------------------------------------------------- */
export async function updateOrderStatusFromFlutterwave(req, res) {
  try {
    const {
      txRef,
      status,
      transactionId,
      rawFlutterwaveResponse,
    } = req.body || {};

    if (!txRef || !status) {
      return res.status(400).json({
        success: false,
        message: "txRef and status are required",
      });
    }

    const order = await prisma.order.findFirst({
      where: { flutterwaveTxRef: txRef },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const updated = await markOrderAsPaid(order.id, {
      transactionId,
      flwStatus: status,
      flwRaw: rawFlutterwaveResponse,
    });

    return res.status(200).json({
      success: true,
      message:
        status === "successful"
          ? "Order marked as paid"
          : "Order marked as failed",
      data: {
        orderId: updated.id,
        paymentStatus: updated.paymentStatus,
      },
    });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error updating order status",
    });
  }
}
