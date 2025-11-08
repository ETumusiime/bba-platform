import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/* -------------------------------------------------------------------------- */
/* 🔐 General token verification (shared use)                                 */
/* -------------------------------------------------------------------------- */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

/* -------------------------------------------------------------------------- */
/* 👨‍👩‍👧 Require Parent Auth                                                */
/* -------------------------------------------------------------------------- */
export function requireParentAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 🧩 Debug logs for diagnosis
    console.log("🔐 Incoming parent token:", token.slice(0, 30) + "..." + token.slice(-30));
    console.log("🔍 JWT_SECRET used for verification =", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "PARENT") {
      return res.status(403).json({ error: "Unauthorized: Parent access only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Parent token verification failed:", error.message);
    console.log("🔍 JWT_SECRET used for verification =", process.env.JWT_SECRET);
    console.log("🔍 Incoming token snippet =", token.slice(0, 30) + "..." + token.slice(-30));
    return res.status(401).json({ error: "Invalid or expired parent token" });
  }
}

/* -------------------------------------------------------------------------- */
/* 🧒 Require Child Auth (for student routes if needed)                       */
/* -------------------------------------------------------------------------- */
export function requireChildAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 🧩 Debug logs for diagnosis
    console.log("🔐 Incoming child token:", token.slice(0, 30) + "..." + token.slice(-30));
    console.log("🔍 JWT_SECRET used for verification =", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "CHILD") {
      return res.status(403).json({ error: "Unauthorized: Child access only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Child token verification failed:", error.message);
    console.log("🔍 JWT_SECRET used for verification =", process.env.JWT_SECRET);
    console.log("🔍 Incoming token snippet =", token.slice(0, 30) + "..." + token.slice(-30));
    return res.status(401).json({ error: "Invalid or expired child token" });
  }
}
