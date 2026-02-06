const { createServer } = require('http');
const next = require('next');
const { Server: WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 5001;

// 创建 Next.js 应用
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// WebSocket 连接管理器
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'connected',
    data: { message: 'WebSocket connected successfully', timestamp: new Date().toISOString() }
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message from client:', data);

      // 广播消息给所有客户端
      clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify({
            type: 'broadcast',
            data: data,
          }));
        }
      });
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected, total clients:', clients.size);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });

  console.log('New client connected, total clients:', clients.size);
});

// 广播函数，供其他模块使用
global.broadcast = (message) => {
  const data = JSON.stringify({
    type: 'event',
    data: message,
  });

  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(data);
    }
  });
};

// 获取客户端数量
global.getClientCount = () => {
  return clients.size;
};

app.prepare().then(() => {
  // 创建标准的 HTTP server
  const server = createServer((req, res) => {
    // 处理 HTTP 请求，由 Next.js 处理
    handle(req, res);
  });

  // 处理 WebSocket 升级请求
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === '/api/ws') {
      // 游戏 WebSocket
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else if (url.pathname.startsWith('/_next/webpack-hmr')) {
      // Next.js HMR WebSocket - 让 Next.js 处理
      handle(request, socket, head);
    } else {
      socket.destroy();
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on ws://${hostname}:${port}/api/ws`);
  });
});
