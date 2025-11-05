"use client";
import clsx from "clsx";

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
}) {
  const base =
    "font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variants = {
    primary: "bg-brand-blue text-white hover:bg-brand-accent",
    accent: "bg-yellow-400 text-white hover:bg-yellow-500",
    danger: "bg-brand-danger text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "text-xs px-3 py-1",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      onClick={onClick}
      className={clsx(base, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
}
