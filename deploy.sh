#!/bin/bash
set -e

echo "=== テラコード デプロイ ==="

cd "$(dirname "$0")"

echo "[1/5] git pull..."
git pull

echo "[2/5] npm install..."
npm ci

echo "[3/5] Prisma クライアント生成..."
npx prisma generate

echo "[4/5] ビルド..."
npm run build

echo "[5/5] PM2 再起動..."
pm2 restart teracode || pm2 start npm --name teracode -- start

echo "=== デプロイ完了 ==="
pm2 list
