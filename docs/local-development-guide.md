# 本地开发测试指南

在本地开发时，抖音开放平台需要向你的服务器推送 Webhook 事件，但 `localhost` 是私网地址，无法从外网访问。本文档介绍几种解决方案。

## 🎯 问题说明

抖音开放平台的 Webhook 需要：
- ✅ 公网可访问的 HTTPS 地址
- ✅ 固定的域名/IP
- ✅ 响应时间 < 3秒

本地开发环境：
- ❌ `localhost` 仅本地可访问
- ❌ 没有公网 IP
- ❌ 抖音平台无法访问

## ✅ 解决方案

### 方案一：使用 ngrok（推荐，最简单）

ngrok 是一款免费的内网穿透工具，可以将本地服务快速暴露到公网。

#### 1. 注册并下载 ngrok

1. 访问 https://ngrok.com/
2. 注册账号（免费）
3. 下载适合你操作系统的版本

#### 2. 安装并配置

**Windows:**
1. 下载 ngrok.exe
2. 将其放到任意目录（如 `C:\ngrok\`）
3. 将该目录添加到系统环境变量 PATH

**Mac/Linux:**
```bash
# 下载
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# 或使用 Homebrew
brew install ngrok
```

#### 3. 配置认证令牌

登录 ngrok 后台获取 authtoken：
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

#### 4. 启动内网穿透

启动你的游戏服务器：
```bash
pnpm dev
```

在新终端启动 ngrok：
```bash
ngrok http 5000
```

你会看到类似输出：
```
Session Status                online
Account                       your_email@example.com
Version                       3.x.x
Forwarding                    https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:5000
```

复制 `https://xxxx-xx-xx-xx-xx.ngrok-free.app` 这个地址。

#### 5. 配置抖音 Webhook

在抖音开放平台配置回调地址：
```
https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/douyin/webhook
```

#### 6. 测试连接

访问测试页面：
```
https://xxxx-xx-xx-xx-xx.ngrok-free.app/test.html
```

#### 7. 查看请求日志

ngrok 会显示所有请求：
```
GET /api/douyin/webhook              200 OK
POST /api/douyin/webhook             200 OK
```

### 方案二：使用 frp（国内推荐）

frp 是一个专注于内网穿透的高性能反向代理应用，支持 TCP、UDP、HTTP、HTTPS 等多种协议。

#### 1. 下载 frp

访问 https://github.com/fatedier/frp/releases 下载对应版本。

#### 2. 使用公共 frp 服务器

有很多免费的 frp 公共服务器可以使用：

- **frps.cn**: https://www.frps.cn
- **natapp**: https://natapp.cn
- **花生壳**: https://hsk.oray.com

以 natapp 为例：

1. 注册账号并登录
2. 免费开通隧道
3. 下载客户端
4. 配置并启动：
```bash
./natapp -authtoken=YOUR_TOKEN
```

#### 3. 使用自己的服务器

如果你有自己的云服务器：

**服务端配置 (frps.ini):**
```ini
[common]
bind_port = 7000
vhost_http_port = 80
```

**客户端配置 (frpc.ini):**
```ini
[common]
server_addr = your_server_ip
server_port = 7000

[douyin-game]
type = http
local_port = 5000
custom_domains = your_domain.com
```

### 方案三：使用 localtunnel

localtunnel 是一个简单易用的内网穿透工具。

#### 安装

```bash
npm install -g localtunnel
```

#### 使用

```bash
lt --port 5000
```

会返回一个公网 URL。

### 方案四：手动模拟测试（最简单）

如果你只是想测试功能，不需要真实的抖音推送，可以使用项目提供的测试工具。

#### 1. 启动游戏服务器

```bash
pnpm dev
```

#### 2. 打开测试页面

访问：`http://localhost:5000/test.html`

#### 3. 发送测试弹幕

在测试页面点击按钮或填写表单发送测试消息。

#### 4. 使用 curl 测试 API

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "event_type": "danmaku",
    "data": {
      "user_id": "test001",
      "user_name": "测试用户",
      "content": "治疗",
      "timestamp": 1234567890
    },
    "sign": "test"
  }' \
  http://localhost:5000/api/douyin/webhook
```

## 🔧 本地开发完整流程

### 使用 ngrok 的完整流程

#### 1. 启动游戏服务器

```bash
# 在项目根目录
pnpm dev
```

#### 2. 启动 ngrok

新开一个终端：
```bash
ngrok http 5000
```

#### 3. 复制公网地址

复制 ngrok 提供的 HTTPS 地址，例如：
```
https://abc123-def456.ngrok-free.app
```

#### 4. 配置环境变量

创建或编辑 `.env.local`：
```env
# 本地开发使用 ngrok 地址
NEXT_PUBLIC_API_URL=https://abc123-def456.ngrok-free.app

# 抖音配置（测试环境）
DOUYIN_APP_ID=your_app_id
DOUYIN_APP_SECRET=your_app_secret
DOUYIN_ROOM_ID=your_room_id
```

#### 5. 更新前端 WebSocket 地址

如果需要，修改 `src/app/stream/page.tsx` 中的 WebSocket 连接：

```tsx
// 开发环境使用 ngrok 地址
const wsUrl = process.env.NODE_ENV === 'development'
  ? `${wsProtocol}//${window.location.host}/api/ws`
  : `wss://abc123-def456.ngrok-free.app/api/ws`;
```

#### 6. 配置抖音 Webhook

在抖音开放平台后台配置：
```
Webhook URL: https://abc123-def456.ngrok-free.app/api/douyin/webhook
```

#### 7. 测试

1. 打开游戏页面：`http://localhost:5000/stream`
2. 在抖音直播间发送弹幕
3. 查看游戏页面是否接收到弹幕
4. 查看 ngrok 日志确认请求

## 🐛 常见问题

### 1. ngrok 连接失败

**问题**: ngrok 无法连接到本地服务器

**解决**:
- 确保游戏服务器已启动（端口 5000）
- 检查防火墙是否阻止了连接
- 确认端口 5000 没有被其他程序占用

### 2. Webhook 签名验证失败

**问题**: 抖音推送的 Webhook 签名验证失败

**解决**:
- 检查 `DOUYIN_APP_SECRET` 是否正确
- 确保请求体未被修改
- 查看服务器日志获取详细信息

### 3. WebSocket 连接失败

**问题**: WebSocket 无法连接到服务器

**解决**:
- 检查 ngrok 是否支持 WebSocket（免费版支持）
- 确认 WebSocket URL 配置正确
- 查看浏览器控制台错误信息

### 4. 请求超时

**问题**: 抖音推送请求超时

**解决**:
- 检查本地服务器性能
- 优化代码处理速度
- 使用更快的网络连接

### 5. ngrok 免费版限制

**问题**: ngrok 免费版有使用限制

**解决**:
- 免费版域名会变化（每次重启）
- 有带宽限制
- 考虑升级到付费版或使用其他方案

## 📊 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| ngrok | 简单易用，免费 | 域名会变化，有带宽限制 | ⭐⭐⭐⭐⭐ |
| frp | 性能好，稳定 | 需要配置 | ⭐⭐⭐⭐ |
| localtunnel | 非常简单 | 稳定性一般 | ⭐⭐⭐ |
| 手动测试 | 最简单 | 无法接收真实推送 | ⭐⭐⭐⭐ |

## 🚀 推荐流程

### 开发阶段

1. **使用手动测试** (`test.html`)
   - 快速验证功能
   - 无需配置

2. **使用 ngrok** 接收真实推送
   - 简单快捷
   - 适合测试

### 测试阶段

1. **使用 frp** 或自己的服务器
   - 稳定可靠
   - 接近生产环境

### 生产环境

1. **使用真实的云服务器**
   - 配置域名和 SSL
   - 确保稳定性和安全性

## 📝 快速开始命令

### ngrok 快速启动

```bash
# 1. 启动游戏服务器
pnpm dev

# 2. 新终端启动 ngrok
ngrok http 5000

# 3. 复制 ngrok 地址

# 4. 配置抖音 Webhook
# Webhook URL: https://xxxx.ngrok-free.app/api/douyin/webhook

# 5. 测试
curl -X POST -H "Content-Type: application/json" \
  -d '{"event_type":"danmaku","data":{"user_id":"test","user_name":"测试","content":"治疗","timestamp":1234567890},"sign":"test"}' \
  http://localhost:5000/api/douyin/webhook
```

### 手动测试

```bash
# 1. 启动游戏服务器
pnpm dev

# 2. 打开测试页面
# http://localhost:5000/test.html

# 3. 点击测试按钮发送弹幕
```

## 💡 最佳实践

1. **开发环境**：使用手动测试工具
2. **功能测试**：使用 ngrok 接收真实推送
3. **集成测试**：使用稳定的 frp 或自己的服务器
4. **生产环境**：使用真实的云服务器 + 域名 + SSL

## 🔗 相关链接

- [ngrok 官网](https://ngrok.com/)
- [frp GitHub](https://github.com/foredier/frp)
- [localtunnel GitHub](https://github.com/localtunnel/localtunnel)
- [natapp 官网](https://natapp.cn/)

---

**提示**：推荐使用 ngrok 进行本地开发测试，简单快捷。如果需要更稳定的方案，可以使用 frp 或自己的云服务器。
