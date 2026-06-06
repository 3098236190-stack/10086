/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three / r3f ship ESM that Next transpiles fine; keep transpilePackages for safety.
  transpilePackages: ["three"],
};

export default nextConfig;
