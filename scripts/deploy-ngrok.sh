#!/bin/bash

# 抖音互动游戏 - 快速部署脚本（使用 ngrok）
# 适用于 macOS/Linux

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查服务是否运行
check_service() {
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200"; then
        return 0
    else
        return 1
    fi
}

# 主流程
main() {
    print_header "抖音互动游戏 - 快速部署"
    
    # 1. 检查 Node.js
    print_info "检查 Node.js..."
    if ! command_exists node; then
        print_error "未找到 Node.js，请先安装："
        echo "  macOS: brew install node"
        echo "  Ubuntu: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
        exit 1
    fi
    NODE_VERSION=$(node -v)
    print_success "Node.js 已安装: $NODE_VERSION"
    
    # 2. 检查 pnpm
    print_info "检查 pnpm..."
    if ! command_exists pnpm; then
        print_warning "未找到 pnpm，正在安装..."
        npm install -g pnpm
    fi
    print_success "pnpm 已安装"
    
    # 3. 检查 ngrok
    print_info "检查 ngrok..."
    if ! command_exists ngrok; then
        print_warning "未找到 ngrok，请先安装："
        echo "  macOS: brew install ngrok"
        echo "  Windows: winget install ngrok.ngrok"
        echo "  Linux: curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null"
        echo ""
        print_info "访问 https://ngrok.com 注册账号"
        print_info "安装后运行: ngrok config add-authtoken YOUR_TOKEN"
        exit 1
    fi
    print_success "ngrok 已安装"
    
    # 4. 检查服务状态
    print_info "检查游戏服务状态..."
    if check_service; then
        print_success "游戏服务正在运行"
    else
        print_warning "游戏服务未运行，正在启动..."
        pnpm dev &
        DEV_PID=$!
        
        # 等待服务启动
        print_info "等待服务启动（最多 30 秒）..."
        for i in {1..30}; do
            if check_service; then
                print_success "游戏服务启动成功！"
                break
            fi
            echo -n "."
            sleep 1
        done
        echo ""
        
        if ! check_service; then
            print_error "游戏服务启动失败"
            kill $DEV_PID 2>/dev/null || true
            exit 1
        fi
    fi
    
    # 5. 启动 ngrok
    print_header "启动 ngrok"
    print_info "正在启动 ngrok，将会获得一个公网地址..."
    echo ""
    
    ngrok http 5000 &
    NGROK_PID=$!
    
    # 等待 ngrok 启动
    sleep 3
    
    # 6. 显示访问信息
    print_header "部署成功！"
    echo ""
    print_success "服务已部署，可以通过以下方式访问："
    echo ""
    echo -e "${YELLOW}本地访问:${NC}"
    echo "  游戏主页: ${GREEN}http://localhost:5000${NC}"
    echo "  推流页面: ${GREEN}http://localhost:5000/stream${NC}"
    echo "  测试页面: ${GREEN}http://localhost:5000/test.html${NC}"
    echo ""
    echo -e "${YELLOW}公网访问（查看 ngrok 界面）:${NC}"
    print_info "打开 ngrok 终端，复制 Forwarding 中的 https 地址"
    echo ""
    echo -e "${YELLOW}配置抖音 Webhook:${NC}"
    print_info "Webhook URL: https://your-ngrok-domain.ngrok-free.app/api/douyin/webhook"
    echo ""
    echo -e "${YELLOW}测试方法:${NC}"
    echo "  1. 复制 ngrok 的 https 地址"
    echo "  2. 访问 https://your-ngrok-domain.ngrok-free.app/stream"
    echo "  3. 使用 test.html 发送测试消息"
    echo "  4. 或配置抖音 Webhook 接收真实推送"
    echo ""
    
    # 7. 提示如何停止
    print_header "停止服务"
    print_info "按 Ctrl+C 停止 ngrok"
    print_info "游戏服务继续运行在后台"
    echo ""
    
    # 保持脚本运行
    wait $NGROK_PID
}

# 运行主流程
main
