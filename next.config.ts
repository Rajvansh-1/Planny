import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Compress responses (gzip/brotli) ──────────────────────────────────────
  compress: true,

  // ─── Remove X-Powered-By header (minor security improvement) ───────────────
  poweredByHeader: false,

  // ─── Image optimisation ────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ─── HTTP Cache headers for static assets ──────────────────────────────────
  // Helps low-bandwidth users: assets are cached aggressively after first load
  async headers() {
    return [
      {
        // Cache the immutable Next.js static chunk files for 1 year
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache public image assets for 30 days
        source: '/planny-logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Cache the manifest and robots for 1 day
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=43200',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
