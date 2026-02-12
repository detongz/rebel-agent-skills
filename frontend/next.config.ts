import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker standalone 输出模式
  output: 'standalone',

  // 优化图片（可选）
  images: {
    unoptimized: true,
  },

  // 确保原生模块（如 better-sqlite3）被正确打包
  // Next.js 16: serverComponentsExternalPackages 移动到 serverExternalPackages
  serverExternalPackages: ['better-sqlite3'],

  // Turbopack 配置（Next.js 16 默认使用 Turbopack）
  turbopack: {},

  // Webpack 配置确保 better-sqlite3 原生模块被正确处理
  // 注意：Next.js 16 使用 Turbopack，webpack 配置可能不生效
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'better-sqlite3'];
    }
    return config;
  },
};

export default nextConfig;
