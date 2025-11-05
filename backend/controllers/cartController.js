import pool from "../db.js";

/* -------------------------------------------------------------------------- */
/* 🛒 Add item to cart                                                        */
/* -------------------------------------------------------------------------- */
export const addToCart = async (req, res) => {
  try {
    const { user_id, book_isbn, quantity = 1 } = req.body;

    if (!user_id || !book_isbn)
      return res.status(400).json({ message: "Missing user_id or book_isbn" });

    // Check if book already exists in cart
    const existing = await pool.query(
      "SELECT id, quantity FROM cart_items WHERE user_id=$1 AND book_isbn=$2",
      [user_id, book_isbn]
    );

    if (existing.rowCount > 0) {
      const newQty = existing.rows[0].quantity + quantity;
      await pool.query("UPDATE cart_items SET quantity=$1 WHERE id=$2", [
        newQty,
        existing.rows[0].id,
      ]);
      return res.status(200).json({ message: "Quantity updated", quantity: newQty });
    }

    // Otherwise insert new
    await pool.query(
      "INSERT INTO cart_items (user_id, book_isbn, quantity) VALUES ($1,$2,$3)",
      [user_id, book_isbn, quantity]
    );

    res.status(201).json({ message: "Book added to cart" });
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ message: "Server error adding to cart" });
  }
};

/* -------------------------------------------------------------------------- */
/* 🧾 Get all cart items for a user                                           */
/* -------------------------------------------------------------------------- */
export const getCartItems = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT c.book_isbn, c.quantity, b.title, b.price, b.cover_image
       FROM cart_items c
       JOIN books b ON b.isbn = c.book_isbn
       WHERE c.user_id = $1
       ORDER BY c.added_at DESC`,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("getCartItems error:", err);
    res.status(500).json({ message: "Server error fetching cart" });
  }
};

/* -------------------------------------------------------------------------- */
/* ❌ Remove book from cart                                                   */
/* -------------------------------------------------------------------------- */
export const removeFromCart = async (req, res) => {
  try {
    const { user_id } = req.body;
    const { isbn } = req.params;

    if (!user_id || !isbn)
      return res.status(400).json({ message: "Missing user_id or isbn" });

    await pool.query("DELETE FROM cart_items WHERE user_id=$1 AND book_isbn=$2", [
      user_id,
      isbn,
    ]);

    res.status(200).json({ message: "Book removed from cart" });
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.status(500).json({ message: "Server error removing item" });
  }
};
