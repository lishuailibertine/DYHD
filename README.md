# 抖音弹幕互动游戏

一个基于 Next.js 开发的抖音弹幕互动游戏，观众通过发送弹幕来触发游戏技能，实现实时互动效果。

## 功能特性

- 🎮 实时弹幕互动 - 观众发送弹幕触发游戏技能
- ⚔️ 多种技能系统 - 治疗、攻击、护盾、必杀技
- 🎨 炫酷动画效果 - 技能特效、伤害数字、屏幕震动
- 🔌 WebSocket 实时通信 - 支持实时推送弹幕消息
- 🎁 礼物互动 - 支持礼物触发特殊技能
- 📱 响应式设计 - 适配各种屏幕尺寸

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:5000` 启动。

### 3. 访问游戏

打开浏览器访问 `http://localhost:5000` 即可开始游戏。

### 4. 测试弹幕功能

打开测试工具：`http://localhost:5000/test.html`

## 游戏玩法

### 技能触发词

观众发送包含以下关键词的弹幕即可触发对应技能：

| 技能 | 触发词 | 效果 | 冷却时间 |
|------|--------|------|----------|
| 治疗 | 治疗、回血、奶一口 | 回复 200 点生命值 | 5 秒 |
| 攻击 | 攻击、打、砍 | 造成 (攻击力 - 敌人防御) 点伤害 | 2 秒 |
| 护盾 | 护盾、防御、格挡 | 开启防御护盾 | 10 秒 |
| 必杀技 | 必杀技、大招、绝招 | 造成 (攻击力 × 3 - 敌人防御) 点巨额伤害 | 30 秒 |

### 礼物互动

观众发送礼物会自动触发必杀技效果。

## 技术架构

### 前端技术栈

- **Next.js 16** - React 框架
- **React 19** - UI 库
- **TypeScript** - 类型安全
- **Tailwind CSS 4** - 样式框架
- **shadcn/ui** - UI 组件库

### 后端技术栈

- **Node.js** - 运行时环境
- **WebSocket** - 实时通信
- **Next.js API Routes** - RESTful API
- **Custom Server** - 自定义服务器支持 WebSocket

### 项目结构

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── douyin/
│   │   │   │   └── webhook/route.ts    # 抖音弹幕 Webhook 接口
│   │   │   └── ws/route.ts             # WebSocket/SSE 接口
│   │   └── page.tsx                    # 游戏主页面
│   └── components/ui/                   # shadcn/ui 组件
├── public/
│   └── test.html                        # 测试工具
├── server.js                            # 自定义 WebSocket 服务器
├── scripts/
│   └── dev.sh                           # 开发环境启动脚本
└── package.json
```

## 对接抖音开放平台

### 1. 获取应用凭证

1. 访问 [抖音开放平台](https://developer.open-douyin.com/)
2. 注册开发者账号并创建应用
3. 获取 App ID 和 App Secret

### 2. 配置 Webhook 回调

在抖音开放平台配置 Webhook 回调地址：

```
POST https://your-domain.com/api/douyin/webhook
```

### 3. 实现签名验证

在 `src/app/api/douyin/webhook/route.ts` 中的 `verifySign` 函数实现真实的签名验证逻辑：

```typescript
function verifySign(payload: string, sign: string): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.DOUYIN_APP_SECRET);
  hmac.update(payload);
  const calculatedSign = hmac.digest('hex');
  return calculatedSign === sign;
}
```

### 4. 处理弹幕事件

弹幕事件数据结构：

```typescript
{
  event_type: 'danmaku',
  data: {
    user_id: '用户ID',
    user_name: '用户名',
    content: '弹幕内容',
    timestamp: 1234567890,
  },
  sign: '签名'
}
```

### 5. 处理礼物事件

礼物事件数据结构：

```typescript
{
  event_type: 'gift',
  data: {
    user_id: '用户ID',
    user_name: '用户名',
    gift_id: '礼物ID',
    gift_name: '礼物名称',
    gift_count: 1,
    timestamp: 1234567890,
  },
  sign: '签名'
}
```

## WebSocket 连接

前端通过 WebSocket 连接实时接收弹幕消息：

```typescript
const ws = new WebSocket('ws://localhost:5000/api/ws');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'event') {
    // 处理弹幕消息
    handleDanmaku(message.data.content, message.data.user_name);
  }
};
```

## 环境变量

创建 `.env.local` 文件配置环境变量：

```env
DOUYIN_APP_ID=your_app_id
DOUYIN_APP_SECRET=your_app_secret
DOUYIN_REDIRECT_URI=https://your-domain.com/callback
```

## 部署

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 自定义技能

在 `src/app/page.tsx` 中修改技能配置：

```typescript
const [skills, setSkills] = useState<Skill[]>([
  {
    type: 'heal',
    name: '治疗',
    icon: <Heart className="h-6 w-6" />,
    trigger: '治疗',
    cooldown: 5000,
    lastUsed: 0
  },
  // 添加更多技能...
]);
```

在 `src/app/api/douyin/webhook/route.ts` 中修改触发词映射：

```typescript
const skillTriggers = {
  '治疗': 'heal',
  '回血': 'heal',
  '奶一口': 'heal',
  // 添加更多触发词...
};
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请通过以下方式联系：

- 提交 Issue
- 发送邮件

---

**注意**：此项目仅供学习和演示使用，实际对接抖音开放平台时，请遵守抖音开放平台的使用规范和条款。
