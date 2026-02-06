#!/bin/bash

# 抖音互动游戏本地测试脚本

echo "🎮 抖音互动游戏本地测试工具"
echo "================================"
echo ""

# 检查服务器是否运行
echo "📡 检查游戏服务器..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200"; then
    echo "✅ 游戏服务器运行正常"
else
    echo "❌ 游戏服务器未运行，请先执行: pnpm dev"
    exit 1
fi

echo ""
echo "🧪 测试选项："
echo "1. 发送弹幕（治疗）"
echo "2. 发送弹幕（攻击）"
echo "3. 发送弹幕（护盾）"
echo "4. 发送弹幕（必杀技）"
echo "5. 发送礼物（跑车）"
echo "6. 发送礼物（火箭）"
echo "7. 模拟点赞"
echo "8. 模拟关注"
echo "9. 批量测试弹幕"
echo "0. 退出"
echo ""

read -p "请选择 (0-9): " choice

case $choice in
    1)
        echo "📤 发送弹幕：治疗"
        curl -X POST -H "Content-Type: application/json" \
          -d '{
            "event_type": "danmaku",
            "data": {
              "room_id": "test_room",
              "user_id": "user001",
              "user_name": "测试用户1",
              "content": "治疗",
              "timestamp": '$(date +%s)'
            },
            "sign": "test"
          }' \
          http://localhost:5000/api/douyin/webhook
        ;;
    2)
        echo "📤 发送弹幕：攻击"
        curl -X POST -H "Content-Type: application/json" \
          -d '{
            "event_type": "danmaku",
            "data": {
              "room_id": "test_room",
              "user_id": "user002",
              "user_name": "测试用户2",
              "content": "攻击",
              "timestamp": '$(date +%s)'
            },
            "sign": "test"
          }' \
          http://localhost:5000/api/douyin/webhook
        ;;
    3)
        echo "📤 发送弹幕：护盾"
        curl -X POST -H "Content-Type: application/json" \
          -d '{
            "event_type": "danmaku",
            "data": {
              "room_id": "test_room",
              "user_id": "user003",
              "user_name": "测试用户3",
              "content": "护盾",
              "timestamp": '$(date +%s)'
            },
            "sign": "test"
          }' \
          http://localhost:5000/api/douyin/webhook
        ;;
    4)
        echo "📤 发送弹幕：必杀技"
        curl -X POST -H "Content-Type: application/json" \
          -d '{
            "event_type": "danmaku",
            "data": {
              "room_id": "test_room",
              "user_id": "user004",
              "user_name": "测试用户4",
              "content": "必杀技",
              "timestamp": '$(date +%s)'
            },
            "sign": "test"
          }' \
          http://localhost:5000/api/douyin/webhook
        ;;
    5)
        echo "🎁 发送礼物：跑车"
        curl -X POST -H "Content-Type: application/json" \
          -d '{
            "event_type": "gift",
            "data": {
              "room_id": "test_room",
              "user_id": "user005",
              "user_name": "土豪用户",
              "gift_id": "gift_car",
              "gift_name": "跑车",
              "gift_count": 1,
              "gift_price": 1000,
              "timestamp": '$(date +%s)'
            },
            "sign": "test"
          }' \
          http://localhost:5000/api/douyin/webhook
        ;;
    6)
        echo "🚀 发送礼物：火箭"
        curl -X POST -H "Content-Type: application/json" \
          -d '{
            "event_type": "gift",
            "data": {
              "room_id": "test_room",
              "user_id": "user006",
              "user_name": "超级土豪",
              "gift_id": "gift_rocket",
              "gift_name": "火箭",
              "gift_count": 1,
              "gift_price": 10000,
              "timestamp": '$(date +%s)'
            },
            "sign": "test"
          }' \
          http://localhost:5000/api/douyin/webhook
        ;;
    7)
        echo "👍 模拟点赞"
        curl -X POST -H "Content-Type: application/json" \
          -d '{
            "event_type": "like",
            "data": {
              "room_id": "test_room",
              "user_id": "user007",
              "user_name": "点赞用户",
              "timestamp": '$(date +%s)'
            },
            "sign": "test"
          }' \
          http://localhost:5000/api/douyin/webhook
        ;;
    8)
        echo "❤️ 模拟关注"
        curl -X POST -H "Content-Type: application/json" \
          -d '{
            "event_type": "follow",
            "data": {
              "room_id": "test_room",
              "user_id": "user008",
              "user_name": "关注用户",
              "timestamp": '$(date +%s)'
            },
            "sign": "test"
          }' \
          http://localhost:5000/api/douyin/webhook
        ;;
    9)
        echo "🔄 批量测试弹幕"
        echo "发送 10 条随机弹幕..."
        for i in {1..10}; do
            messages=("治疗" "攻击" "护盾" "必杀技" "打" "砍" "回血" "防御" "大招" "绝招")
            user_names=("用户$i" "观众$i" "粉丝$i" "朋友$i")
            random_message=${messages[$RANDOM % ${#messages[@]}]}
            random_user=${user_names[$RANDOM % ${#user_names[@]}]}

            curl -s -X POST -H "Content-Type: application/json" \
              -d "{
                \"event_type\": \"danmaku\",
                \"data\": {
                  \"room_id\": \"test_room\",
                  \"user_id\": \"user_$i\",
                  \"user_name\": \"$random_user\",
                  \"content\": \"$random_message\",
                  \"timestamp\": $(date +%s)
                },
                \"sign\": \"test\"
              }" \
              http://localhost:5000/api/douyin/webhook > /dev/null

            echo "[$i/10] $random_user: $random_message"
            sleep 1
        done
        echo "✅ 批量测试完成"
        ;;
    0)
        echo "👋 退出"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "✅ 请求已发送"
echo ""
echo "💡 提示："
echo "  - 打开推流页面查看效果: http://localhost:5000/stream"
echo "  - 打开测试页面手动测试: http://localhost:5000/test.html"
echo "  - 查看服务器日志: tail -f /app/work/logs/bypass/dev.log"
echo ""
