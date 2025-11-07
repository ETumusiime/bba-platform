import { fileURLToPath } from "url";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Remove redirect — Next.js already uses /app/(public)/page.jsx for "/"
  // ✅ Just silence workspace root warning
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
