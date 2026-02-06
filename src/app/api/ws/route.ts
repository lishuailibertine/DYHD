import { NextRequest } from 'next/server';

// WebSocket 连接由 server.js 中的自定义服务器处理
// 这个 route 保留但不处理 WebSocket 请求
// 真正的 WebSocket 升级请求会被 server.js 拦截

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      message: 'WebSocket connection is handled by custom server (server.js)',
      websocket_url: 'ws://localhost:5001/api/ws',
      note: 'This is a Next.js API route. WebSocket connections are handled by the custom server.',
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
