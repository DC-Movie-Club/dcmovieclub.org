/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  headers: async () => [
    {
      // Excluded: build assets, which otherwise lose Next's immutable header in
      // production and, in dev, get cached by browsers under filenames that don't
      // change when their contents do; and optimized images, which keep Next's
      // long cache lifetime instead of being re-optimized every minute
      source: "/((?!_next/static/|_next/image).*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=1, stale-while-revalidate=59",
        },
      ],
    },
    {
      // Admin and API responses depend on the session cookie, and the CDN caches
      // public responses regardless of request cookies
      source: "/:section(admin|api)/:path*",
      headers: [{ key: "Cache-Control", value: "private, no-store" }],
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
      {
        protocol: "https",
        hostname: "substackcdn.com",
      },
      {
        protocol: "https",
        hostname: "substack-post-media.s3.amazonaws.com",
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
