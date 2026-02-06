#!/bin/bash

# 抖音互动游戏 - 同步到 GitHub 脚本
# 在扣子编程环境中运行此脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 主流程
main() {
    print_header "将项目同步到 GitHub"

    # 1. 检查 Git 状态
    print_info "检查 Git 状态..."
    cd /workspace/projects

    if [ -n "$(git status --porcelain)" ]; then
        print_warning "有未提交的更改，正在提交..."
        git add .
        git commit -m "Update code $(date +'%Y-%m-%d %H:%M:%S')"
        print_success "已提交更改"
    else
        print_success "工作区是干净的"
    fi

    # 2. 检查远程仓库
    print_info "检查远程仓库..."
    if git remote get-url origin >/dev/null 2>&1; then
        REMOTE_URL=$(git remote get-url origin)
        print_success "已配置远程仓库: $REMOTE_URL"
    else
        print_warning "未配置远程仓库"
        echo ""
        print_info "请先完成以下步骤："
        echo "  1. 访问 https://github.com/new 创建仓库"
        echo "  2. 复制仓库地址"
        echo "  3. 运行以下命令添加远程仓库："
        echo ""
        echo -e "${YELLOW}git remote add origin https://github.com/你的用户名/仓库名.git${NC}"
        echo ""
        print_info "然后重新运行此脚本"
        exit 0
    fi

    # 3. 推送到 GitHub
    print_header "推送到 GitHub"
    print_info "正在推送代码..."

    if git push -u origin main; then
        print_success "代码推送成功！"
    else
        print_error "推送失败"
        echo ""
        print_info "可能的原因："
        echo "  1. 需要身份验证"
        echo "  2. 远程仓库不存在"
        echo "  3. 权限不足"
        echo ""
        print_info "解决方法："
        echo "  1. 使用 Personal Access Token: https://github.com/settings/tokens"
        echo "  2. 更新远程仓库地址："
        echo "     git remote set-url origin https://TOKEN@github.com/你的用户名/仓库名.git"
        exit 1
    fi

    # 4. 显示下一步操作
    print_header "同步完成！"
    echo ""
    print_success "项目已同步到 GitHub！"
    echo ""
    print_info "在你的 Mac 电脑上运行以下命令："
    echo ""
    echo -e "${GREEN}# 克隆项目${NC}"
    echo "git clone $REMOTE_URL"
    echo ""
    echo -e "${GREEN}# 进入项目目录${NC}"
    echo "cd $(basename $REMOTE_URL .git)"
    echo ""
    echo -e "${GREEN}# 安装依赖${NC}"
    echo "pnpm install"
    echo ""
    echo -e "${GREEN}# 启动开发服务器${NC}"
    echo "pnpm dev"
    echo ""
    echo -e "${GREEN}# 在 VSCode 中打开${NC}"
    echo "code ."
    echo ""
    print_header "详细信息"
    echo ""
    echo -e "${YELLOW}仓库地址:${NC} $REMOTE_URL"
    echo -e "${YELLOW}本地目录:${NC} $(pwd)"
    echo ""
}

# 运行主流程
main
