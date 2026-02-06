const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 5000;

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
      console.log('Received message:', data);

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
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);

    // WebSocket 升级处理
    if (parsedUrl.pathname === '/api/ws') {
      server.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
        wss.emit('connection', ws, req);
      });
      return;
    }

    // 其他请求由 Next.js 处理
    await handle(req, res, parsedUrl);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on ws://${hostname}:${port}/api/ws`);
  });
});
