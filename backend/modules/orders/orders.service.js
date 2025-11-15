// backend/modules/orders/orders.service.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* 🟢 ALIAS (Existing legacy compatibility)                                   */
/* -------------------------------------------------------------------------- */
export async function createOrderWithItems(payload) {
  return await createOrderFromCart(payload);
}

/* -------------------------------------------------------------------------- */
/* 🟢 CREATE ORDER + ITEMS (Old non-Flutterwave flow)                          */
/* -------------------------------------------------------------------------- */
export async function createOrderFromCart(payload) {
  const {
    parentId = "TEMP_PARENT_0001",
    parentName,
    parentEmail,
    parentPhone,
    country,
    city,
    addressLine,
    items = [],            // the legacy items array
    paymentMethod = "flutterwave",
    baseTotalUGX,
    fxRateUGXtoGBP = 1 / 5000,
  } = payload;

  const grandTotalUGX = baseTotalUGX;
  const markupUGX = 0;
  const fixedFeeUGX = 0;
  const malloryUGX = grandTotalUGX;
  const malloryGBP = Math.floor(grandTotalUGX / 5000);

  // Generate txRef + orderTag
  const random = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  const txRef = `BBA-${Date.now()}-${random}`;

  const order = await prisma.order.create({
    data: {
      orderTag: txRef,
      flutterwaveTxRef: txRef,

      parentId,
      parentName,
      parentEmail,
      parentPhone,
      country: country || "Uganda",
      city: city || "",
      addressLine: addressLine || "",

      grandTotalUGX,
      baseTotalUGX,
      markupUGX,
      fixedFeeUGX,

      malloryUGX,
      malloryGBP,
      fxRateUGXtoGBP,

      paymentMethod,
      paymentStatus: "pending",

      items: {
        create: items.map((item) => ({
          bookId: item.book_isbn || item.isbn,
          isbn: item.isbn || item.book_isbn,
          title: item.title,
          studentId: "TEMP_STUDENT",
          quantity: Number(item.quantity || 1),
          basePriceUGX: Number(item.price || 0),
          retailPriceUGX: Number(item.price || 0),
        })),
      },
    },
    include: { items: true },
  });

  return {
    order,
    orderTag: txRef,
    pricing: {
      grandTotalUGX,
      baseTotalUGX,
      markupUGX,
      fixedFeeUGX,
      malloryUGX,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* 🟢 GET ORDER BY ID                                                         */
/* -------------------------------------------------------------------------- */
export async function getOrderById(id) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

/* -------------------------------------------------------------------------- */
/* 🟢 GET ORDER BY TAG (Human readable ID)                                    */
/* -------------------------------------------------------------------------- */
export async function getOrderByTag(orderTag) {
  return prisma.order.findFirst({
    where: { orderTag },
    include: { items: true },
  });
}

/* -------------------------------------------------------------------------- */
/* 🟢 ORIGINAL TXREF LOOKUP (used by callbacks)                               */
/* -------------------------------------------------------------------------- */
export async function findOrderByTxRef(txRef) {
  return prisma.order.findFirst({
    where: { flutterwaveTxRef: txRef },
    include: { items: true },
  });
}

/* -------------------------------------------------------------------------- */
/* 🟢 MARK ORDER AS PAID                                                      */
/* -------------------------------------------------------------------------- */
export async function markOrderAsPaid(orderId, flwData) {
  const { transactionId, flwStatus, flwRaw } = flwData;

  return prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: flwStatus === "successful" ? "paid" : "failed",
      flutterwaveTxId: transactionId ? String(transactionId) : null,
      flutterwaveStatus: flwStatus || null,
    },
  });
}
