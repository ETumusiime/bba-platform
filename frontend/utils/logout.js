"use client";

/**
 * Clears both localStorage and cookies for JWT token.
 * Optionally redirects to /login or a custom page.
 */
export function logout(redirect = true) {
  try {
    // Remove from localStorage
    localStorage.removeItem("parentToken");

    // Remove cookie (overwrite with empty & expired)
    document.cookie =
      "parentToken=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    console.log("✅ Logged out successfully");

    if (redirect && typeof window !== "undefined") {
      window.location.href = "/login";
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
}
