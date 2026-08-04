#!/bin/bash
# ============================================================
#  灵笔 (LingBi) — 更新脚本 (用于服务器上直接更新)
#  用法: 在本地电脑执行此脚本，自动上传最新代码到服务器
# ============================================================

set -e

SERVER_IP="129.204.5.208"
SERVER_USER="root"
SERVER_PASS="2wsxVFR_"

echo "正在打包最新代码..."
cd /workspace/lingbi-app
tar --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='.env' \
    -czf /tmp/lingbi-update.tar.gz . 2>/dev/null

echo "正在上传到服务器..."
sshpass -p "${SERVER_PASS}" scp -o StrictHostKeyChecking=no \
    /tmp/lingbi-update.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

echo "正在解压并重建..."
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} bash -s << 'REMOTE'
set -e
cd /root/lingbi-app

# 备份 .env
cp .env /tmp/lingbi-env-backup 2>/dev/null || true

# 解压覆盖
tar -xzf /tmp/lingbi.tar.gz
rm /tmp/lingbi.tar.gz

# 恢复 .env
cp /tmp/lingbi-env-backup .env 2>/dev/null || true

# 重建并重启
docker compose down
docker compose build --no-cache
docker compose up -d

echo "等待服务就绪..."
sleep 15
docker compose ps
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3000/ || true
echo ""
echo "更新完成！"
REMOTE

rm /tmp/lingbi-update.tar.gz
echo "✅ 服务器已更新为最新代码"