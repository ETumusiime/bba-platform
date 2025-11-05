import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: ".next",

  webpack: (config) => {
    // ✅ Log to confirm alias in console
    console.log("✅ Applying alias '@' →", path.resolve(__dirname));
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },
};

export default nextConfig;
