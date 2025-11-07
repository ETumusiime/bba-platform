import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT from child cookie or header
 */
export function verifyChildToken(req, res, next) {
  try {
    const token =
      req.cookies?.bba_child_token ||
      req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.childId = decoded.id; // ✅ attach child ID to request
    next();
  } catch (err) {
    console.error("❌ verifyChildToken error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
