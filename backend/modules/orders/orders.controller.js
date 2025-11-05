import { createNewOrder } from "./orders.service.js";

export const createOrder = async (req, res) => {
  try {
    const { parent_name, parent_email, total_ugx, items, items_json } = req.body;

    // ✅ Fix: allow either `items` or `items_json`
    // ✅ Fix: default payment_method to "flutterwave"
    if (!parent_name || !parent_email || !total_ugx) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // 🧩 Normalize items
    const normalizedItems = items_json
      ? typeof items_json === "string"
        ? JSON.parse(items_json)
        : items_json
      : items || [];

    // 🧾 Save order
    const order = await createNewOrder({
      parent_name,
      parent_email,
      total_ugx,
      payment_method: "flutterwave",
      items_json: JSON.stringify(normalizedItems),
    });

    res.status(201).json({
      success: true,
      order,
      message:
        "Order created successfully. You will receive an email confirmation shortly.",
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
