// backend/modules/orders/orders.service.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* 🆕 createOrderWithItems (alias of your createOrderFromCart)                */
/* -------------------------------------------------------------------------- */
export async function createOrderWithItems(payload) {
  return await createOrderFromCart(payload);
}

/* -------------------------------------------------------------------------- */
/* 🆕 createOrderFromCart – your original function (kept intact)              */
/* -------------------------------------------------------------------------- */
export async function createOrderFromCart(payload) {
  const {
    parentName,
    parentEmail,
    parentPhone,
    country,
    city,
    addressLine,
    cart = [],
    totalAmount,
    txRef,
  } = payload;

  // Recalculate server-side
  const computedTotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const grandTotalUGX = computedTotal;

  const baseTotalUGX = grandTotalUGX;
  const markupUGX = 0;
  const fixedFeeUGX = 0;
  const malloryUGX = grandTotalUGX;

  const order = await prisma.order.create({
    data: {
      orderTag: txRef,
      txRef,
      parentName,
      parentEmail,
      parentPhone,
      country,
      city,
      addressLine,

      totalUGX: grandTotalUGX,
      baseTotalUGX,
      markupUGX,
      fixedFeeUGX,
      malloryUGX,

      paymentStatus: "pending",
      items_json: cart, // Snapshot

      items: {
        create: cart.map((item) => ({
          isbn: item.isbn || item.book_isbn,
          title: item.title || "",
          quantity: Number(item.quantity || 1),
          unitPriceUGX: Number(item.price || 0),
          totalPriceUGX:
            Number(item.price || 0) * Number(item.quantity || 1),
        })),
      },
    },
    include: { items: true },
  });

  return order;
}

/* -------------------------------------------------------------------------- */
/* 🆕 getOrderById                                                            */
/* -------------------------------------------------------------------------- */
export async function getOrderById(id) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

/* -------------------------------------------------------------------------- */
/* 🆕 getOrderByTag (alias to your txRef-based find)                          */
/* -------------------------------------------------------------------------- */
export async function getOrderByTag(orderTag) {
  return prisma.order.findFirst({
    where: { orderTag },
    include: { items: true },
  });
}

/* -------------------------------------------------------------------------- */
/* 🔍 Original: findOrderByTxRef (kept)                                       */
/* -------------------------------------------------------------------------- */
export async function findOrderByTxRef(txRef) {
  if (!txRef) return null;
  return prisma.order.findUnique({
    where: { txRef },
    include: { items: true },
  });
}

/* -------------------------------------------------------------------------- */
/* 🆕 markOrderAsPaid → used after Flutterwave success                        */
/* -------------------------------------------------------------------------- */
export async function markOrderAsPaid(orderId, flwData) {
  const { transactionId, flwStatus, flwRaw } = flwData;

  return prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "paid",
      flutterwaveTxId: String(transactionId || ""),
      flutterwaveStatus: flwStatus || "successful",
      flutterwaveRaw: flwRaw ? JSON.stringify(flwRaw) : undefined,
    },
  });
}
