/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: "/api-backend/:path*", destination: "http://localhost:8000/api/:path*" },
      { source: "/media/:path*", destination: "http://localhost:8000/media/:path*" },
    ];
  },
};

module.exports = nextConfig;
