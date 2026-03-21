#!/bin/bash
set -e

echo "=== テラコード デプロイ ==="

cd "$(dirname "$0")"

echo "[1/4] git pull..."
git pull

echo "[2/4] npm install..."
npm ci --omit=dev

echo "[3/4] Prisma クライアント生成..."
npx prisma generate

echo "[4/4] ビルド..."
npm run build

echo "=== ビルド完了 ==="
echo "サーバーを再起動してください: pm2 restart teracode"
echo "または: pm2 reload ecosystem.config.js"
