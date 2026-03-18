import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // プロジェクトルートをこのディレクトリに固定
    root: __dirname,
  },
  // Prisma は Turbopack/Route Handler でバンドルすると実行時に壊れることがあるため外部化する
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
