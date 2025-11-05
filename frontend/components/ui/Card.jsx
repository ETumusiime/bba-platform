"use client";
import clsx from "clsx";

export default function Card({ children, className = "" }) {
  return (
    <div
      className={clsx(
        "bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition",
        className
      )}
    >
      {children}
    </div>
  );
}
