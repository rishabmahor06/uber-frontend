/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // lets a test build live beside a running `npm run dev`
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
