# 部署方案 - MySkills Protocol

## 服务器资源

- **服务器**: 你自己的服务器
- **域名 1**: Moltiverse 提交 (Feb 15)
- **域名 2**: Feb 28 提交

---

## 📅 Feb 15 提交 - Moltiverse (Agent Track)

### 部署目标
展示 **Smart Matching Engine** 的核心功能：
- NLP 分析需求
- 多维度评分系统
- 预算优化算法
- Agent-to-Agent 支付流程

### 部署方案 A: 最简单（推荐用于 Moltiverse）

**只部署 MCP Server，不需要 OpenClaw**

```bash
# 1. 在服务器上安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 克隆代码
git clone https://github.com/your-org/rebel-agent-skills.git
cd rebel-agent-skills/packages/mcp-server

# 3. 安装依赖
npm install

# 4. 配置环境变量
cat > .env << EOF
MYSKILLS_NETWORK=testnet
MY_SKILLS_CONTRACT_ADDRESS=0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A
EOF

# 5. 构建并启动
npm run build
npm start
```

**访问方式**:
- MCP Server 会监听 stdin/stdout（MCP 协议标准）
- Demo 视频展示本地测试结果

### 部署方案 B: 带 Web 界面

如果你想要一个可访问的 Web 演示：

```bash
# 使用简单的 Express 服务器包装 MCP
npm install express

# 创建 web server
cat > server.js << 'EOF'
import express from 'express';
import { Server } from './build/index.js';

const app = express();
app.use(express.json());

const mcpServer = new Server();

// Smart Matching API
app.post('/api/find-skills', async (req, res) => {
  const { requirement, budget, optimization_goal } = req.body;
  // 调用 Smart Matching Engine
  const result = await mcpServer.callTool('find_skills_for_budget', {
    requirement,
    budget,
    optimization_goal
  });
  res.json(result);
});

// List Skills API
app.get('/api/skills', async (req, res) => {
  const result = await mcpServer.callTool('list_skills', req.query);
  res.json(result);
});

app.listen(3000, () => {
  console.log('MySkills API running on port 3000');
});
EOF

# 启动
node server.js
```

**Demo 展示**:
```
curl -X POST https://your-domain-1.com/api/find-skills \
  -H "Content-Type: application/json" \
  -d '{
    "requirement": "Audit this smart contract",
    "budget": 50,
    "optimization_goal": "security"
  }'
```

---

## 📅 Feb 28 提交 - Monad Blitz Pro

### 部署目标
完整的 x402 支付基础设施：
- Gasless 支付协议
- Facilitator 节点
- Agent 协调系统
- 完整的 DApp

### 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                    你的服务器                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐        ┌──────────────────┐           │
│  │   MCP Server     │        │  Web Frontend    │           │
│  │  (Smart Matching)│◄──────►│   (React/Vue)    │           │
│  │   Port 3000      │        │   Port 80/443    │           │
│  └────────┬─────────┘        └──────────────────┘           │
│           │                                                   │
│           ▼                                                   │
│  ┌──────────────────┐        ┌──────────────────┐           │
│  │  x402 Facilitator│        │   PostgreSQL     │           │
│  │      Service     │◄──────►│    Database      │           │
│  │   Port 4000      │        │   Port 5432      │           │
│  └────────┬─────────┘        └──────────────────┘           │
│           │                                                   │
│           ▼                                                   │
│  ┌───────────────────────────────────────────────────┐      │
│  │           Monad Testnet RPC                       │      │
│  │      https://testnet-rpc.monad.xyz               │      │
│  └───────────────────────────────────────────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Docker Compose 部署 (推荐用于 Feb 28)

```yaml
# docker-compose.yml
version: '3.8'

services:
  mcp-server:
    build: ./packages/mcp-server
    container_name: myskills-mcp
    env_file:
      - .env
    ports:
      - "3000:3000"
    restart: unless-stopped

  x402-facilitator:
    build: ./packages/x402-facilitator
    container_name: x402-facilitator
    environment:
      - FACILITATOR_PRIVATE_KEY=${FACILITATOR_KEY}
      - MONAD_RPC=https://testnet-rpc.monad.xyz
    ports:
      - "4000:4000"
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: myskills-frontend
    environment:
      - NEXT_PUBLIC_API_URL=https://your-domain-2.com
    ports:
      - "80:3000"
    restart: unless-stopped

  postgres:
    image: postgres:16
    container_name: myskills-db
    environment:
      - POSTGRES_DB=myskills
      - POSTGRES_USER=myskills
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**部署命令**:
```bash
# 在服务器上
git clone https://github.com/your-org/rebel-agent-skills.git
cd rebel-agent-skills

# 配置环境变量
cat > .env << EOF
MYSKILLS_NETWORK=testnet
MY_SKILLS_CONTRACT_ADDRESS=0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A
FACILITATOR_KEY=your_private_key_here
DB_PASSWORD=secure_password_here
EOF

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 🚀 立即部署步骤 (Feb 15)

### 1. 准备服务器

```bash
# SSH 连接到服务器
ssh user@your-server

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y git curl nginx certbot python3-certbot-nginx
```

### 2. 安装 Node.js

```bash
# 安装 Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应该是 v22.x.x
npm --version
```

### 3. 部署 MCP Server

```bash
# 克隆代码（使用你的实际仓库）
git clone https://github.com/your-org/rebel-agent-skills.git
cd rebel-agent-skills/packages/mcp-server

# 安装依赖
npm ci

# 配置环境
cat > .env << EOF
MYSKILLS_NETWORK=testnet
MY_SKILLS_CONTRACT_ADDRESS=0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A
EOF

# 构建
npm run build

# 测试
node test-smart-matching.cjs
```

### 4. 创建简单的 Web API

```bash
# 安装 Express
npm install express cors

# 创建 API server
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
  res.json({ status: 'ok', service: 'MySkills MCP Server' });
});

// Smart Matching Engine
app.post('/api/smart-match', async (req, res) => {
  try {
    const { requirement, budget, optimization_goal = 'effectiveness', platform = 'all' } = req.body;

    if (!requirement || !budget) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const result = await mcpServer.callTool('find_skills_for_budget', {
      requirement,
      budget: Number(budget),
      optimization_goal,
      platform
    });

    res.json(result);
  } catch (error) {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MySkills API Server running on port ${PORT}`);
});
EOF

# 启动服务
node api-server.js
```

### 5. 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置
sudo cat > /etc/nginx/sites-available/myskills << 'EOF'
server {
    listen 80;
    server_name your-domain-1.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# 启用配置
sudo ln -s /etc/nginx/sites-available/myskills /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 配置 SSL (Let's Encrypt)
sudo certbot --nginx -d your-domain-1.com
```

### 6. 使用 PM2 保持服务运行

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 启动服务
pm2 start api-server.js --name myskills-api

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs myskills-api
```

### 7. 测试 API

```bash
# 测试 Smart Matching Engine
curl -X POST https://your-domain-1.com/api/smart-match \
  -H "Content-Type: application/json" \
  -d '{
    "requirement": "Audit this smart contract for security vulnerabilities",
    "budget": 50,
    "optimization_goal": "security"
  }'

# 测试 List Skills
curl https://your-domain-1.com/api/skills?platform=all&sort=tips&limit=10
```

---

## 📝 Demo 视频录制 (使用部署的服务)

录制时使用你自己的域名：

```bash
# 场景 1: Smart Matching Engine
curl -X POST https://your-domain-1.com/api/smart-match \
  -H "Content-Type: application/json" \
  -d '{
    "requirement": "Audit this smart contract",
    "budget": 100,
    "optimization_goal": "security"
  }' | jq

# 场景 2: 不同的优化目标
curl -X POST https://your-domain-1.com/api/smart-match \
  -H "Content-Type: application/json" \
  -d '{
    "requirement": "Optimize gas usage",
    "budget": 30,
    "optimization_goal": "cost"
  }' | jq
```

---

## ✅ 检查清单

### Feb 15 (Moltiverse)
- [ ] 服务器环境配置完成
- [ ] MCP Server 部署
- [ ] API 服务运行
- [ ] Nginx 配置
- [ ] SSL 证书
- [ ] API 测试通过
- [ ] Demo 视频录制
- [ ] Moltiverse 提交

### Feb 28 (Blitz Pro)
- [ ] Docker Compose 配置
- [ ] x402 Facilitator 部署
- [ ] 前端 DApp 部署
- [ ] PostgreSQL 数据库
- [ ] 完整测试
- [ ] 提交材料准备

---

## 🎯 下一步

现在可以立即部署到你的服务器。需要我帮你：
1. 生成部署脚本？
2. 创建前端页面？
3. 准备 demo 视频录制指南？
