import { NextRequest } from 'next/server';

// SSE (Server-Sent Events) 路由 - 作为 WebSocket 的备用方案
// 真正的 WebSocket 连接由 server.js 中的自定义服务器处理
export async function GET(request: NextRequest) {
  // SSE 不需要连接到 WebSocket 管理器，直接返回说明
  return new Response(
    JSON.stringify({
      message: 'WebSocket connection is handled by custom server',
      websocket_url: 'ws://localhost:5000/api/ws',
      sse_info: 'For SSE support, use EventSource in the frontend',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

export const dynamic = 'force-dynamic';
