import jwt from "jsonwebtoken";

/**
 * 🔐 adminAuth Middleware
 * Ensures that:
 *  - A valid Bearer token is present
 *  - Token decodes correctly
 *  - User role is ADMIN
 */
export function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing token",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    // Attach admin to request object
    req.admin = decoded;

    next();
  } catch (err) {
    console.error("❌ Admin auth error", err);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
}
