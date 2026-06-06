/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
// Served at /<repo>/universe/ (base single-file site lives at /<repo>/).
const base = "/10086/universe";

const nextConfig = {
  output: "export", // fully static site (works on GitHub Pages / any static host)
  basePath: isProd ? base : "",
  assetPrefix: isProd ? `${base}/` : "",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  transpilePackages: ["three"],
};

export default nextConfig;
