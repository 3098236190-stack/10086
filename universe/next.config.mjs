/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repo = "10086"; // GitHub Pages serves a project site at /<repo>/

const nextConfig = {
  output: "export", // fully static site (works on GitHub Pages / any static host)
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  transpilePackages: ["three"],
};

export default nextConfig;
