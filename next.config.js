/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
