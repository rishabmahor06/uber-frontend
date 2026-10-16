/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // lets a test build live beside a running `npm run dev`
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    // keep one shared copy of mongoose (and its model registry) across API routes
    serverComponentsExternalPackages: ["mongoose"],
  },
};

export default nextConfig;
