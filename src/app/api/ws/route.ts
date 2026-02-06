import { NextRequest } from 'next/server';
import { WebSocketManager } from '../douyin/webhook/route';

// WebSocket 升级处理
export async function GET(request: NextRequest) {
  // 注意：Next.js 的 App Router 不直接支持 WebSocket
  // 我们需要使用自定义服务器或者使用 Next.js 的 API Routes 配合 SSE (Server-Sent Events)
  // 这里提供一个 SSE 的实现作为替代方案

  return new Response(
    new ReadableStream({
      async start(controller) {
        const wsManager = WebSocketManager.getInstance();

        // 发送初始连接消息
        const encoder = new TextEncoder();
        controller.enqueue(
          encoder.encode(`event: connected\ndata: ${JSON.stringify({ message: 'WebSocket connected', timestamp: new Date().toISOString() })}\n\n`)
        );

        // 创建一个虚拟的 WebSocket 客户端来接收消息
        const mockWebSocket = {
          send: (data: string) => {
            // 通过 SSE 发送消息给客户端
            controller.enqueue(
              encoder.encode(`event: message\ndata: ${data}\n\n`)
            );
          },
          readyState: 1, // OPEN
          onclose: null as any,
        };

        // 添加到客户端列表
        (mockWebSocket as any).readyState = 1;
        wsManager.addClient(mockWebSocket as any);

        // 清理函数
        request.signal.addEventListener('abort', () => {
          controller.close();
        });

        // 保持连接活跃
        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': keep-alive\n\n'));
          } catch (error) {
            clearInterval(keepAlive);
          }
        }, 30000);

        request.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
        });
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    }
  );
}

// 为了真正的 WebSocket 支持，我们需要创建自定义服务器
// 在 Next.js 项目中，可以在根目录创建 server.js
// 下面是 WebSocket 服务器的完整实现说明
export const dynamic = 'force-dynamic';
