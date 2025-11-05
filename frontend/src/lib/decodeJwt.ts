// Runs on the Node server (not the Edge middleware).
// Safe to use jsonwebtoken here for decoding only (no verification).
import jwt from "jsonwebtoken";

export function decodeJwt<T = any>(token?: string): T | null {
  if (!token) return null;
  try {
    return jwt.decode(token) as T;
  } catch {
    return null;
  }
}
