import type { NextConfig } from "next"

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
]

const nextConfig: NextConfig = {
  // Lighthouse / chrome-launcher must stay external (native + dynamic Chrome launch).
  serverExternalPackages: ["lighthouse", "chrome-launcher", "puppeteer"],
  // Playwright and some environments hit 127.0.0.1 instead of localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // Keep-alive helps PSI / sitemap fetches on the Node server.
  httpAgentOptions: {
    keepAlive: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
  },
  experimental: {
    // Tree-shake large barrels; lucide-react is already optimized by default.
    optimizePackageImports: ["@base-ui/react", "@stylexjs/stylex", "@tanstack/pacer"],
    serverActions: {
      // Analyze payloads are small (URL + budget); keep the body cap tight.
      bodySizeLimit: "1mb",
    },
  },
  logging: {
    incomingRequests: {
      ignore: [/^\/api\/health$/, /^\/api\/progress\//],
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/icon.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, immutable" }],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/robots.txt",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/opengraph-image",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
      {
        source: "/api/health",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/progress/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/lhr/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-cache" }],
      },
      {
        source: "/r/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-cache" }],
      },
      {
        source: "/c/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-cache" }],
      },
    ]
  },
}

export default nextConfig
