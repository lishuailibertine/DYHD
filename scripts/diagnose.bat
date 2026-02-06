@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 抖音互动游戏 - 环境诊断脚本
REM 用于检查本地环境配置是否正确

set ERRORS=0
set WARNINGS=0

echo.
echo ========================================
echo   环境诊断
echo ========================================
echo.

REM 1. 检查 Node.js 版本
echo [1/7] 检查 Node.js 版本...
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo ✅ Node.js 版本: %NODE_VERSION%
) else (
    echo ❌ 未找到 Node.js
    echo    请访问 https://nodejs.org/ 下载并安装 Node.js
    set /a ERRORS+=1
)
echo.

REM 2. 检查 pnpm
echo [2/7] 检查 pnpm...
where pnpm >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('pnpm -v') do set PNPM_VERSION=%%i
    echo ✅ pnpm 版本: %PNPM_VERSION%
) else (
    echo ❌ 未找到 pnpm
    echo    请运行: npm install -g pnpm
    set /a ERRORS+=1
)
echo.

REM 3. 检查项目目录
echo [3/7] 检查项目目录...
if exist package.json (
    echo ✅ 找到 package.json
) else (
    echo ❌ 未找到 package.json，请在项目根目录运行此脚本
    set /a ERRORS+=1
)
echo.

REM 4. 检查 node_modules
echo [4/7] 检查依赖安装状态...
if exist node_modules (
    echo ✅ 依赖已安装
) else (
    echo ⚠️  未找到 node_modules，请运行: pnpm install
    set /a WARNINGS+=1
)
echo.

REM 5. 检查端口占用
echo [5/7] 检查端口 5001 占用情况...
netstat -ano | findstr ":5001" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  端口 5001 被占用
    echo    如需释放端口，使用任务管理器结束进程
    set /a WARNINGS+=1
) else (
    echo ✅ 端口 5001 空闲
)
echo.

REM 6. 检查 lockfile
echo [6/7] 检查 lockfile...
if exist pnpm-lock.yaml (
    echo ✅ 找到 pnpm-lock.yaml
) else if exist package-lock.json (
    echo ⚠️  找到 package-lock.json，建议使用 pnpm
    echo    运行: del package-lock.json ^&^& pnpm install
    set /a WARNINGS+=1
) else if exist yarn.lock (
    echo ⚠️  找到 yarn.lock，建议使用 pnpm
    set /a WARNINGS+=1
) else (
    echo ⚠️  未找到 lockfile，请运行: pnpm install
    set /a WARNINGS+=1
)
echo.

REM 7. 尝试启动测试
echo [7/7] 启动说明...
echo ⚠️  如果启动失败，请查看错误信息
echo.

REM 总结
echo.
echo ========================================
echo   诊断总结
echo ========================================
echo.

if %ERRORS% equ 0 if %WARNINGS% equ 0 (
    echo ✅ 所有检查通过！✨
    echo.
    echo 现在可以启动项目：
    echo   pnpm dev
    echo.
    echo 或者查看启动模式：
    echo   pnpm dev        # 开发模式（推荐）
    echo   pnpm dev:ws     # 开发+WebSocket 模式
) else (
    if %ERRORS% gtr 0 (
        echo ❌ 发现 %ERRORS% 个错误，请修复后再启动
    )
    if %WARNINGS% gtr 0 (
        echo ⚠️  发现 %WARNINGS% 个警告，建议修复
    )
    echo.
    echo 常见问题解决方法：
    echo.
    echo 1. Node.js 版本过低：
    echo    访问 https://nodejs.org/ 下载最新版（需要 20.9.0 或更高）
    echo.
    echo 2. 未安装 pnpm：
    echo    npm install -g pnpm
    echo.
    echo 3. 依赖未安装：
    echo    pnpm install
    echo.
    echo 4. 端口占用：
    echo    使用任务管理器结束占用 5001 端口的进程
    echo.
    echo 5. lockfile 冲突：
    echo    del package-lock.json
    echo    pnpm install
)

echo.

if %ERRORS% gtr 0 (
    exit /b 1
)
