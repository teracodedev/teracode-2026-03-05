import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番は自己完結サーバーにすると静的ファイル配信が安定しやすい（next start で /_next/static が 500 になる環境の回避）
  output: "standalone",
  // Prisma は Turbopack/Route Handler でバンドルすると実行時に壊れることがあるため外部化する
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
