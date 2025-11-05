import { PrismaClient } from "@prisma/client";
import { notifyNewOrder } from "../notifications/sendgrid.js";

const prisma = new PrismaClient();

export const createNewOrder = async (data) => {
  // 💾 Save order
  const markup_ugx = Math.round(data.total_ugx * 0.15); // 15% markup for BBA
  const mallory_share = data.total_ugx - markup_ugx;

  const order = await prisma.orders.create({
    data: {
      parent_name: data.parent_name,
      parent_email: data.parent_email,
      total_ugx: data.total_ugx,
      payment_method: data.payment_method,
      markup_ugx,
      mallory_share,
      items_json: data.items_json,
    },
  });

  // 📧 Trigger email notification
  await notifyNewOrder(order);

  return order;
};
