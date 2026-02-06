#!/bin/bash

# 抖音互动游戏 - 环境诊断脚本
# 用于检查本地环境配置是否正确

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

ERRORS=0
WARNINGS=0

# 主流程
main() {
    print_header "环境诊断"

    # 1. 检查 Node.js 版本
    print_info "检查 Node.js 版本..."
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node -v | sed 's/v//')
        REQUIRED_VERSION="20.9.0"

        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js 版本: $NODE_VERSION (满足要求)"
        else
            print_error "Node.js 版本过低: $NODE_VERSION (需要 >= $REQUIRED_VERSION)"
            print_info "请访问 https://nodejs.org/ 下载并安装最新版 Node.js"
            ERRORS=$((ERRORS + 1))
        fi
    else
        print_error "未找到 Node.js"
        print_info "请访问 https://nodejs.org/ 下载并安装 Node.js"
        ERRORS=$((ERRORS + 1))
    fi

    # 2. 检查 pnpm
    print_info "检查 pnpm..."
    if command -v pnpm >/dev/null 2>&1; then
        PNPM_VERSION=$(pnpm -v)
        print_success "pnpm 版本: $PNPM_VERSION"
    else
        print_error "未找到 pnpm"
        print_info "请运行: npm install -g pnpm"
        ERRORS=$((ERRORS + 1))
    fi

    # 3. 检查项目目录
    print_info "检查项目目录..."
    if [ -f "package.json" ]; then
        print_success "找到 package.json"
    else
        print_error "未找到 package.json，请在项目根目录运行此脚本"
        ERRORS=$((ERRORS + 1))
    fi

    # 4. 检查 node_modules
    print_info "检查依赖安装状态..."
    if [ -d "node_modules" ]; then
        NODE_MODULES_COUNT=$(ls -1 node_modules 2>/dev/null | wc -l)
        if [ "$NODE_MODULES_COUNT" -gt 10 ]; then
            print_success "依赖已安装 ($NODE_MODULES_COUNT 个包)"
        else
            print_warning "依赖可能不完整，建议运行: pnpm install"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        print_warning "未找到 node_modules，请运行: pnpm install"
        WARNINGS=$((WARNINGS + 1))
    fi

    # 5. 检查端口占用
    print_info "检查端口 5001 占用情况..."
    if command -v lsof >/dev/null 2>&1; then
        if lsof -ti:5001 >/dev/null 2>&1; then
            PID=$(lsof -ti:5001)
            print_warning "端口 5001 被占用 (PID: $PID)"
            print_info "如需释放端口，运行: kill -9 $PID"
            WARNINGS=$((WARNINGS + 1))
        else
            print_success "端口 5001 空闲"
        fi
    else
        print_warning "无法检查端口占用（lsof 不可用）"
    fi

    # 6. 检查 lockfile
    print_info "检查 lockfile..."
    if [ -f "pnpm-lock.yaml" ]; then
        print_success "找到 pnpm-lock.yaml"
    elif [ -f "package-lock.json" ]; then
        print_warning "找到 package-lock.json，建议使用 pnpm"
        print_info "运行: rm package-lock.json && pnpm install"
        WARNINGS=$((WARNINGS + 1))
    elif [ -f "yarn.lock" ]; then
        print_warning "找到 yarn.lock，建议使用 pnpm"
        WARNINGS=$((WARNINGS + 1))
    else
        print_warning "未找到 lockfile，请运行: pnpm install"
        WARNINGS=$((WARNINGS + 1))
    fi

    # 7. 尝试启动测试
    print_info "尝试启动开发服务器..."
    print_warning "如果启动失败，请查看错误信息"

    # 总结
    print_header "诊断总结"

    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        print_success "所有检查通过！✨"
        echo ""
        print_info "现在可以启动项目："
        echo "  pnpm dev"
        echo ""
        print_info "或者查看启动模式："
        echo "  pnpm dev        # 开发模式（推荐）"
        echo "  pnpm dev:ws     # 开发+WebSocket 模式"
    else
        if [ $ERRORS -gt 0 ]; then
            print_error "发现 $ERRORS 个错误，请修复后再启动"
        fi
        if [ $WARNINGS -gt 0 ]; then
            print_warning "发现 $WARNINGS 个警告，建议修复"
        fi
        echo ""
        print_info "常见问题解决方法："
        echo ""
        echo "1. Node.js 版本过低："
        echo "   访问 https://nodejs.org/ 下载最新版"
        echo ""
        echo "2. 未安装 pnpm："
        echo "   npm install -g pnpm"
        echo ""
        echo "3. 依赖未安装："
        echo "   pnpm install"
        echo ""
        echo "4. 端口占用："
        echo "   lsof -ti:5001 | xargs kill -9"
        echo ""
        echo "5. lockfile 冲突："
        echo "   rm package-lock.json && pnpm install"
    fi

    echo ""
    if [ $ERRORS -gt 0 ]; then
        exit 1
    fi
}

# 运行主流程
main
