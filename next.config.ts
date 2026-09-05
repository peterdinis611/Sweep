import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["lighthouse", "chrome-launcher"],
  // Playwright a niektoré prostredia volajú 127.0.0.1 namiesto localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
}

export default nextConfig
