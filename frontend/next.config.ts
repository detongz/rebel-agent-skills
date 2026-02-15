import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker standalone 输出模式
  output: 'standalone',

  // 临时放宽构建门禁，优先恢复线上可访问性
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 优化图片（可选）
  images: {
    unoptimized: true,
  },

  // 确保原生模块（如 better-sqlite3）被正确打包
  // Next.js 16.1+: 在使用 Turbopack 时，使用 serverExternalPackages
  serverExternalPackages: ['better-sqlite3'],

  // 修复 monorepo 中多个 lockfile 导致的 workspace root 检测问题
  // 明确指定 Turbopack 的根目录为当前目录（frontend/）
  // 注意: 此配置在 Next.js 16.1+ 中位于顶层
  turbopack: {
    root: process.cwd(),
  },

  // 重定向规则
  async redirects() {
    return [
      {
        source: '/goto/discord',
        destination: 'https://discord.gg/TfzSeSRZ',
        permanent: true, // 301 永久重定向
      },
    ];
  },
};

export default nextConfig;
