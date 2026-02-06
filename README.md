# 抖音互动游戏系统 - 完整版

一个功能完整的抖音弹幕互动游戏系统，支持实时直播展示、弹幕互动、礼物触发等能力，可直接推流到抖音直播间。

## 🎯 功能特性

### 核心功能

- ✅ **实时弹幕互动** - 观众发送弹幕触发游戏技能
- ✅ **礼物系统** - 礼物触发特殊技能效果，支持价值倍率
- ✅ **多种技能** - 治疗、攻击、护盾、必杀技，可自定义参数
- ✅ **实时通信** - WebSocket 长连接，低延迟推送
- ✅ **直播展示** - 专为直播间设计的沉浸式界面
- ✅ **推流支持** - 专用的推流模式页面，支持 OBS 推流
- ✅ **游戏管理** - 完整的配置管理系统
- ✅ **事件处理** - 支持弹幕、礼物、点赞、关注等多种事件

### 技术亮点

- 🚀 **Next.js 16** - 最新的 React 框架
- 🎨 **shadcn/ui** - 现代化 UI 组件库
- 🔌 **WebSocket** - 实时双向通信
- 🔐 **签名验证** - 完整的安全机制
- 📺 **推流优化** - 专为直播设计的推流页面
- 📱 **响应式设计** - 适配各种屏幕
- ⚡ **高性能** - 优化的事件处理和动画

## 📦 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 填写配置：

```env
DOUYIN_APP_ID=your_app_id
DOUYIN_APP_SECRET=your_app_secret
DOUYIN_ROOM_ID=your_room_id
GAME_ID=your_game_id
```

### 3. 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:5000` 启动。

## 📺 页面导航

### 1. 主页 (`/`)
游戏演示和功能说明，包含快速入口。

### 2. 直播预览 (`/live`)
功能完整的直播展示页面，适合预览和测试。

### 3. 推流模式 (`/stream`) ⭐
**专为推流设计的页面**，适合使用 OBS 或其他推流软件推流到直播间。

- ✅ 全屏布局，适合 1920x1080 分辨率
- ✅ 无多余元素，画面清晰
- ✅ 性能优化，确保流畅
- ✅ 包含观众人数、弹幕展示等直播要素

### 4. 管理后台 (`/admin`)
完整的游戏配置管理系统。

## 🎮 使用指南

### 游戏玩法

#### 技能触发词

| 技能 | 触发词 | 效果 | 冷却 |
|------|--------|------|------|
| 治疗术 | 治疗、回血、奶一口 | 回复200点生命值 | 5秒 |
| 普通攻击 | 攻击、打、砍 | 造成(攻击力-防御)点伤害 | 2秒 |
| 神圣护盾 | 护盾、防御、格挡 | 格挡50%伤害 | 10秒 |
| 终极奥义 | 必杀技、大招 | 造成300%攻击力的巨额伤害 | 30秒 |

#### 礼物效果

| 礼物名称 | 技能 | 倍率 | 说明 |
|---------|------|------|------|
| 爱心 | 治疗 | 1x | 基础治疗 |
| 666 | 攻击 | 1x | 基础攻击 |
| 玫瑰 | 治疗 | 2x | 中级治疗 |
| 跑车 | 必杀技 | 5x | 强力攻击 |
| 火箭 | 必杀技 | 10x | 终极攻击 |

## 📡 推流到直播间

### 方式一：使用 OBS 推流（推荐）

#### 步骤

1. **下载安装 OBS**
   - 访问 https://obsproject.com/
   - 下载并安装 OBS Studio

2. **配置浏览器源**
   - 在 OBS 中添加"浏览器"来源
   - URL: `http://localhost:5000/stream`
   - 宽度: 1920
   - 高度: 1080

3. **设置推流参数**
   - 在抖音直播伴侣中获取推流地址和密钥
   - 在 OBS 推流设置中填入信息

4. **开始推流**
   - 点击"开始推流"按钮
   - 游戏画面将显示在直播间

### 方式二：使用抖音直播伴侣

#### 步骤

1. **下载安装直播伴侣**
   - 访问 https://live.douyin.com/tool
   - 下载并安装抖音直播伴侣

2. **添加窗口源**
   - 选择"窗口" → "应用窗口"
   - 选择游戏页面所在的浏览器窗口

3. **开始直播**
   - 点击"开始直播"按钮

### 方式三：浏览器全屏

1. 在浏览器中打开推流页面：`http://localhost:5000/stream`
2. 按 F11 进入全屏模式
3. 在直播伴侣中选择屏幕录制或窗口录制

详细推流指南请查看 [docs/streaming-guide.md](docs/streaming-guide.md)

## 🔧 配置管理

### 基础配置
- 直播间 ID
- 游戏 ID
- 游戏时长

### 角色配置
- 玩家属性（名称、生命值、攻击力、防御力）
- 敌人属性（名称、生命值、攻击力、防御力）

### 技能配置
- 启用/禁用
- 冷却时间
- 效果值
- 倍率

## 📡 API 接口

### 1. Webhook 接口

**地址**: `POST /api/douyin/webhook`

**请求格式**:

```json
{
  "event_type": "danmaku",
  "data": {
    "room_id": "直播间ID",
    "user_id": "用户ID",
    "user_name": "用户昵称",
    "content": "弹幕内容",
    "timestamp": 1234567890
  },
  "sign": "签名"
}
```

### 2. WebSocket 接口

**地址**: `ws://localhost:5000/api/ws`

实时推送所有游戏事件。

## 🎯 对接抖音开放平台

### 1. 注册开发者账号

访问 [抖音开放平台](https://developer.open-douyin.com/) 注册开发者账号。

### 2. 创建应用

1. 登录后进入「应用管理」
2. 点击「创建应用」
3. 选择应用类型：网页应用

### 3. 获取凭证

创建应用后获得 App ID 和 App Secret。

### 4. 配置 Webhook

在应用配置中设置回调地址：
```
POST https://your-domain.com/api/douyin/webhook
```

详细对接指南请查看 [docs/douyin-integration-guide.md](docs/douyin-integration-guide.md)

## 🧪 本地开发测试

### 问题说明

抖音开放平台需要向公网地址推送 Webhook，但本地 `localhost` 无法从外网访问。

### 解决方案

#### 方法1：使用测试工具（推荐）⭐

访问在线测试页面：
```
http://localhost:5000/test.html
```

手动发送测试弹幕和礼物，快速验证功能。

#### 方法2：使用测试脚本

**Windows:**
```cmd
scripts\test-local.bat
```

**Mac/Linux:**
```bash
chmod +x scripts/test-local.sh
./scripts/test-local.sh
```

提供多种测试选项，支持批量测试。

#### 方法3：使用 ngrok（接收真实推送）

1. 下载安装 [ngrok](https://ngrok.com/)
2. 配置认证：
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```
3. 启动内网穿透：
   ```bash
   ngrok http 5000
   ```
4. 复制公网地址（如：`https://abc123.ngrok-free.app`）
5. 在抖音开放平台配置 Webhook：
   ```
   https://abc123.ngrok-free.app/api/douyin/webhook
   ```

#### 方法4：使用 frp

参考 [本地开发测试指南](docs/local-development-guide.md) 了解详细配置。

### 测试工具

访问 `http://localhost:5000/test.html` 使用在线测试工具。

### 2. API 测试

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

## 📁 项目结构

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── douyin/
│   │   │       └── webhook/
│   │   │           └── route.ts          # Webhook 接口
│   │   ├── stream/
│   │   │   └── page.tsx                  # 推流页面 ⭐
│   │   ├── live/
│   │   │   └── page.tsx                  # 直播展示页面
│   │   ├── admin/
│   │   │   └── page.tsx                  # 管理后台
│   │   ├── page.tsx                      # 主页
│   │   └── ws/
│   │       └── route.ts                  # WebSocket 接口
│   ├── services/
│   │   ├── douyin-auth.ts                # 认证服务
│   │   └── douyin-game.ts                # 游戏服务
│   └── components/ui/                    # shadcn/ui 组件
├── docs/
│   ├── douyin-integration-guide.md       # 对接指南
│   └── streaming-guide.md                # 推流指南 ⭐
├── public/
│   └── test.html                         # 测试工具
├── server.js                             # WebSocket 服务器
├── .env.example                          # 环境变量示例
└── package.json
```

## 🎨 界面预览

### 推流模式 (`/stream`)
- 1920x1080 全屏布局
- 左侧：玩家信息和技能
- 中间：战斗场景和敌人
- 右侧：实时弹幕列表
- 无多余元素，适合推流

### 直播预览 (`/live`)
- 功能完整的展示页面
- 包含所有功能
- 适合预览和测试

## 🔒 安全建议

1. **环境变量** - 使用环境变量存储敏感信息
2. **HTTPS** - 生产环境必须使用 HTTPS
3. **签名验证** - 启用签名验证确保请求安全
4. **限流** - 实现接口限流防止滥用

## 🚀 部署

### 开发环境

```bash
pnpm dev
```

### 生产环境

```bash
pnpm build
pnpm start
```

## 🌐 快速部署到公网

### 方式1：一键部署脚本（推荐）⭐

**Windows:**
```cmd
scripts\deploy-ngrok.bat
```

**Mac/Linux:**
```bash
chmod +x scripts/deploy-ngrok.sh
./scripts/deploy-ngrok.sh
```

脚本会自动：
1. ✅ 检查运行环境（Node.js、pnpm、ngrok）
2. ✅ 启动游戏服务器（如果未运行）
3. ✅ 启动 ngrok 内网穿透
4. ✅ 显示公网访问地址

获得公网地址后：
- 访问 `https://your-ngrok-domain.ngrok-free.app/stream` 查看游戏
- 配置抖音 Webhook 接收真实推送

### 方式2：手动使用 ngrok

```bash
# 终端1：启动游戏服务器
pnpm dev

# 终端2：启动 ngrok
ngrok http 5000
```

复制 ngrok 提供的 HTTPS 地址即可访问。

### 方式3：部署到云服务器

推荐用于生产环境，提供稳定可靠的服务。

**快速部署步骤：**
1. 购买云服务器（推荐：腾讯云轻量/阿里云 ECS）
2. 安装 Node.js 和 pnpm
3. 克隆代码并安装依赖
4. 配置环境变量
5. 使用 PM2 管理进程
6. 配置 Nginx 反向代理
7. 启用 HTTPS

详细配置请查看：[docs/deployment-guide.md](docs/deployment-guide.md)

### 部署方案对比

| 方案 | 时间 | 难度 | 稳定性 | 适用场景 |
|------|------|------|--------|----------|
| **ngrok** | 5分钟 | ⭐ | ⭐⭐⭐ | 快速测试、演示 |
| **云服务器** | 30分钟 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 生产环境、长期运行 |

## 📊 推流性能优化

- 使用固定分辨率（1920x1080）
- 优化动画性能
- 虚拟滚动处理弹幕
- 懒加载非关键资源

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 技术支持

- 项目文档：[README.md](README.md)
- 推流指南：[docs/streaming-guide.md](docs/streaming-guide.md)
- 对接指南：[docs/douyin-integration-guide.md](docs/douyin-integration-guide.md)

---

**注意**：
1. 推流模式页面专为直播推流设计，建议配合 OBS Studio 使用
2. 对接抖音开放平台时，请遵守抖音开放平台的使用规范和条款
3. 推流需要稳定的网络环境和合适的硬件配置
