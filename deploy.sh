#!/bin/bash
set -e

echo "=== テラコード デプロイ ==="

cd "$(dirname "$0")"

echo "[1/4] git pull..."
git pull

echo "[2/4] npm install..."
# ビルドに TypeScript 等が必要なため dev も含めて入れる（本番実行は next start のみ）
npm ci

echo "[3/4] Prisma クライアント生成..."
npx prisma generate

echo "[3b/4] PM2 停止（ビルド中に server.js が消えてクラッシュループしないよう）..."
pm2 stop teracode 2>/dev/null || true

echo "[4/4] ビルド..."
# 古い .next が残るとマニフェストと実ファイルがずれ、/_next/static が 500 になり
# 「Application error: a client-side exception」になることがある
rm -rf .next
npm run build

echo "[4b/4] standalone: public と .next/static をコピー..."
mkdir -p .next/standalone/.next
if [ -d public ]; then
  cp -r public .next/standalone/
fi
cp -r .next/static .next/standalone/.next/

echo "[4c/4] PM2 再起動..."
fuser -k 3000/tcp 2>/dev/null || true
sleep 1
pm2 restart teracode 2>/dev/null || pm2 start ecosystem.config.cjs

echo "=== デプロイ完了 ==="
pm2 list

if command -v docker >/dev/null 2>&1 && [ -f docker-compose.yml ]; then
  echo "[任意] nginx コンテナを再起動しています..."
  docker compose restart nginx 2>/dev/null || true
fi
