# MySkills Server - 部署指南

## 🚀 概述

本文档说明如何将 MySkills Protocol 项目部署到生产服务器，使 `https://myskills2026.ddttupuo.buzz/` 可以正常访问。

---

## 📋 前置条件

### 服务器要求

- **操作系统**：Ubuntu 20.04+ 或 Debian 10+
- **Node.js**：v18 或更高
- **PM2**：用于进程管理（推荐）
- **域名**：myskills2026.ddttupuo.buzz
- **防火墙**：开放端口 107（前端）、3000（API）

### 本地要求

- Git 已配置分支：`feat/moltiverse-openclaw`
- 构建工具：已通过 `npm run build` 完成

---

## 🛠️ 部署步骤

### 第一步：配置 GitHub Secrets

在 GitHub 仓库设置以下 Secrets（Settings → Secrets and variables → Actions → New repository secret）：

| Secret 名称 | 说明 | 示例值 |
|-------------|------|----------|
| `DEPLOY_HOST` | 服务器 SSH 地址 | `user@123.45.67.89` |
| `DEPLOY_SSH_KEY` | SSH 私钥 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_PATH` | 应用部署路径 | `/var/www/myskills2026` |
| `DEPLOY_URL` | 公开访问 URL | `https://myskills2026.ddttupuo.buzz` |

### 第二步：配置服务器

SSH 登录到服务器：

```bash
ssh user@your-server
```

安装必要工具：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js（如果未安装）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# 安装 PM2
npm install -g pm2

# 安装 Nginx（如果未安装）
sudo apt install -y nginx
```

**配置 Nginx**：

```nginx
# /etc/nginx/sites-available/myskills2026

server {
    listen 80;
    server_name myskills2026.ddttupuo.buzz;

    # 前端
    location / {
        proxy_pass http://localhost:107;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API 端口（如果需要外部访问）
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/myskills2026 /etc/nginx/sites-enabled/
sudo nginx -t
```

### 第三步：设置 GitHub Actions

**方法一：使用自动部署**

推送代码到 `feat/moltiverse-openclaw` 分支后，GitHub Actions 会自动执行部署流程。

**方法二：使用部署脚本**

克隆本仓库后，运行部署脚本：

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 执行部署（交互式）
./deploy.sh status      # 查看状态
./deploy.sh deploy        # 执行完整部署
./deploy.sh logs         # 查看日志
./deploy.sh health       # 健康检查
```

---

## 🔧 PM2 管理命令

### 查看 PM2 状态

```bash
ssh user@server "pm2 list"
```

### 重启服务

```bash
ssh user@server "pm2 restart myskills2026"
```

### 查看日志

```bash
ssh user@server "pm2 logs myskills2026 --lines 100"
```

### 实时监控

```bash
ssh user@server "pm2 monit"
```

---

## 📁 项目结构

部署后的服务器目录结构：

```
/var/www/myskills2026/
├── frontend/           # Next.js 前端应用
│   ├── .next/          # 构建
│   ├── node_modules/    # 依赖
│   └── package.json
├── cli/               # CLI 构建产物
│   ├── commands/        # 编译后的命令
│   └── package.json
├── shared/             # 共享模块
│   ├── dist/           # 构建产物
│   ├── node_modules/    # 依赖
│   └── package.json
├── backup/             # 自动备份目录
│   ├── frontend-*.tar.gz
│   └── cli-*.tar.gz
└── logs/              # 应用日志
    ├── api.log
    └── frontend.log
```

---

## 🌐 访问地址

部署成功后，以下地址应该可访问：

- **主站**：https://myskills2026.ddttupuo.buzz/
- **API 健康检查**：https://myskills2026.ddttupuo.buzz/api/health
- **前端端口**：107（通过 Nginx 反向代理）

---

## ⚠️ 故障排查

### 部署失败

1. 检查 GitHub Secrets 是否正确配置
2. 验证服务器 SSH 连接
3. 检查 PM2 是否已安装
4. 查看部署日志：`./deploy.sh logs`

### 服务无法访问

1. 检查 Nginx 配置：`sudo nginx -t`
2. 检查防火墙：`sudo ufw status`
3. 检查 DNS 解析：`nslookup myskills2026.ddttupuo.buzz`
4. 检查 PM2 状态：`ssh server "pm2 status"`

### API 错误

1. 查看 API 日志：`ssh server "tail -n 50 /var/www/myskills2026/api.log"`
2. 检查数据库连接
3. 验证环境变量：`ssh server "env | grep NODE"`

---

## 📞 支持

如遇到问题，请查看：
- GitHub Actions 运行日志
- 部署脚本日志
- PM2 应用日志

---

**最后更新**：2026年2月11日
