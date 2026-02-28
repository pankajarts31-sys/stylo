import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bake the Railway backend URL into every production build
  // This ensures NEXT_PUBLIC_API_URL is never localhost in the deployed bundle
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "https://stylo-production.up.railway.app",
  },
  images: {
    // Allow Next.js Image component to load real product thumbnails from any domain
    remotePatterns: [
      { protocol: "https", hostname: "**.gstatic.com" },
      { protocol: "https", hostname: "**.google.com" },
      { protocol: "https", hostname: "**.serpapi.com" },
      { protocol: "https", hostname: "**.zara.com" },
      { protocol: "https", hostname: "**.fashionnova.com" },
      { protocol: "https", hostname: "**" }, // catch-all for all shopping domains
    ],
  },
};

export default nextConfig;
