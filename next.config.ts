import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // プロジェクトルートをこのディレクトリに固定
    root: __dirname,
  },
};

export default nextConfig;
