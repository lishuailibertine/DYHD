# 故障排除指南

本指南帮助你解决抖音互动游戏项目启动和使用过程中的常见问题。

## 🔍 快速诊断

### 使用诊断脚本

**Mac/Linux:**
```bash
./scripts/diagnose.sh
```

**Windows:**
```cmd
scripts\diagnose.bat
```

诊断脚本会检查：
- ✅ Node.js 版本
- ✅ pnpm 安装状态
- ✅ 依赖安装情况
- ✅ 端口占用状态
- ✅ lockfile 配置

---

## ❓ 常见问题

### 1. Node.js 版本过低

**错误信息:**
```
For Next.js, Node.js version ">=20.9.0" is required.
```

**解决方案:**

#### Mac/Linux

**方法1：使用 nvm（推荐）**
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新打开终端，然后安装 Node.js
nvm install node
nvm use node
nvm alias default node

# 验证版本
node -v
```

**方法2：使用 Homebrew**
```bash
brew update
brew install node
node -v
```

#### Windows

1. 访问 https://nodejs.org/
2. 下载 LTS 版本（20.x 或更高）
3. 安装并重启终端
4. 验证：`node -v`

---

### 2. pnpm 未安装

**错误信息:**
```
command not found: pnpm
```

**解决方案:**
```bash
npm install -g pnpm
```

验证：
```bash
pnpm -v
```

---

### 3. 依赖未安装

**错误信息:**
```
Cannot find module 'xxx'
```

**解决方案:**
```bash
# 删除 node_modules 和 lockfile
rm -rf node_modules
rm pnpm-lock.yaml

# 重新安装依赖
pnpm install
```

**Windows:**
```cmd
rmdir /s /q node_modules
del pnpm-lock.yaml
pnpm install
```

---

### 4. 端口被占用

**错误信息:**
```
EADDRINUSE: address already in use :::5001
```

**解决方案:**

#### Mac/Linux
```bash
# 查找占用端口的进程
lsof -ti:5001

# 杀掉进程
lsof -ti:5001 | xargs kill -9

# 或者使用 netstat
netstat -tunlp | grep 5001
kill -9 <PID>
```

#### Windows
```cmd
# 查找占用端口的进程
netstat -ano | findstr :5001

# 使用任务管理器结束进程，或使用命令
taskkill /PID <进程ID> /F
```

---

### 5. Multiple lockfiles 警告

**错误信息:**
```
Detected multiple lockfiles:
* /workspace/projects/pnpm-lock.yaml
* /workspace/pnpm-lock.yaml
```

**解决方案:**

如果使用 pnpm，删除其他 lockfile：
```bash
rm package-lock.json
rm yarn.lock
```

如果使用 npm，删除其他 lockfile：
```bash
rm pnpm-lock.yaml
rm yarn.lock
```

如果使用 yarn，删除其他 lockfile：
```bash
rm pnpm-lock.yaml
rm package-lock.json
```

然后重新安装依赖：
```bash
pnpm install
```

---

### 6. WebSocket 连接失败

**错误信息:**
```
WebSocket connection to 'ws://localhost:5001/api/ws' failed
```

**原因分析:**

这是正常的，取决于你使用的启动模式：

| 模式 | 命令 | WebSocket 支持 |
|------|------|----------------|
| 开发模式 | `pnpm dev` | ❌ 不支持（只支持 HMR） |
| 开发+WebSocket | `pnpm dev:ws` | ✅ 支持 |
| 生产模式 | `pnpm build && pnpm start` | ✅ 支持 |

**解决方案:**

- **如果只是开发前端**：使用 `pnpm dev`，WebSocket 错误可以忽略
- **如果需要测试 WebSocket**：使用 `pnpm dev:ws`
- **如果要部署**：使用 `pnpm build && pnpm start`

---

### 7. HMR WebSocket 连接失败

**错误信息:**
```
WebSocket connection to 'ws://localhost:5001/_next/webpack-hmr' failed
```

**原因分析:**

这是 HMR（热模块替换）的 WebSocket 连接失败，通常发生在使用 `pnpm dev:ws` 模式时。

**解决方案:**

- 这个错误不影响功能
- 如果需要 HMR（自动刷新），使用 `pnpm dev`
- 如果需要 WebSocket，使用 `pnpm dev:ws`，手动刷新浏览器

---

### 8. 页面显示 "Application error: a client-side exception has occurred"

**可能的原因:**

1. **代码错误**：检查浏览器控制台（F12）查看具体错误
2. **WebSocket 初始化错误**：使用 `pnpm dev:ws` 或添加错误处理
3. **依赖版本冲突**：重新安装依赖

**解决方案:**

```bash
# 1. 清理缓存
rm -rf .next
rm -rf node_modules
rm pnpm-lock.yaml

# 2. 重新安装
pnpm install

# 3. 重启服务
pnpm dev
```

---

### 9. 测试工具无法发送消息

**可能的原因:**

1. **Webhook API 未运行**：检查服务是否正常启动
2. **端口错误**：确保使用 5001 端口
3. **CORS 问题**：使用 `http://localhost:5001/test.html`

**解决方案:**

```bash
# 检查服务状态
curl -I http://localhost:5001

# 应该返回:
# HTTP/1.1 200 OK
```

---

### 10. 部署到服务器后无法访问

**可能的原因:**

1. **防火墙**：开放 5001 端口
2. **Nginx 配置**：检查反向代理配置
3. **PM2 未启动**：检查进程状态

**解决方案:**

```bash
# 检查 PM2 状态
pm2 status

# 如果未运行，启动
pm2 start npm --name "douyin-game" -- start

# 开放防火墙端口（Ubuntu）
sudo ufw allow 5001

# 检查 Nginx 配置
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔧 高级故障排除

### 查看 Next.js 编译错误

```bash
# 停止服务（Ctrl+C）
# 清理缓存
rm -rf .next

# 重新启动，查看详细日志
pnpm dev
```

### 查看浏览器控制台错误

1. 打开浏览器
2. 按 `F12` 打开开发者工具
3. 查看 `Console` 标签页
4. 查看红色错误信息

### 查看网络请求

1. 按 `F12` 打开开发者工具
2. 点击 `Network` 标签页
3. 刷新页面
4. 查看失败的请求（红色）

---

## 📞 获取帮助

如果以上方法都无法解决问题，请：

1. **运行诊断脚本**：`./scripts/diagnose.sh`
2. **收集错误信息**：浏览器控制台截图、终端错误日志
3. **检查日志**：
   - Mac/Linux: `/app/work/logs/bypass/app.log`
   - 查看最近的错误信息

---

## 📚 相关文档

- [启动模式说明](startup-modes.md)
- [部署指南](deployment-guide.md)
- [本地开发测试](local-development-guide.md)
- [同步到本地](sync-to-local.md)
