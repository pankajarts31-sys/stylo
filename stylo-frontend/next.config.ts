import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/health", destination: `${backend}/health` },
    ];
  },
};

export default nextConfig;
