#!/bin/bash

###############################################################################
# MySkills Protocol - Moltiverse Deployment Script
# 用于 Feb 15 提交的快速部署
###############################################################################

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN="${1:-}"  # 从命令行参数获取域名
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}错误: 请提供域名${NC}"
    echo "使用方法: ./deploy-moltiverse.sh your-domain.com"
    exit 1
fi

REPO_URL="${2:-https://github.com/your-org/rebel-agent-skills.git}"
APP_DIR="/var/www/myskills"
SERVICE_NAME="myskills-api"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}MySkills Protocol 部署脚本${NC}"
echo -e "${GREEN}域名: $DOMAIN${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

# 2. 更新系统
echo -e "${YELLOW}[1/8] 更新系统...${NC}"
apt update && apt upgrade -y

# 3. 安装必要工具
echo -e "${YELLOW}[2/8] 安装必要工具...${NC}"
apt install -y git curl nginx certbot python3-certbot-nginx build-essential

# 4. 安装 Node.js 22
echo -e "${YELLOW}[3/8] 安装 Node.js 22...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}Node.js 已安装: $(node --version)${NC}"
fi

# 5. 克隆代码
echo -e "${YELLOW}[4/8] 克隆代码仓库...${NC}"
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}目录已存在，更新代码...${NC}"
    cd $APP_DIR
    git pull
else
    mkdir -p $APP_DIR
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 6. 安装依赖并构建
echo -e "${YELLOW}[5/8] 安装依赖并构建...${NC}"
cd $APP_DIR/packages/mcp-server
npm ci
npm run build

# 7. 创建 .env 文件
echo -e "${YELLOW}[6/8] 配置环境变量...${NC}"
cat > .env << EOF
MYSKILLS_NETWORK=testnet
MY_SKILLS_CONTRACT_ADDRESS=0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A
NODE_ENV=production
PORT=3000
EOF

# 8. 创建 API Server
echo -e "${YELLOW}[7/8] 创建 API Server...${NC}"
cat > api-server.js << 'EOFSERVER'
import express from 'express';
import cors from 'cors';
import { Server } from './build/index.js';

const app = express();
app.use(cors());
app.use(express.json());

const mcpServer = new Server();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MySkills MCP Server',
    timestamp: new Date().toISOString()
  });
});

// Smart Matching Engine
app.post('/api/smart-match', async (req, res) => {
  try {
    const { requirement, budget, optimization_goal = 'effectiveness', platform = 'all' } = req.body;

    if (!requirement || !budget) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['requirement', 'budget']
      });
    }

    console.log(`[Smart Match] requirement="${requirement}" budget=${budget} goal=${optimization_goal}`);

    const result = await mcpServer.callTool('find_skills_for_budget', {
      requirement,
      budget: Number(budget),
      optimization_goal,
      platform
    });

    res.json(result);
  } catch (error) {
    console.error('[Smart Match Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// List all skills
app.get('/api/skills', async (req, res) => {
  try {
    const { platform = 'all', sort = 'tips', limit = 50 } = req.query;
    const result = await mcpServer.callTool('list_skills', {
      platform,
      sort,
      limit: Number(limit)
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get skill details
app.get('/api/skills/:skillId', async (req, res) => {
  try {
    const { skillId } = req.params;
    const result = await mcpServer.callTool('get_skill', {
      skillId
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { timeframe = 'all', limit = 10 } = req.query;
    const result = await mcpServer.callTool('get_leaderboard', {
      timeframe,
      limit: Number(limit)
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`MySkills API Server running on port ${PORT}`);
});
EOFSERVER

# 安装 Express
npm install express cors

# 9. 配置 PM2
echo -e "${YELLOW}[8/8] 配置 PM2 服务...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 停止旧服务（如果存在）
pm2 delete $SERVICE_NAME 2>/dev/null || true

# 启动新服务
cd $APP_DIR/packages/mcp-server
pm2 start api-server.js --name $SERVICE_NAME --env production

# 保存 PM2 配置
pm2 save
pm2 startup

# 10. 配置 Nginx
echo -e "${YELLOW}配置 Nginx...${NC}"
cat > /etc/nginx/sites-available/myskills << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/myskills /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t && systemctl reload nginx

# 11. 配置 SSL
echo -e "${YELLOW}配置 SSL 证书...${NC}"
echo -e "${GREEN}请运行以下命令配置 SSL:${NC}"
echo -e "${YELLOW}certbot --nginx -d $DOMAIN${NC}"
echo ""
read -p "现在配置 SSL? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

# 12. 测试服务
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "服务状态:"
pm2 status $SERVICE_NAME
echo ""
echo -e "${GREEN}API 端点:${NC}"
echo -e "  Health:  https://$DOMAIN/health"
echo -e "  Smart Match: POST https://$DOMAIN/api/smart-match"
echo -e "  List Skills: GET  https://$DOMAIN/api/skills"
echo ""
echo -e "${GREEN}测试 Smart Matching:${NC}"
echo -e "curl -X POST https://$DOMAIN/api/smart-match \\"
echo -e "  -H \"Content-Type: application/json\" \\"
echo -e "  -d '{\"requirement\":\"Audit smart contract\",\"budget\":50}'"
echo ""
echo -e "${YELLOW}查看日志:${NC} pm2 logs $SERVICE_NAME"
echo -e "${YELLOW}重启服务:${NC} pm2 restart $SERVICE_NAME"
echo ""
