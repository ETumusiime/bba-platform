import { dirname } from "path";
import { fileURLToPath } from "url";
import { join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: ".next",
  webpack: (config) => {
    config.resolve.alias["@"] = join(__dirname);
    return config;
  },
  outputFileTracingRoot: __dirname   // ? Tells Next.js "frontend" is the real root
};

export default nextConfig;
