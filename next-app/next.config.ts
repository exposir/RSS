/**
 * [INPUT]: 依赖 process.env.NEXT_PUBLIC_BASE_PATH
 * [OUTPUT]: Next.js 构建配置 (Export, Images, BasePath)
 * [POS]: next-app/ 核心配置文件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/RSS/next",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
