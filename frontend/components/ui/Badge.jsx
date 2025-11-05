"use client";
import clsx from "clsx";

export default function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={clsx(
        "inline-block px-2 py-0.5 text-xs font-medium rounded-full",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
