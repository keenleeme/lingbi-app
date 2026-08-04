#!/bin/bash
# ============================================================
#  灵笔 (LingBi) — 服务器端一键部署脚本
#  在服务器上直接执行: bash server-deploy.sh
#  前提: 已通过 git clone 把项目拉到服务器上
# ============================================================

set -e

# ==========================================================
#  ★ 请在此处修改你的 API Key 和模型配置
# ==========================================================
# DeepSeek 示例:
#   API_KEY="sk-你的DeepSeek密钥"
#   BASE_URL="https://api.deepseek.com/v1"
#   MODEL="deepseek-chat"
#
# OpenAI 示例:
#   API_KEY="sk-你的OpenAI密钥"
#   BASE_URL="https://api.openai.com/v1"
#   MODEL="gpt-4o"
# ==========================================================
API_KEY="sk-your-api-key-here"
BASE_URL="https://api.openai.com/v1"
MODEL="gpt-4o"
# ==========================================================

# 自动检测服务器公网 IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ip.sb 2>/dev/null || echo "localhost")
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "========================================"
echo "  灵笔 (LingBi) 服务器部署"
echo "  服务器 IP: ${SERVER_IP}"
echo "========================================"
echo ""

# ---------- 1. 检查 Docker ----------
echo "[1/4] 检查 Docker 环境..."

if ! command -v docker &> /dev/null; then
    echo "正在安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
    echo "Docker 安装完成"
else
    echo "Docker 已安装: $(docker --version)"
fi

if ! docker compose version &> /dev/null; then
    echo "正在安装 docker compose 插件..."
    DOCKER_CONFIG=/usr/local/lib/docker
    mkdir -p "$DOCKER_CONFIG/cli-plugins"
    curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o "$DOCKER_CONFIG/cli-plugins/docker-compose"
    chmod +x "$DOCKER_CONFIG/cli-plugins/docker-compose"
fi
echo "Docker Compose: $(docker compose version)"
echo ""

# ---------- 2. 配置环境变量 ----------
echo "[2/4] 配置环境变量..."

cat > .env << EOF
OPENAI_API_KEY=${API_KEY}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://${SERVER_IP}:3000
OPENAI_BASE_URL=${BASE_URL}
AI_MODEL=${MODEL}
EOF

echo "  API 地址:  ${BASE_URL}"
echo "  AI 模型:   ${MODEL}"
echo ""

# ---------- 3. 构建并启动 ----------
echo "[3/4] 构建 Docker 镜像并启动服务（首次约 3-5 分钟）..."

docker compose build --no-cache
docker compose up -d

echo ""
echo "等待服务就绪..."
sleep 10
docker compose ps
echo ""

# ---------- 4. 验证 ----------
echo "[4/4] 验证部署..."

# 等待数据库初始化 + 首次启动（Next.js standalone 编译需要时间）
MAX_WAIT=60
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "304" ]; then
        echo "✅ 服务响应正常 (HTTP ${HTTP_CODE})，耗时 ${ELAPSED}s"
        break
    fi
    sleep 3
    ELAPSED=$((ELAPSED + 3))
    echo "  等待中... (${ELAPSED}s, HTTP ${HTTP_CODE})"
done

if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "302" ] && [ "$HTTP_CODE" != "304" ]; then
    echo ""
    echo "⚠  服务可能仍在启动中，查看日志:"
    echo "   docker compose logs app --tail 50"
fi

echo ""
echo "========================================"
echo "  部署完成！"
echo "========================================"
echo ""
echo "  访问地址: http://${SERVER_IP}:3000"
echo "  演示账号: demo@lingbi.com"
echo "  演示密码: demo123456"
echo ""
echo "  常用命令:"
echo "    docker compose logs -f app       # 查看日志"
echo "    docker compose restart           # 重启服务"
echo "    docker compose down              # 停止服务"
echo "    docker compose up -d             # 启动服务"
echo ""
echo "  ⚠  确保安全组已开放 3000 端口"
echo "========================================"