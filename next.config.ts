import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // 明确指定项目根目录，避免多个 lockfile 冲突
  turbopack: {
    root: path.resolve(__dirname),
  },
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
