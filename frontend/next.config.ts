import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker standalone 输出模式
  output: 'standalone',

  // 优化图片（可选）
  images: {
    unoptimized: true,
  },

  // 确保原生模块（如 better-sqlite3）被正确打包
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

export default nextConfig;
