# MySkills Protocol - GitHub Secrets 配置清单

## 📋 配置说明

将以下 Secret 值复制到 GitHub 仓库的 Settings → Secrets and variables → Actions

**仓库地址**：`your-org/rebel-agent-skills`
**目标分支**：`feat/moltiverse-openclaw`
**配置时间**：2026年2月11日

---

## 🔐 需要配置的 Secrets

### Secret #1: DEPLOY_HOST

**名称**：`DEPLOY_HOST`

**描述**：服务器 SSH 地址或 IP 地址

**类型**：String

**示例值**：
```
user@123.45.67.89
```

**如何获取**：
- 如果是云服务器：在云服务商控制台查看
- 如果是 VPS：使用服务器公网 IP
- 如果有域名：使用域名（如 `myskills2026.ddttupuo.buzz`）

**注意事项**：
- 确保服务器已安装 SSH 服务
- 确保防火墙允许 SSH 连接（端口 22）
- 建议使用 SSH 密钥认证而非密码

---

### Secret #2: DEPLOY_SSH_KEY

**名称**：`DEPLOY_SSH_KEY`

**描述**：用于 SSH 连接的私钥（完整内容）

**类型**：String

**示例值**：
```
-----BEGIN OPENSSH PRIVATE KEY-----
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABQC1yc2EAAAADAQABAAABAAAAta2wLsAB...
（完整的私钥内容，约 40-50 行）
-----END OPENSSH PRIVATE KEY-----
```

**如何生成**（如果还没有密钥）：

**选项 A - 在服务器上生成新密钥对**：
```bash
# 在服务器上执行
ssh-keygen -t rsa -b 4096 -C "myskills-deploy" -f ~/.ssh/myskills-deploy

# 复制私钥内容
cat ~/.ssh/myskills-deploy
```

**选项 B - 在本地生成临时密钥对**：
```bash
# 在本地生成密钥对
ssh-keygen -t rsa -b 4096 -C "myskills-deploy" -f ./myskills-deploy -N ""

# 将生成的 myskills-deploy 文件内容复制到这里
```

**注意事项**：
- 私钥文件必须包含 `BEGIN` 和 `END` 标记
- 建议使用 RSA 4096 位密钥
- **重要**：不要将私钥泄露给任何人！

**推荐方式**：使用选项 A，更安全

---

### Secret #3: DEPLOY_PATH

**名称**：`DEPLOY_PATH`

**描述**：应用在服务器上的部署路径

**类型**：String

**示例值**：
```
/var/www/myskills2026
```

**常见路径**：
- `/var/www/myskills2026` - 标准 Linux 路径
- `/home/user/myskills2026` - 用户目录下
- `/opt/myskills2026` - opt 目录下

**注意事项**：
- 确保路径存在
- 确保对应用目录有读写权限
- 建议先创建 backup 子目录用于自动备份

**如何验证**：
```bash
# SSH 到服务器检查路径
ssh user@server "ls -la $DEPLOY_PATH"
```

---

### Secret #4: DEPLOY_URL

**名称**：`DEPLOY_URL`

**描述**：部署后用于健康检查的公网 URL

**类型**：String

**示例值**：
```
https://myskills2026.ddttupuo.buzz
```

**注意事项**：
- 必须包含协议（http:// 或 https://）
- 建议使用 https://
- URL 应指向服务器或负载均衡器
- 健康检查路径：`$DEPLOY_URL/api/health`

**如何验证**：
```bash
# 测试 URL 是否可访问
curl -I https://myskills2026.ddttupuo.buzz
```

---

## 📝 配置步骤

### 第 1 步：打开 GitHub Settings

1. 访问：`https://github.com/your-org/rebel-agent-skills/settings/secrets/actions`

2. 点击：**"New repository secret"** 按钮

3. 对每个 Secret 执行步骤 4-8

### 第 2-7 步：添加每个 Secret

**添加 DEPLOY_HOST**：
1. Name（名称）：输入 `DEPLOY_HOST`
2. Secret（值）：粘贴服务器地址
3. 点击：**"Add secret"** 按钮

**添加 DEPLOY_SSH_KEY**：
1. Name（名称）：输入 `DEPLOY_SSH_KEY`
2. Secret（值）：粘贴完整的私钥内容
3. 点击：**"Add secret"** 按钮

**添加 DEPLOY_PATH**：
1. Name（名称）：输入 `DEPLOY_PATH`
2. Secret（值）：粘贴部署路径
3. 点击：**"Add secret"** 按钮

**添加 DEPLOY_URL**：
1. Name（名称）：输入 `DEPLOY_URL`
2. Secret（值）：粘贴完整的 URL
3. 点击：**"Add secret"** 按钮

### 第 8 步：验证配置

**确认所有 Secret 已添加**：
- 在 Settings → Secrets 页面应该看到 4 个 secret
- 每个 secret 右侧显示时间（刚刚创建）

---

## ✅ 配置完成检查清单

配置完成后，确认以下项目：

- [ ] 所有 4 个 Secret 都已添加（DEPLOY_HOST、DEPLOY_SSH_KEY、DEPLOY_PATH、DEPLOY_URL）
- [ ] 分支名称正确：`feat/moltiverse-openclaw`
- [ ] 已推送到 GitHub

---

## 🚀 触发部署

配置完成后，有两种方式触发部署：

### 方式一：自动部署（推荐）

**推送代码到 feat/moltiverse-openclaw 分支**：

```bash
# 1. 确保在正确的分支
git checkout feat/moltiverse-openclaw

# 2. 添加并推送更改
git add .
git commit -m "chore: add GitHub Actions workflow and deploy script"
git push origin feat/moltiverse-openclaw
```

**GitHub Actions 会自动**：
1. 构建所有包
2. 上传到服务器
3. 备份现有文件
4. 部署新版本
5. 重启服务
6. 健康检查

### 方式二：手动触发

**如果不想推送代码，可以手动触发**：

1. 访问：`https://github.com/your-org/rebel-agent-skills/actions`
2. 点击左侧：**"MySkills Server - Deploy to Production"** workflow
3. 点击：**"Run workflow"** 按钮
4. 选择分支：`feat/moltiverse-openclaw`
5. 点击：**"绿色运行按钮"** ▶️

---

## 📊 部署时间线

| 阶段 | 预计时间 |
|------|----------|
| 构建 | 2-3 分钟 |
| 上传 | 3-5 分钟（取决于网络） |
| 部署 | 5-10 分钟 |
| 总计 | 10-20 分钟 |

---

## ⚠️ 重要提示

1. **首次部署前测试**：建议先在测试环境验证所有配置
2. **备份重要**：自动部署会自动备份，但首次部署前请手动备份
3. **监控部署日志**：在 GitHub Actions 页面查看实时日志
4. **服务器防火墙**：确保端口 22、80、107、3000 开放
5. **SSL 证书**：建议使用 Let's Encrypt 免费证书

---

## 📞 需要帮助？

如果您在配置过程中遇到问题，请告诉我：

1. 不清楚某个 Secret 的用途
2. 不知道服务器信息（IP、域名）
3. 不会生成 SSH 密钥对
4. 部署失败需要排查

---

**文档生成时间**：2026年2月11日
**适用分支**：feat/moltiverse-openclaw
