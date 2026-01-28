import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Base path for GitHub Pages deployment under /RSS/next
  // Note: This matches the deployment URL https://exposir.github.io/RSS/next
  basePath: "/RSS/next",

  // GitHub Pages doesn't support Next.js Image Optimization
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for static export to work well with GitHub Pages
  trailingSlash: true,
};

export default nextConfig;
