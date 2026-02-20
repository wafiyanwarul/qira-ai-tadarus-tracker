import type { NextConfig } from "next";
import { env, envStatus } from "./src/config/env";

if (!env.isProduction) {
  console.log("[config] Server env status:", {
    GROQ_API_KEY: envStatus.GROQ_API_KEY,
    GEMINI_API_KEY: envStatus.GEMINI_API_KEY,
  });
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
