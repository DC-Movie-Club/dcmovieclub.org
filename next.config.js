/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=1, stale-while-revalidate=59",
        },
      ],
    },
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: `/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/**`,
      },
    ],
  },
  outputFileTracingIncludes: {
    "/*": ["./public/**/*"],
  },
  reactStrictMode: true,
  trailingSlash: false,
};

module.exports = nextConfig;
