# 启动模式说明

本项目提供多种启动模式，适用于不同的使用场景。

## 📋 模式对比

| 模式 | 命令 | WebSocket | HMR | 适用场景 |
|------|------|-----------|-----|----------|
| **开发模式** | `pnpm dev` | ❌ | ✅ | 日常开发，代码频繁修改 |
| **开发+WebSocket** | `pnpm dev:ws` | ✅ | ❌ | 测试 WebSocket 功能 |
| **生产模式** | `pnpm build && pnpm start` | ✅ | N/A | 部署到生产环境 |

---

## 🚀 模式详解

### 1. 开发模式 (`pnpm dev`)

**命令**:
```bash
pnpm dev
```

**特点**:
- ✅ 支持热模块替换（HMR），代码修改后自动刷新
- ❌ 不支持游戏 WebSocket 连接
- ✅ 最快的开发体验

**适用场景**:
- 前端 UI 开发
- 组件开发
- 样式调整

**测试方式**:
- 使用 `/test.html` 页面手动发送测试消息
- 模拟 WebSocket 消息

**注意**:
- 游戏的 WebSocket 功能会显示连接失败，但不影响页面显示
- 可以通过测试工具验证功能

---

### 2. 开发+WebSocket 模式 (`pnpm dev:ws`)

**命令**:
```bash
pnpm dev:ws
```

**特点**:
- ✅ 支持游戏 WebSocket 连接
- ❌ 不支持 HMR，修改代码后需要手动刷新
- ✅ 完整的游戏功能

**适用场景**:
- 测试 WebSocket 连接
- 测试抖音 Webhook 推送
- 真实环境模拟测试

**测试方式**:
- 使用内网穿透工具（ngrok、frp）
- 配置抖音 Webhook
- 接收真实的弹幕和礼物

**注意**:
- 修改代码后需要手动刷新浏览器
- 适合功能测试，不适合频繁代码修改

---

### 3. 生产模式 (`pnpm build && pnpm start`)

**命令**:
```bash
pnpm build
pnpm start
```

**特点**:
- ✅ 支持游戏 WebSocket 连接
- ✅ 优化后的代码，性能最佳
- ✅ 适合生产环境部署

**适用场景**:
- 部署到服务器
- 真实直播使用
- 对接抖音开放平台

**部署**:
- 使用 PM2 管理进程
- 配置 Nginx 反向代理
- 启用 HTTPS

---

## 💡 推荐使用流程

### 开发阶段

```bash
# 1. 前端开发（日常）
pnpm dev
# 修改代码，自动热更新

# 2. 功能测试（需要 WebSocket）
pnpm dev:ws
# 测试 WebSocket 连接
# 使用 /test.html 或内网穿透测试
```

### 部署阶段

```bash
# 1. 构建项目
pnpm build

# 2. 启动生产服务
pnpm start

# 3. 使用 PM2 管理（推荐）
pm2 start npm --name "douyin-game" -- start
pm2 save
```

---

## 🔧 快速切换

### 从开发模式切换到 WebSocket 模式

```bash
# 停止当前服务（Ctrl+C）
# 启动 WebSocket 模式
pnpm dev:ws
```

### 从 WebSocket 模式切换到开发模式

```bash
# 停止当前服务（Ctrl+C）
# 启动开发模式
pnpm dev
```

---

## ⚠️ 常见问题

### Q1: 为什么开发模式不支持 WebSocket？

A: 开发模式使用 Next.js 标准服务器，以支持 HMR（热更新）。WebSocket 需要 HTTP upgrade 支持，这与 Next.js 的 HMR 机制冲突。

### Q2: 如何同时支持 WebSocket 和 HMR？

A: 目前这是 Next.js 的限制。如果需要 WebSocket，使用 `pnpm dev:ws`。如果需要热更新，使用 `pnpm dev`。

### Q3: 生产环境支持 HMR 吗？

A: 生产环境不需要 HMR，因为代码已经构建优化。生产环境使用自定义 server 支持 WebSocket。

### Q4: 如何选择合适的模式？

A:
- 日常开发 → `pnpm dev`
- 测试 WebSocket → `pnpm dev:ws`
- 生产部署 → `pnpm build && pnpm start`

---

## 📚 相关文档

- [部署指南](deployment-guide.md)
- [本地开发测试](local-development-guide.md)
- [同步到本地](sync-to-local.md)
