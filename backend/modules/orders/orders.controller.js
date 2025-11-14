// backend/modules/orders/orders.controller.js
import { createOrderWithItems, getOrderById, getOrderByTag } from "./orders.service.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * POST /api/orders
 * Create an order + items (no payment yet) – existing flow.
 */
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
        message: "baseTotalUGX (Mallory total in UGX) is required",
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
      data: {
        order,
        pricing,
        orderTag,
      },
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating order",
    });
  }
}

/**
 * GET /api/orders/:id
 */
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

/**
 * GET /api/orders/by-tag/:orderTag
 */
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
/* 🌍 NEW: /api/orders/init – create order for FlutterwaveButton              */
/* -------------------------------------------------------------------------- */
/**
 * POST /api/orders/init
 *
 * Body:
 * {
 *   parentName: string,
 *   parentEmail: string,
 *   parentPhone?: string,
 *   country?: string,
 *   city?: string,
 *   addressLine?: string,
 *   cart: [
 *     {
 *       isbn: string,
 *       book_isbn: string,
 *       title: string,
 *       price: number,
 *       quantity: number,
 *       cover_url: string
 *     }
 *   ]
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     orderId: string,
 *     txRef: string,
 *     amount: number
 *   }
 * }
 */
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
    } = req.body || {};

    // Basic validation
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

    // Compute total from cart (price already includes markup + buffer in your model)
    const totalUGX = cart.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);

    if (totalUGX <= 0) {
      return res.status(400).json({
        success: false,
        message: "Calculated total amount is invalid",
      });
    }

    // Generate backend tx_ref (used by Flutterwave)
    const random = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, "0");
    const txRef = `BBA-${Date.now()}-${random}`;

    // Create order record
    // Assumes your Order model has fields:
    // - parentName, parentEmail, parentPhone, country, city, addressLine
    // - totalUGX, paymentStatus, txRef, items_json
    const order = await prisma.order.create({
      data: {
        parentName,
        parentEmail,
        parentPhone: parentPhone || "",
        country: country || "Uganda",
        city: city || "",
        addressLine: addressLine || "",
        totalUGX,
        paymentStatus: "pending",
        txRef,
        // raw cart snapshot for audit & later assignment
        items_json: cart,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Order initialized successfully",
      data: {
        orderId: order.id,
        txRef,
        amount: totalUGX,
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
/* 🌍 NEW: /api/orders/update-status – Flutterwave callback → update order    */
/* -------------------------------------------------------------------------- */
/**
 * POST /api/orders/update-status
 *
 * Body (sent from frontend after Flutterwave callback):
 * {
 *   txRef: string,             // response.tx_ref
 *   status: string,            // "successful" | "cancelled" | "failed" etc
 *   transactionId?: string|number, // response.transaction_id
 *   rawFlutterwaveResponse?: any
 * }
 */
export async function updateOrderStatusFromFlutterwave(req, res) {
  try {
    const { txRef, status, transactionId, rawFlutterwaveResponse } = req.body || {};

    if (!txRef || !status) {
      return res.status(400).json({
        success: false,
        message: "txRef and status are required",
      });
    }

    const order = await prisma.order.findFirst({
      where: { txRef },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for provided txRef",
      });
    }

    const isSuccessful = status === "successful";

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: isSuccessful ? "paid" : "failed",
        flutterwaveTxRef: txRef,
        flutterwaveTxId: transactionId ? String(transactionId) : null,
        flutterwaveStatus: status,
        // if you have a JSON column to keep full payload, you can store it here:
        // flutterwavePayload: rawFlutterwaveResponse || null,
      },
    });

    return res.status(200).json({
      success: true,
      message: isSuccessful
        ? "Order marked as paid"
        : "Order marked as failed / not successful",
      data: {
        orderId: updated.id,
        paymentStatus: updated.paymentStatus,
      },
    });
  } catch (error) {
    console.error("❌ Error updating order status from Flutterwave:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error updating order status",
    });
  }
}
