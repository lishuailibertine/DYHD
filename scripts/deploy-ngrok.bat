@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 抖音互动游戏 - 快速部署脚本（使用 ngrok）
REM 适用于 Windows

echo.
echo ========================================
echo   抖音互动游戏 - 快速部署（Windows）
echo ========================================
echo.

REM 1. 检查 Node.js
echo [1/5] 检查 Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Node.js
    echo 请访问 https://nodejs.org 下载安装
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js 已安装: %NODE_VERSION%

REM 2. 检查 pnpm
echo.
echo [2/5] 检查 pnpm...
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  未找到 pnpm，正在安装...
    call npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ❌ pnpm 安装失败
        pause
        exit /b 1
    )
)
echo ✅ pnpm 已安装

REM 3. 检查 ngrok
echo.
echo [3/5] 检查 ngrok...
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 ngrok
    echo.
    echo 请按照以下步骤安装 ngrok:
    echo   1. 访问 https://ngrok.com 注册账号
    echo   2. 下载 Windows 版本
    echo   3. 解压并添加到 PATH
    echo   4. 运行: ngrok config add-authtoken YOUR_TOKEN
    echo.
    pause
    exit /b 1
)
echo ✅ ngrok 已安装

REM 4. 检查服务状态
echo.
echo [4/5] 检查游戏服务状态...
curl -s -o nul -w "%%{http_code}" http://localhost:5000 2>nul | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ 游戏服务正在运行
) else (
    echo ⚠️  游戏服务未运行，正在启动...
    start "" cmd /k "pnpm dev"
    echo 等待服务启动（最多 30 秒）...
    
    set COUNT=0
    :wait_loop
    set /a COUNT+=1
    if !COUNT! gtr 30 (
        echo ❌ 游戏服务启动超时
        pause
        exit /b 1
    )
    curl -s -o nul -w "%%{http_code}" http://localhost:5000 2>nul | findstr "200" >nul
    if %errorlevel% neq 0 (
        echo | set /p="."
        timeout /t 1 >nul
        goto wait_loop
    )
    echo.
    echo ✅ 游戏服务启动成功！
)

REM 5. 启动 ngrok
echo.
echo ========================================
echo   启动 ngrok
echo ========================================
echo.
echo 正在启动 ngrok，将会获得一个公网地址...
echo.

start "" cmd /k "ngrok http 5000"

REM 6. 显示访问信息
timeout /t 3 >nul

echo.
echo ========================================
echo   部署成功！
echo ========================================
echo.
echo ✅ 服务已部署，可以通过以下方式访问：
echo.
echo 本地访问:
echo   游戏主页: http://localhost:5000
echo   推流页面: http://localhost:5000/stream
echo   测试页面: http://localhost:5000/test.html
echo.
echo 公网访问（查看 ngrok 窗口）:
echo   打开 ngrok 窗口，复制 Forwarding 中的 https 地址
echo.
echo 配置抖音 Webhook:
echo   Webhook URL: https://your-ngrok-domain.ngrok-free.app/api/douyin/webhook
echo.
echo 测试方法:
echo   1. 复制 ngrok 的 https 地址
echo   2. 访问 https://your-ngrok-domain.ngrok-free.app/stream
echo   3. 使用 test.html 发送测试消息
echo   4. 或配置抖音 Webhook 接收真实推送
echo.
echo ========================================
echo   停止服务
echo ========================================
echo.
echo 关闭 ngrok 窗口即可停止服务
echo 游戏服务继续运行在后台
echo.
pause
