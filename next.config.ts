import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build (optional, use with caution)
  typescript: {
    ignoreBuildErrors: false, // Keep this false to catch TS errors
  },
  // Optimize images
  images: {
    domains: [],
    formats: ["image/webp", "image/avif"],
  },
  // Optimize for production
  compress: true,
  // Configure headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

