import { NextRequest, NextResponse } from 'next/server';
import DouyinAuthService from '@/services/douyin-auth';
import DouyinGameService from '@/services/douyin-game';

// 抖音弹幕事件类型
interface DouyinDanmakuEvent {
  event_type: 'danmaku' | 'gift' | 'like' | 'share' | 'follow' | 'enter_room' | 'exit_room';
  data: {
    room_id?: string;
    user_id: string;
    user_name: string;
    avatar_url?: string;
    content?: string;  // 弹幕内容
    gift_id?: string;  // 礼物ID
    gift_name?: string; // 礼物名称
    gift_icon?: string; // 礼物图标
    gift_count?: number; // 礼物数量
    gift_price?: number; // 礼物价值（抖币）
    timestamp: number;
    [key: string]: any;
  };
  sign: string; // 签名，用于验证请求合法性
}

// WebSocket 连接管理器（简化版，用于管理全局广播）
class BroadcastManager {
  private static instance: BroadcastManager;
  private clients: Set<WebSocket> = new Set();

  private constructor() {}

  static getInstance(): BroadcastManager {
    if (!BroadcastManager.instance) {
      BroadcastManager.instance = new BroadcastManager();
    }
    return BroadcastManager.instance;
  }

  addClient(ws: WebSocket) {
    this.clients.add(ws);
    ws.on('close', () => {
      this.clients.delete(ws);
    });
  }

  broadcast(message: any) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

// 导出广播管理器供其他模块使用
export { BroadcastManager };

// 验证签名
function verifySign(payload: string, sign: string): boolean {
  const authService = DouyinAuthService.getInstance();
  return authService.verifySign(payload, sign);
}

// 技能触发词配置
const SKILL_TRIGGERS = {
  heal: ['治疗', '回血', '奶一口', '加血', '恢复', '补血'],
  attack: ['攻击', '打', '砍', '揍', '伤害', '输出'],
  shield: ['护盾', '防御', '格挡', '保护', '盾'],
  ult: ['必杀技', '大招', '绝招', '终极技能', '终极'],
};

// 礼物效果配置
const GIFT_EFFECTS = {
  // 免费/低价礼物
  '爱心': { skill: 'heal', multiplier: 1 },
  '666': { skill: 'attack', multiplier: 1 },
  '点赞': { skill: 'heal', multiplier: 0.5 },

  // 中档礼物
  '玫瑰': { skill: 'heal', multiplier: 2 },
  '咖啡': { skill: 'heal', multiplier: 2 },
  '爱心泡泡': { skill: 'attack', multiplier: 2 },

  // 高档礼物
  '跑车': { skill: 'ult', multiplier: 5 },
  '火箭': { skill: 'ult', multiplier: 10 },
  '游艇': { skill: 'ult', multiplier: 8 },

  // 默认规则
  'default': { skill: 'attack', multiplier: 1 },
};

// 解析弹幕内容，识别技能触发词
function parseSkillTrigger(content: string): string | null {
  const lowerContent = content.toLowerCase();

  for (const [skillType, triggers] of Object.entries(SKILL_TRIGGERS)) {
    for (const trigger of triggers) {
      if (content.includes(trigger)) {
        return skillType;
      }
    }
  }

  return null;
}

// 根据礼物计算技能效果
function parseGiftEffect(giftName: string, giftCount: number = 1, giftPrice: number = 0): any {
  const giftConfig = GIFT_EFFECTS[giftName as keyof typeof GIFT_EFFECTS] || GIFT_EFFECTS.default;

  // 根据礼物价值和数量计算倍率
  const baseMultiplier = giftConfig.multiplier;
  const countMultiplier = Math.log10(giftCount + 1);
  const priceMultiplier = giftPrice > 0 ? Math.log10(giftPrice + 1) : 1;

  const totalMultiplier = baseMultiplier * countMultiplier * priceMultiplier;

  return {
    skill_type: giftConfig.skill,
    multiplier: totalMultiplier,
    gift_name: giftName,
    gift_count: giftCount,
    gift_price: giftPrice,
  };
}

// 处理弹幕事件
async function handleDanmakuEvent(eventData: DouyinDanmakuEvent['data']) {
  const broadcastManager = BroadcastManager.getInstance();

  // 解析技能触发词
  const skillType = eventData.content ? parseSkillTrigger(eventData.content) : null;

  // 广播弹幕消息给所有连接的客户端
  try {
    broadcastManager.broadcast({
      type: 'danmaku',
      data: {
        room_id: eventData.room_id,
        user_id: eventData.user_id,
        user_name: eventData.user_name,
        avatar_url: eventData.avatar_url,
        content: eventData.content,
        skill_type: skillType,
        timestamp: eventData.timestamp,
      },
    });

    console.log(`[弹幕] ${eventData.user_name}: ${eventData.content} ${skillType ? `→ ${skillType}` : ''}`);
  } catch (error) {
    console.error('Error broadcasting danmaku message:', error);
  }
}

// 处理礼物事件
async function handleGiftEvent(eventData: DouyinDanmakuEvent['data']) {
  const broadcastManager = BroadcastManager.getInstance();

  // 根据礼物计算技能效果
  const giftEffect = parseGiftEffect(
    eventData.gift_name || '未知礼物',
    eventData.gift_count || 1,
    eventData.gift_price || 0
  );

  // 广播礼物消息给所有连接的客户端
  try {
    broadcastManager.broadcast({
      type: 'gift',
      data: {
        room_id: eventData.room_id,
        user_id: eventData.user_id,
        user_name: eventData.user_name,
        avatar_url: eventData.avatar_url,
        gift_id: eventData.gift_id,
        gift_name: eventData.gift_name,
        gift_icon: eventData.gift_icon,
        gift_count: eventData.gift_count || 1,
        gift_price: eventData.gift_price || 0,
        gift_effect: giftEffect,
        timestamp: eventData.timestamp,
      },
    });

    console.log(`[礼物] ${eventData.user_name} 送出 ${eventData.gift_name} x${eventData.gift_count} → ${giftEffect.skill_type}`);
  } catch (error) {
    console.error('Error broadcasting gift message:', error);
  }
}

// 处理点赞事件
async function handleLikeEvent(eventData: DouyinDanmakuEvent['data']) {
  const broadcastManager = BroadcastManager.getInstance();

  try {
    broadcastManager.broadcast({
      type: 'like',
      data: {
        room_id: eventData.room_id,
        user_id: eventData.user_id,
        user_name: eventData.user_name,
        avatar_url: eventData.avatar_url,
        timestamp: eventData.timestamp,
      },
    });

    console.log(`[点赞] ${eventData.user_name} 点赞了直播间`);
  } catch (error) {
    console.error('Error broadcasting like message:', error);
  }
}

// 处理关注事件
async function handleFollowEvent(eventData: DouyinDanmakuEvent['data']) {
  const broadcastManager = BroadcastManager.getInstance();

  try {
    broadcastManager.broadcast({
      type: 'follow',
      data: {
        room_id: eventData.room_id,
        user_id: eventData.user_id,
        user_name: eventData.user_name,
        avatar_url: eventData.avatar_url,
        timestamp: eventData.timestamp,
      },
    });

    console.log(`[关注] ${eventData.user_name} 关注了主播`);
  } catch (error) {
    console.error('Error broadcasting follow message:', error);
  }
}

// POST 接口 - 接收抖音弹幕 Webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DouyinDanmakuEvent;

    // 验证签名（如果配置了抖音开放平台）
    const authService = DouyinAuthService.getInstance();
    if (authService.isConfigured()) {
      const payload = JSON.stringify(body);
      if (!verifySign(payload, body.sign)) {
        console.warn('签名验证失败');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // 根据事件类型处理
    switch (body.event_type) {
      case 'danmaku':
        await handleDanmakuEvent(body.data);
        break;

      case 'gift':
        await handleGiftEvent(body.data);
        break;

      case 'like':
        await handleLikeEvent(body.data);
        break;

      case 'follow':
        await handleFollowEvent(body.data);
        break;

      case 'enter_room':
        console.log(`[进场] ${body.data.user_name} 进入直播间`);
        break;

      case 'exit_room':
        console.log(`[离场] ${body.data.user_name} 离开直播间`);
        break;

      default:
        // 其他事件类型也转发给前端
        try {
          const broadcastManager = BroadcastManager.getInstance();
          broadcastManager.broadcast({
            type: body.event_type,
            data: body.data,
          });
        } catch (error) {
          console.error('Error broadcasting message:', error);
        }
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'Event processed successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    );
  }
}

// GET 接口 - 检查 webhook 状态
export async function GET(request: NextRequest) {
  const wsManager = WebSocketManager.getInstance();

  return NextResponse.json({
    status: 'ok',
    connected_clients: wsManager.getClientCount(),
    timestamp: new Date().toISOString(),
  });
}
