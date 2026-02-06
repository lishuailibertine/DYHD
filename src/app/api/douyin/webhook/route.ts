import { NextRequest, NextResponse } from 'next/server';

// 抖音弹幕事件类型
interface DouyinDanmakuEvent {
  event_type: 'danmaku' | 'gift' | 'like' | 'share' | 'follow';
  data: {
    user_id: string;
    user_name: string;
    avatar_url?: string;
    content?: string;  // 弹幕内容
    gift_id?: string;  // 礼物ID
    gift_name?: string; // 礼物名称
    gift_count?: number; // 礼物数量
    timestamp: number;
    [key: string]: any;
  };
  sign: string; // 签名，用于验证请求合法性
}

// WebSocket 连接管理器
class WebSocketManager {
  private static instance: WebSocketManager;
  private clients: Set<WebSocket> = new Set();

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
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

// 导出 WebSocket 管理器供其他模块使用
export { WebSocketManager };

// 验证签名（简化版本，实际需要根据抖音开放平台的签名算法实现）
function verifySign(payload: string, sign: string): boolean {
  // TODO: 实现实际的签名验证逻辑
  // 这里只是一个示例，实际需要根据抖音开放平台的要求验证签名
  // 1. 获取抖音开放平台的 App Secret
  // 2. 使用 HMAC-SHA256 对 payload 进行签名
  // 3. 对比签名是否匹配
  return true;
}

// 解析弹幕内容，识别技能触发词
function parseSkillTrigger(content: string): string | null {
  const skillTriggers = {
    '治疗': 'heal',
    '回血': 'heal',
    '奶一口': 'heal',
    '攻击': 'attack',
    '打': 'attack',
    '砍': 'attack',
    '护盾': 'shield',
    '防御': 'shield',
    '格挡': 'shield',
    '必杀技': 'ult',
    '大招': 'ult',
    '绝招': 'ult',
  };

  for (const [trigger, skillType] of Object.entries(skillTriggers)) {
    if (content.includes(trigger)) {
      return skillType;
    }
  }

  return null;
}

// 处理弹幕事件
async function handleDanmakuEvent(eventData: DouyinDanmakuEvent['data']) {
  const wsManager = WebSocketManager.getInstance();

  // 解析技能触发词
  const skillType = eventData.content ? parseSkillTrigger(eventData.content) : null;

  // 广播弹幕消息给所有连接的客户端
  try {
    wsManager.broadcast({
      type: 'danmaku',
      data: {
        user_id: eventData.user_id,
        user_name: eventData.user_name,
        content: eventData.content,
        avatar_url: eventData.avatar_url,
        skill_type: skillType,
        timestamp: eventData.timestamp,
      },
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    // 不抛出错误，继续处理请求
  }
}

// 处理礼物事件
async function handleGiftEvent(eventData: DouyinDanmakuEvent['data']) {
  const wsManager = WebSocketManager.getInstance();

  // 礼物触发特殊技能
  const skillType = 'ult'; // 礼物默认触发必杀技

  try {
    wsManager.broadcast({
      type: 'gift',
      data: {
        user_id: eventData.user_id,
        user_name: eventData.user_name,
        gift_name: eventData.gift_name,
        gift_count: eventData.gift_count || 1,
        skill_type: skillType,
        timestamp: eventData.timestamp,
      },
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    // 不抛出错误，继续处理请求
  }
}

// POST 接口 - 接收抖音弹幕 Webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DouyinDanmakuEvent;

    // 验证签名
    const payload = JSON.stringify(body);
    if (!verifySign(payload, body.sign)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 根据事件类型处理
    switch (body.event_type) {
      case 'danmaku':
        await handleDanmakuEvent(body.data);
        break;

      case 'gift':
        await handleGiftEvent(body.data);
        break;

      default:
        // 其他事件类型也转发给前端
        try {
          const wsManager = WebSocketManager.getInstance();
          wsManager.broadcast({
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
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
