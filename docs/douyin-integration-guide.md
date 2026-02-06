# 抖音开放平台互动游戏对接指南

## 一、抖音开放平台概述

抖音开放平台提供了完整的互动游戏能力，包括：

1. **弹幕消息** - 观众发送的文本消息
2. **礼物消息** - 观众赠送的虚拟礼物
3. **点赞消息** - 观众点赞操作
4. **关注消息** - 观众关注主播
5. **分享消息** - 观众分享直播间

## 二、开发者账号申请

### 1. 注册开发者账号

访问 [抖音开放平台](https://developer.open-douyin.com/) 并注册开发者账号。

### 2. 创建应用

1. 登录后进入「应用管理」
2. 点击「创建应用」
3. 选择应用类型：网页应用
4. 填写应用信息：
   - 应用名称
   - 应用描述
   - 应用图标
   - 应用分类（选择「游戏」）

### 3. 获取应用凭证

创建应用后，会获得以下信息：

- **App ID**：应用唯一标识
- **App Secret**：应用密钥（请妥善保管）

## 三、能力申请

### 1. 申请互动游戏能力

进入应用详情页，找到「能力管理」，申请以下能力：

- **互动游戏能力**
- **弹幕推送能力**
- **礼物推送能力**

### 2. 配置回调地址

在应用配置中设置 Webhook 回调地址：

```
POST https://your-domain.com/api/douyin/webhook
```

回调地址需要满足以下要求：
- 支持 HTTPS（生产环境）
- 响应时间小于 3 秒
- 返回 HTTP 200 状态码

## 四、认证授权流程

### 1. 获取 Access Token

抖音开放平台使用 OAuth 2.0 进行认证。

**接口地址**：`POST https://open.douyin.com/oauth/access_token/`

**请求参数**：

```json
{
  "client_key": "your_app_id",
  "client_secret": "your_app_secret",
  "grant_type": "client_credential"
}
```

**响应示例**：

```json
{
  "data": {
    "access_token": "clt.xxxxxxxxxxxxxxxxxxxxxxxxx",
    "expires_in": 7200
  },
  "message": "success"
}
```

### 2. 刷新 Access Token

Access Token 有效期为 2 小时，需要定期刷新。

**接口地址**：`POST https://open.douyin.com/oauth/refresh_token/`

**请求参数**：

```json
{
  "client_key": "your_app_id",
  "refresh_token": "your_refresh_token"
}
```

## 五、事件推送机制

抖音开放平台通过 Webhook 推送直播间事件到您的服务器。

### 1. 事件类型

#### 弹幕消息

```json
{
  "event_type": "danmaku",
  "data": {
    "room_id": "直播间ID",
    "user_id": "用户ID",
    "user_name": "用户昵称",
    "avatar_url": "用户头像URL",
    "content": "弹幕内容",
    "timestamp": 1234567890
  },
  "sign": "签名"
}
```

#### 礼物消息

```json
{
  "event_type": "gift",
  "data": {
    "room_id": "直播间ID",
    "user_id": "用户ID",
    "user_name": "用户昵称",
    "avatar_url": "用户头像URL",
    "gift_id": "礼物ID",
    "gift_name": "礼物名称",
    "gift_icon": "礼物图标URL",
    "gift_count": "礼物数量",
    "gift_price": "礼物价值（抖币）",
    "timestamp": 1234567890
  },
  "sign": "签名"
}
```

#### 点赞消息

```json
{
  "event_type": "like",
  "data": {
    "room_id": "直播间ID",
    "user_id": "用户ID",
    "user_name": "用户昵称",
    "timestamp": 1234567890
  },
  "sign": "签名"
}
```

### 2. 签名验证

为了确保消息安全性，需要验证签名。

**签名算法**：

```javascript
const crypto = require('crypto');

function verifySign(body, sign, appSecret) {
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(body);
  const calculatedSign = hmac.digest('hex');
  return calculatedSign === sign;
}
```

## 六、互动游戏接口

### 1. 开始游戏

**接口地址**：`POST https://open.douyin.com/game/start/`

**请求参数**：

```json
{
  "access_token": "access_token",
  "room_id": "直播间ID",
  "game_id": "游戏ID",
  "game_config": {
    "duration": 300,
    "skills": {
      "heal": {
        "trigger_words": ["治疗", "回血"],
        "cooldown": 5000
      }
    }
  }
}
```

### 2. 结束游戏

**接口地址**：`POST https://open.douyin.com/game/end/`

**请求参数**：

```json
{
  "access_token": "access_token",
  "room_id": "直播间ID",
  "game_id": "游戏ID",
  "result": {
    "winner": "player",
    "score": 1000
  }
}
```

### 3. 发送游戏指令

**接口地址**：`POST https://open.douyin.com/game/command/`

**请求参数**：

```json
{
  "access_token": "access_token",
  "room_id": "直播间ID",
  "command": {
    "type": "skill",
    "skill_id": "heal",
    "value": 200
  }
}
```

## 七、直播间配置

### 1. 开启互动游戏

在直播间后台开启互动游戏功能：

1. 进入直播间管理后台
2. 找到「互动设置」
3. 选择「互动游戏」
4. 选择要开启的游戏

### 2. 配置游戏参数

可以在直播间配置以下参数：

- 游戏时长
- 技能冷却时间
- 礼物倍率
- 参与门槛

## 八、测试环境

抖音开放平台提供测试环境用于开发调试。

**测试环境地址**：https://developer-test.douyin.com/

### 1. 创建测试直播间

在测试环境创建测试直播间用于调试。

### 2. 模拟观众行为

测试环境提供工具可以模拟：
- 发送弹幕
- 发送礼物
- 点赞
- 关注

## 九、上线流程

### 1. 完成测试

确保在测试环境通过所有测试用例。

### 2. 提交审核

提交应用到抖音开放平台审核。

### 3. 上线发布

审核通过后，正式上线发布。

## 十、注意事项

1. **安全**
   - 妥善保管 App Secret
   - 验证所有 Webhook 签名
   - 使用 HTTPS 保护数据传输

2. **性能**
   - Webhook 响应时间小于 3 秒
   - 建议使用异步处理
   - 实现消息队列处理高峰流量

3. **稳定性**
   - 实现断线重连机制
   - 做好日志记录
   - 监控服务状态

4. **合规**
   - 遵守抖音开放平台使用规范
   - 内容符合审核标准
   - 不侵犯用户隐私

## 十一、常见问题

### Q1: 如何处理高频弹幕？

建议使用消息队列（如 Redis、Kafka）来缓冲和异步处理高频消息。

### Q2: 礼物价值如何转换为游戏效果？

可以根据礼物价值设置不同的效果权重：

```javascript
const giftEffects = {
  '爱心': { value: 10, skill: 'heal' },
  '玫瑰': { value: 50, skill: 'attack' },
  '跑车': { value: 1000, skill: 'ult' }
};
```

### Q3: 如何避免重复处理？

在 Webhook 处理中实现幂等性检查：

```javascript
const processedEvents = new Set();

function isEventProcessed(eventId) {
  return processedEvents.has(eventId);
}

function markEventProcessed(eventId) {
  processedEvents.add(eventId);
}
```

## 十二、联系方式

- 技术支持邮箱：tech-support@open-douyin.com
- 开发者社区：https://developer.douyin.com/forum
