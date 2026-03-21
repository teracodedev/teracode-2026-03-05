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

echo "=== ビルド完了 ==="
echo "pm2 を再起動する前に 3000 を空ける（任意・EADDRINUSE 対策）:"
echo "  fuser -k 3000/tcp 2>/dev/null || true; sleep 1"
echo "pm2 を再起動: pm2 restart teracode"
echo "Docker の nginx を使っている場合（.next/static をマウントしている場合）:"
echo "  docker compose restart nginx"
echo "  ※ compose を実行するディレクトリと pm2 の cwd は同一のプロジェクトルートにすること"
if command -v docker >/dev/null 2>&1 && [ -f docker-compose.yml ]; then
  echo "[任意] nginx コンテナを再起動しています..."
  docker compose restart nginx 2>/dev/null || true
fi
