@echo off
chcp 65001 >nul
echo 🎮 抖音互动游戏本地测试工具
echo ================================================
echo.

echo 📡 检查游戏服务器...
curl -s -o nul -w "%%{http_code}" http://localhost:5000 | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ 游戏服务器运行正常
) else (
    echo ❌ 游戏服务器未运行，请先执行: pnpm dev
    pause
    exit /b 1
)

echo.
echo 🧪 测试选项：
echo 1. 发送弹幕（治疗）
echo 2. 发送弹幕（攻击）
echo 3. 发送弹幕（护盾）
echo 4. 发送弹幕（必杀技）
echo 5. 发送礼物（跑车）
echo 6. 发送礼物（火箭）
echo 7. 模拟点赞
echo 8. 模拟关注
echo 9. 批量测试弹幕
echo 0. 退出
echo.

set /p choice="请选择 (0-9): "

if "%choice%"=="1" goto heal
if "%choice%"=="2" goto attack
if "%choice%"=="3" goto shield
if "%choice%"=="4" goto ult
if "%choice%"=="5" goto gift_car
if "%choice%"=="6" goto gift_rocket
if "%choice%"=="7" goto like
if "%choice%"=="8" goto follow
if "%choice%"=="9" goto batch
if "%choice%"=="0" goto exit
goto invalid

:heal
echo 📤 发送弹幕：治疗
curl -X POST -H "Content-Type: application/json" -d "{\"event_type\":\"danmaku\",\"data\":{\"room_id\":\"test_room\",\"user_id\":\"user001\",\"user_name\":\"测试用户1\",\"content\":\"治疗\",\"timestamp\":%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%},\"sign\":\"test\"}" http://localhost:5000/api/douyin/webhook
goto end

:attack
echo 📤 发送弹幕：攻击
curl -X POST -H "Content-Type: application/json" -d "{\"event_type\":\"danmaku\",\"data\":{\"room_id\":\"test_room\",\"user_id\":\"user002\",\"user_name\":\"测试用户2\",\"content\":\"攻击\",\"timestamp\":%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%},\"sign\":\"test\"}" http://localhost:5000/api/douyin/webhook
goto end

:shield
echo 📤 发送弹幕：护盾
curl -X POST -H "Content-Type: application/json" -d "{\"event_type\":\"danmaku\",\"data\":{\"room_id\":\"test_room\",\"user_id\":\"user003\",\"user_name\":\"测试用户3\",\"content\":\"护盾\",\"timestamp\":%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%},\"sign\":\"test\"}" http://localhost:5000/api/douyin/webhook
goto end

:ult
echo 📤 发送弹幕：必杀技
curl -X POST -H "Content-Type: application/json" -d "{\"event_type\":\"danmaku\",\"data\":{\"room_id\":\"test_room\",\"user_id\":\"user004\",\"user_name\":\"测试用户4\",\"content\":\"必杀技\",\"timestamp\":%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%},\"sign\":\"test\"}" http://localhost:5000/api/douyin/webhook
goto end

:gift_car
echo 🎁 发送礼物：跑车
curl -X POST -H "Content-Type: application/json" -d "{\"event_type\":\"gift\",\"data\":{\"room_id\":\"test_room\",\"user_id\":\"user005\",\"user_name\":\"土豪用户\",\"gift_id\":\"gift_car\",\"gift_name\":\"跑车\",\"gift_count\":1,\"gift_price\":1000,\"timestamp\":%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%},\"sign\":\"test\"}" http://localhost:5000/api/douyin/webhook
goto end

:gift_rocket
echo 🚀 发送礼物：火箭
curl -X POST -H "Content-Type: application/json" -d "{\"event_type\":\"gift\",\"data\":{\"room_id\":\"test_room\",\"user_id\":\"user006\",\"user_name\":\"超级土豪\",\"gift_id\":\"gift_rocket\",\"gift_name\":\"火箭\",\"gift_count\":1,\"gift_price\":10000,\"timestamp\":%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%},\"sign\":\"test\"}" http://localhost:5000/api/douyin/webhook
goto end

:like
echo 👍 模拟点赞
curl -X POST -H "Content-Type: application/json" -d "{\"event_type\":\"like\",\"data\":{\"room_id\":\"test_room\",\"user_id\":\"user007\",\"user_name\":\"点赞用户\",\"timestamp\":%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%},\"sign\":\"test\"}" http://localhost:5000/api/douyin/webhook
goto end

:follow
echo ❤️ 模拟关注
curl -X POST -H "Content-Type: application/json" -d "{\"event_type\":\"follow\",\"data\":{\"room_id\":\"test_room\",\"user_id\":\"user008\",\"user_name\":\"关注用户\",\"timestamp\":%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%},\"sign\":\"test\"}" http://localhost:5000/api/douyin/webhook
goto end

:batch
echo 🔄 批量测试弹幕
echo 发送 10 条随机弹幕...
for /L %%i in (1,1,10) do (
    set /a rand=%%i%%10+1
    if !rand!==1 set msg=治疗
    if !rand!==2 set msg=攻击
    if !rand!==3 set msg=护盾
    if !rand!==4 set msg=必杀技
    if !rand!==5 set msg=打
    if !rand!==6 set msg=砍
    if !rand!==7 set msg=回血
    if !rand!==8 set msg=防御
    if !rand!==9 set msg=大招
    if !rand!==10 set msg=绝招

    curl -s -X POST -H "Content-Type: application/json" -d "{\"event_type\":\"danmaku\",\"data\":{\"room_id\":\"test_room\",\"user_id\":\"user_%%i\",\"user_name\":\"观众%%i\",\"content\":\"!msg!\",\"timestamp\":%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%},\"sign\":\"test\"}" http://localhost:5000/api/douyin/webhook >nul
    echo [%%i/10] 观众%%i: !msg!
    timeout /t 1 /nobreak >nul
)
echo ✅ 批量测试完成
goto end

:invalid
echo ❌ 无效选择
goto end

:exit
echo 👋 退出
goto :eof

:end
echo.
echo ✅ 请求已发送
echo.
echo 💡 提示：
echo   - 打开推流页面查看效果: http://localhost:5000/stream
echo   - 打开测试页面手动测试: http://localhost:5000/test.html
echo   - 查看服务器日志: type logs\dev.log
echo.
pause
