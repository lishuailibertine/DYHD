# 部署指南

本文档提供多种部署方案，帮助你将抖音互动游戏部署到公网，让其他人可以访问和测试。

## 📋 部署方案对比

| 方案 | 优点 | 缺点 | 适用场景 | 推荐度 |
|------|------|------|----------|--------|
| **ngrok** | ⭐ 最简单、免费、速度快 | ⚠️ 免费版域名不稳定 | 快速测试、演示 | ⭐⭐⭐⭐⭐ |
| **frp** | ⭐ 域名稳定、国内访问快 | ⚠️ 需要注册配置 | 国内长期使用 | ⭐⭐⭐⭐ |
| **云服务器** | ⭐ 稳定可靠、完全控制 | ⚠️ 需要购买、配置复杂 | 生产环境 | ⭐⭐⭐⭐⭐ |
| **Vercel** | ⭐ 免费部署、自动 HTTPS | ⚠️ 不支持 WebSocket | 纯静态页面 | ⭐⭐ |

---

## 🚀 方案1：使用 ngrok（快速开始）⭐

**最简单的方式，5分钟内获得公网地址！**

### 前置条件
- 已安装 [Node.js](https://nodejs.org/) 和 [pnpm](https://pnpm.io/)
- 已注册 [ngrok 账号](https://ngrok.com/)

### 步骤

#### 1. 安装 ngrok

**macOS (Homebrew):**
```bash
brew install ngrok
```

**Windows:**
```cmd
winget install ngrok.ngrok
```

**Linux:**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

#### 2. 配置认证

```bash
# 登录 ngrok 获取 token
ngrok config add-authtoken YOUR_TOKEN
```

获取 token 的方式：
1. 访问 https://dashboard.ngrok.com/get-started/your-authtoken
2. 复制你的 authtoken
3. 替换上面的 `YOUR_TOKEN`

#### 3. 启动游戏服务器

```bash
# 终端1：启动游戏服务器
pnpm dev
```

#### 4. 启动 ngrok

```bash
# 终端2：启动 ngrok
ngrok http 5000
```

你会看到类似这样的输出：
```
ngrok by @inconshreveable                                                                                                                           

Session Status                online                                                                                     
Account                       your-account (Plan: Free)                                                                    
Version                       3.x.x                                                                                      
Region                        Asia Pacific (ap)                                                                            
Forwarding                    https://abc123-def456.ngrok-free.app -> http://localhost:5000
```

#### 5. 复制公网地址

复制 `Forwarding` 中的 https 地址，例如：
```
https://abc123-def456.ngrok-free.app
```

#### 6. 配置抖音 Webhook

在抖音开放平台配置：
```
Webhook URL: https://abc123-def456.ngrok-free.app/api/douyin/webhook
```

#### 7. 访问游戏

打开浏览器访问：
```
https://abc123-def456.ngrok-free.app/stream
```

---

## 🎯 方案2：使用 frp（国内推荐）

如果你在国内，frp 提供更稳定的访问。

### 步骤

#### 1. 注册 frp 账号

访问 https://www.frps.cn 注册并开通隧道。

#### 2. 下载客户端

下载对应系统的 frp 客户端。

#### 3. 配置隧道

创建一个 HTTP 隧道，配置：
- 本地地址：`127.0.0.1`
- 本地端口：`5000`
- 隧道类型：`HTTP`
- 绑定域名：选择一个免费域名

#### 4. 启动客户端

```bash
./frpc -c frpc.toml
```

#### 5. 获取公网地址

在 frp 控制台查看你的隧道地址。

#### 6. 配置抖音 Webhook

```
Webhook URL: http://your-domain.frps.cn/api/douyin/webhook
```

---

## ☁️ 方案3：部署到云服务器（生产环境推荐）

如果你需要长期稳定运行，推荐部署到云服务器。

### 推荐的云服务

- **阿里云** - 国内访问快，价格适中
- **腾讯云** - 轻量应用服务器，适合中小项目
- **华为云** - 企业级服务，稳定性好

### 步骤

#### 1. 购买云服务器

推荐配置：
- CPU: 2核
- 内存: 4GB
- 带宽: 5Mbps
- 系统: Ubuntu 22.04 LTS

#### 2. 连接服务器

```bash
ssh root@your-server-ip
```

#### 3. 安装 Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 4. 安装 pnpm

```bash
npm install -g pnpm
```

#### 5. 克隆代码

```bash
git clone your-repo-url
cd your-project
```

#### 6. 安装依赖

```bash
pnpm install
```

#### 7. 构建项目

```bash
pnpm build
```

#### 8. 配置环境变量

```bash
cp .env.example .env
nano .env
```

填写必要的环境变量：
```
NEXT_PUBLIC_APP_ID=your-app-id
NEXT_PUBLIC_APP_SECRET=your-app-secret
```

#### 9. 启动服务

```bash
# 使用 PM2 管理进程
pnpm install -g pm2
pm2 start npm --name "douyin-game" -- start
pm2 save
pm2 startup
```

#### 10. 配置 Nginx

安装 Nginx：
```bash
sudo apt install -y nginx
```

配置 Nginx：
```bash
sudo nano /etc/nginx/sites-available/douyin-game
```

添加配置：
```nginx
upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/douyin-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 11. 配置 HTTPS（使用 Certbot）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### 12. 配置抖音 Webhook

```
Webhook URL: https://your-domain.com/api/douyin/webhook
```

---

## 📦 方案4：部署到 Vercel（仅静态页面）

如果你只需要静态页面（不需要 WebSocket），可以使用 Vercel 免费部署。

### 步骤

#### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. 连接 Vercel

访问 https://vercel.com，使用 GitHub 账号登录。

#### 3. 导入项目

点击 "Add New Project"，选择你的 GitHub 仓库。

#### 4. 配置项目

- Framework Preset: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

#### 5. 部署

点击 "Deploy" 按钮。

**⚠️ 注意**: Vercel 不支持 WebSocket，所以弹幕实时推送功能无法使用。

---

## 🔧 常见问题

### Q1: ngrok 免费版的限制是什么？

A: 
- 每次重启域名会变化
- 每月有流量限制（约 1GB）
- 1个并发连接
- 不适合生产环境

### Q2: 如何保持 ngrok 长期运行？

A: 使用付费版本，或者编写脚本自动重启：

```bash
#!/bin/bash
while true; do
  ngrok http 5000
  sleep 5
done
```

### Q3: 云服务器需要备案吗？

A: 如果是 .cn 域名或服务器在中国大陆，需要备案。建议使用香港或海外服务器。

### Q4: 如何保护 Webhook 接口？

A: 
1. 使用抖音开放平台的签名验证
2. 添加 IP 白名单
3. 使用 HTTPS

### Q5: 如何监控服务器运行状态？

A: 使用 PM2 监控：
```bash
pm2 logs douyin-game
pm2 monit
```

---

## 📚 部署检查清单

部署完成后，请确认：

- [ ] 服务正常运行（可以访问主页）
- [ ] 推流页面正常显示（/stream）
- [ ] WebSocket 连接正常
- [ ] Webhook 接口可访问
- [ ] 抖音开放平台已配置 Webhook URL
- [ ] 可以接收弹幕和礼物
- [ ] 游戏效果正常触发
- [ ] HTTPS 证书有效（生产环境）

---

## 🆘 需要帮助？

如果遇到问题，请检查：

1. 服务日志：`pm2 logs douyin-game`
2. Nginx 日志：`sudo tail -f /var/log/nginx/error.log`
3. 浏览器控制台（F12）
4. 网络请求（Network tab）

---

## 🎉 推荐部署流程

### 快速测试（5分钟）
1. 使用 ngrok 暴露本地服务
2. 配置抖音 Webhook
3. 开始测试

### 个人项目（30分钟）
1. 购买云服务器（推荐腾讯云轻量）
2. 安装环境和服务
3. 配置 Nginx 和 HTTPS
4. 部署项目

### 生产环境（1小时）
1. 购买阿里云/腾讯云服务器
2. 配置高可用架构
3. 设置 CDN 加速
4. 配置监控和告警
5. 备份和灾备方案

---

祝部署顺利！🚀
