#!/bin/bash
# ============================================================
# 灵笔 (LingBi) — 远程服务器一键部署脚本
# 在本地终端执行: bash deploy.sh
# ============================================================

set -e

# ---- 服务器配置 ----
SERVER_IP="129.204.5.208"
SERVER_USER="root"
SERVER_PASS="2wsxVFR_"
REMOTE_DIR="/root/lingbi-app"

# ---- 请修改为你的真实 API Key ----
# 支持 OpenAI / DeepSeek / 其他兼容接口
# DeepSeek 示例: sk-xxxx, base_url=https://api.deepseek.com/v1, model=deepseek-chat
# OpenAI  示例: sk-xxxx, base_url=https://api.openai.com/v1,   model=gpt-4o
OPENAI_API_KEY="sk-your-api-key-here"
OPENAI_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o"
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_urlsafe(32))")

echo "========================================"
echo "  灵笔 (LingBi) 一键部署"
echo "  服务器: ${SERVER_USER}@${SERVER_IP}"
echo "========================================"
echo ""

# 1. 安装 sshpass
if ! command -v sshpass &> /dev/null; then
    echo "[1/6] 安装 sshpass..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass 2>/dev/null || {
            echo "macOS 请先安装: brew install hudochenkov/sshpass/sshpass"
            exit 1
        }
    else
        sudo apt-get update -qq && sudo apt-get install -y -qq sshpass &>/dev/null
    fi
fi

SSH_CMD="sshpass -p '${SERVER_PASS}' ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_IP}"
SCP_CMD="sshpass -p '${SERVER_PASS}' scp -o StrictHostKeyChecking=no -o ConnectTimeout=10"

# 2. 检查连接
echo "[2/6] 检查服务器连接..."
if ! eval $SSH_CMD "echo '连接成功'" 2>/dev/null; then
    echo "❌ 无法连接服务器，请检查:"
    echo "   1. 服务器 IP 是否正确"
    echo "   2. 安全组是否开放 22 端口"
    echo "   3. 账号密码是否正确"
    exit 1
fi
echo ""

# 3. 服务器环境检查 & 安装 Docker
echo "[3/6] 检查/安装 Docker 环境..."
eval $SSH_CMD bash -s << 'REMOTE_SETUP'
set -e

# 检查系统
echo "系统: $(head -1 /etc/os-release | cut -d'"' -f2)"
echo "内核: $(uname -r)"

# 安装 Docker
if ! command -v docker &> /dev/null; then
    echo "正在安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
    echo "Docker 安装完成"
else
    echo "Docker 已安装: $(docker --version)"
fi

# 检查 docker compose
if ! docker compose version &> /dev/null; then
    echo "正在安装 docker compose 插件..."
    DOCKER_CONFIG=/usr/local/lib/docker
    mkdir -p $DOCKER_CONFIG/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o $DOCKER_CONFIG/cli-plugins/docker-compose
    chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
fi
echo "Docker Compose 就绪: $(docker compose version)"

# 清理旧项目
rm -rf /root/lingbi-app
mkdir -p /root/lingbi-app
echo "工作目录: /root/lingbi-app"
REMOTE_SETUP

echo ""

# 4. 传输项目文件
echo "[4/6] 传输项目文件..."
cd /workspace/lingbi-app
tar --exclude='node_modules' --exclude='.next' --exclude='.git' \
    -czf /tmp/lingbi.tar.gz . 2>/dev/null

eval $SCP_CMD /tmp/lingbi.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/
rm /tmp/lingbi.tar.gz

eval $SSH_CMD bash -s << 'REMOTE_EXTRACT'
cd /root/lingbi-app
tar -xzf /tmp/lingbi.tar.gz
rm /tmp/lingbi.tar.gz
echo "文件数: $(find . -type f | wc -l)"
REMOTE_EXTRACT

echo ""

# 5. 配置并启动
echo "[5/6] 配置环境变量，构建 Docker 镜像..."
eval $SSH_CMD bash -s << REMOTE_START
set -e
cd /root/lingbi-app

# 写入 .env
cat > .env << EOF
OPENAI_API_KEY=${OPENAI_API_KEY}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://${SERVER_IP}:3000
OPENAI_BASE_URL=${OPENAI_BASE_URL}
AI_MODEL=${AI_MODEL}
EOF

echo "构建 Docker 镜像（首次约 3-5 分钟）..."
docker compose build --no-cache

echo "启动服务..."
docker compose up -d

echo "等待数据库就绪..."
sleep 15
docker compose ps
REMOTE_START

echo ""

# 6. 验证
echo "[6/6] 验证部署..."
HTTP_CODE=$(eval $SSH_CMD "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 部署成功！HTTP 200"
else
    echo "⚠  HTTP 状态码: ${HTTP_CODE}，等待服务完全启动..."
    sleep 10
    HTTP_CODE=$(eval $SSH_CMD "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null" || echo "000")
    echo "重试: HTTP ${HTTP_CODE}"
fi

echo ""
echo "========================================"
echo "  部署完成！"
echo "========================================"
echo ""
echo "  访问地址:  http://${SERVER_IP}:3000"
echo "  演示账号:  demo@lingbi.com"
echo "  演示密码:  demo123456"
echo ""
echo "  运维命令 (SSH 登录后):"
echo "    cd /root/lingbi-app"
echo "    docker compose logs -f app   # 查看日志"
echo "    docker compose restart       # 重启"
echo "    docker compose down          # 停止"
echo ""
echo "  ⚠ 确定已在腾讯云安全组开放 3000 端口"
echo "========================================"