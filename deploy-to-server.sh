#!/bin/bash

###############################################################################
# MySkills Protocol - 远程部署脚本
# 本地构建完成后，直接部署到小服务器
###############################################################################

set -e

# 服务器配置
SERVER="root@107.174.147.10"
MOLTIVERSE_DOMAIN="myskills2026.ddttupupo.buzz"
BLITZ_DOMAIN="myskillsboss2026.ddttupupo.buzz"

echo "========================================="
echo "MySkills Protocol 远程部署"
echo "========================================="
echo ""
echo "Moltiverse 域名: $MOLTIVERSE_DOMAIN"
echo "Blitz Pro 域名: $BLITZ_DOMAIN"
echo "服务器: $SERVER"
echo ""

# 1. 本地构建（已完成）
echo "✓ 本地构建完成"

# 2. 创建部署包
echo "创建部署包..."
mkdir -p /tmp/myskills-deploy
cd /tmp/myskills-deploy

# 复制必要的文件
cp -r /Volumes/Kingstone/workspace/rebel-agent-skills/packages/mcp-server/. /tmp/myskills-deploy/

# 只保留生产环境需要的文件
rm -rf src tsconfig.json *.test.*
find . -name "*.test.*" -delete
find . -name "*.spec.*" -delete

# 创建 API Server
cat > api-server.js << 'EOF'
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
    timestamp: new Date().toISOString(),
    network: process.env.MYSKILLS_NETWORK || 'testnet'
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
EOF

# 创建环境配置
cat > .env << EOF
MYSKILLS_NETWORK=testnet
MY_SKILLS_CONTRACT_ADDRESS=0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A
NODE_ENV=production
PORT=3000
EOF

# 创建 package.json (仅生产依赖)
cat > package.json << 'EOF'
{
  "name": "myskills-api-server",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

# 复制 demo 页面
cp /Volumes/Kingstone/workspace/rebel-agent-skills/demo-page.html /tmp/myskills-deploy/public/index.html

echo "✓ 部署包创建完成"

# 3. 上传到服务器
echo "上传到服务器 $SERVER ..."
ssh $SERVER "mkdir -p /var/www/myskills"
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  /tmp/myskills-deploy/ $SERVER:/var/www/myskills/

echo "✓ 文件上传完成"

# 4. 在服务器上安装依赖和配置
echo "配置服务器环境..."
ssh $SERVER << 'ENDSSH'
# 更新包列表
apt update

# 安装 Node.js (如果还没安装)
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# 安装 PM2 (如果还没安装)
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 进入应用目录
cd /var/www/myskills

# 安装依赖
npm ci --production

# 创建 public 目录
mkdir -p public
ENDSSH

echo "✓ 服务器环境配置完成"

# 5. 配置 Nginx
echo "配置 Nginx..."
ssh $SERVER "cat > /etc/nginx/sites-available/myskills << EOF
server {
    listen 80;
    server_name $MOLTIVERSE_DOMAIN;

    # API endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3000;
    }

    # Demo page
    location / {
        root /var/www/myskills/public;
        index index.html;
        try_files \\\$uri \\\$uri/ /index.html;
    }
}
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/myskills /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
"

echo "✓ Nginx 配置完成"

# 6. 启动应用
echo "启动应用..."
ssh $SERVER << 'ENDSSH'
cd /var/www/myskills

# 停止旧服务
pm2 delete myskills-api 2>/dev/null || true

# 启动新服务
pm2 start api-server.js --name myskills-api --env production

# 保存 PM2 配置
pm2 save
pm2 startup
ENDSSH

echo "✓ 应用启动完成"

# 7. 配置 SSL
echo ""
echo "========================================="
echo "配置 SSL 证书"
echo "========================================="
echo "请运行以下命令配置 SSL:"
echo ""
echo "ssh $SERVER 'certbot --nginx -d $MOLTIVERSE_DOMAIN'"
echo ""

# 8. 测试
echo ""
echo "========================================="
echo "测试部署"
echo "========================================="
echo ""
echo "API 端点:"
echo "  Health:  http://$MOLTIVERSE_DOMAIN/health"
echo "  Smart Match: POST http://$MOLTIVERSE_DOMAIN/api/smart-match"
echo "  List Skills: GET  http://$MOLTIVERSE_DOMAIN/api/skills"
echo ""
echo "Demo 页面: http://$MOLTIVERSE_DOMAIN/"
echo ""
echo "测试命令:"
echo "curl -X POST http://$MOLTIVERSE_DOMAIN/api/smart-match \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"requirement\":\"Audit smart contract\",\"budget\":50}'"
echo ""
echo "查看日志: ssh $SERVER 'pm2 logs myskills-api'"
echo "重启服务: ssh $SERVER 'pm2 restart myskills-api'"
echo ""

# 清理临时文件
rm -rf /tmp/myskills-deploy

echo "========================================="
echo "部署完成！"
echo "========================================="
