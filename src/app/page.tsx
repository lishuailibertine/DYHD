'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Sparkles, Shield, Sword, Heart, Zap, ArrowRight, Play, Settings } from 'lucide-react';

// 技能类型定义
type SkillType = 'heal' | 'attack' | 'shield' | 'ult';

interface Skill {
  type: SkillType;
  name: string;
  icon: React.ReactNode;
  trigger: string;
  cooldown: number;
  lastUsed: number;
}

interface GameCharacter {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
}

export default function DouyinGame() {
  const [player, setPlayer] = useState<GameCharacter>({
    name: '勇士',
    hp: 1000,
    maxHp: 1000,
    atk: 100,
    def: 50,
  });

  const [enemy, setEnemy] = useState<GameCharacter>({
    name: '魔王',
    hp: 2000,
    maxHp: 2000,
    atk: 80,
    def: 30,
  });

  const [danmakuList, setDanmakuList] = useState<Array<{ id: number; text: string; user: string; time: number }>>([]);
  const [skillEffects, setSkillEffects] = useState<Array<{ id: number; type: SkillType; x: number; y: number }>>([]);
  const [logs, setLogs] = useState<Array<{ text: string; time: string }>>([]);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: number; value: number; x: number; y: number; color: string }>>([]);
  const [isShaking, setIsShaking] = useState(false);

  // 技能配置
  const [skills, setSkills] = useState<Skill[]>([
    { type: 'heal', name: '治疗', icon: <Heart className="h-6 w-6" />, trigger: '治疗', cooldown: 5000, lastUsed: 0 },
    { type: 'attack', name: '攻击', icon: <Sword className="h-6 w-6" />, trigger: '攻击', cooldown: 2000, lastUsed: 0 },
    { type: 'shield', name: '护盾', icon: <Shield className="h-6 w-6" />, trigger: '护盾', cooldown: 10000, lastUsed: 0 },
    { type: 'ult', name: '必杀技', icon: <Zap className="h-6 w-6" />, trigger: '必杀技', cooldown: 30000, lastUsed: 0 },
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const danmakuIdRef = useRef(0);
  const effectIdRef = useRef(0);

  // WebSocket 连接
  useEffect(() => {
    // 连接 WebSocket 服务器
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/api/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      addLog('✅ WebSocket 连接成功');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received WebSocket message:', message);

        if (message.type === 'message' || message.type === 'event') {
          handleWebSocketMessage(message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      addLog('❌ WebSocket 连接错误');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      addLog('🔌 WebSocket 连接断开');

      // 自动重连
      const reconnectInterval = setInterval(() => {
        addLog('🔄 尝试重连 WebSocket...');
        const newWs = new WebSocket(wsUrl);
        newWs.onopen = () => {
          clearInterval(reconnectInterval);
          addLog('✅ WebSocket 重连成功');
        };
        newWs.onerror = () => {
          addLog('❌ WebSocket 重连失败');
        };
      }, 3000);
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 处理 WebSocket 消息
  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'danmaku') {
      handleDanmaku(data.data.content, data.data.user_name);
    } else if (data.type === 'gift') {
      // 礼物触发必杀技
      handleDanmaku('必杀技', `${data.data.user_name} (礼物: ${data.data.gift_name})`);
    }
  };

  // 模拟弹幕（仅在没有真实弹幕时使用）
  useEffect(() => {
    const testDanmaku = [
      { text: '治疗', user: '用户1' },
      { text: '攻击', user: '用户2' },
      { text: '护盾', user: '用户3' },
      { text: '治疗', user: '用户4' },
      { text: '必杀技', user: '用户5' },
      { text: '攻击', user: '用户6' },
      { text: '治疗', user: '用户7' },
      { text: '护盾', user: '用户8' },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < testDanmaku.length) {
        handleDanmaku(testDanmaku[index].text, testDanmaku[index].user);
        index++;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 添加日志
  const addLog = (text: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ text, time }, ...prev].slice(0, 20));
  };

  // 处理弹幕
  const handleDanmaku = (text: string, user: string = '观众') => {
    const id = danmakuIdRef.current++;
    setDanmakuList(prev => [...prev, { id, text, user, time: Date.now() }]);

    // 检查是否触发技能
    const skill = skills.find(s => text.includes(s.trigger));
    if (skill) {
      triggerSkill(skill);
    }
  };

  // 触发技能
  const triggerSkill = (skill: Skill) => {
    const now = Date.now();
    if (now - skill.lastUsed < skill.cooldown) {
      addLog(`${skill.name} 冷却中...`);
      return;
    }

    // 添加技能特效
    const effectId = effectIdRef.current++;
    setSkillEffects(prev => [...prev, {
      id: effectId,
      type: skill.type,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
    }]);

    // 移除特效
    setTimeout(() => {
      setSkillEffects(prev => prev.filter(e => e.id !== effectId));
    }, 1500);

    // 更新冷却时间
    setSkills(prev => prev.map(s =>
      s.type === skill.type ? { ...s, lastUsed: now } : s
    ));

    // 执行技能效果
    switch (skill.type) {
      case 'heal':
        const healAmount = 200;
        setPlayer(prev => ({
          ...prev,
          hp: Math.min(prev.hp + healAmount, prev.maxHp),
        }));

        // 添加治疗数字
        const healId = damageNumbers.length;
        setDamageNumbers(prev => [...prev, {
          id: healId,
          value: healAmount,
          x: 50,
          y: 30,
          color: '#4ade80', // green
        }]);
        setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== healId)), 1500);

        addLog(`💚 ${skill.name} 回复了 ${healAmount} 点生命值！`);
        break;

      case 'attack':
        const damage = Math.max(10, player.atk - enemy.def);
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));

        // 屏幕震动
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 200);

        // 添加伤害数字
        const damageId = damageNumbers.length;
        setDamageNumbers(prev => [...prev, {
          id: damageId,
          value: damage,
          x: 50,
          y: 25,
          color: '#fbbf24', // yellow
        }]);
        setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== damageId)), 1500);

        addLog(`⚔️ ${skill.name} 造成了 ${damage} 点伤害！`);
        break;

      case 'shield':
        addLog(`🛡️ ${skill.name} 开启了护盾！`);
        break;

      case 'ult':
        const ultDamage = Math.max(50, player.atk * 3 - enemy.def);
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - ultDamage) }));

        // 屏幕震动（更强烈）
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);

        // 添加巨额伤害数字
        const ultId = damageNumbers.length;
        setDamageNumbers(prev => [...prev, {
          id: ultId,
          value: ultDamage,
          x: 50,
          y: 25,
          color: '#a855f7', // purple
        }]);
        setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== ultId)), 2000);

        addLog(`⚡ ${skill.name} 造成了 ${ultDamage} 点巨额伤害！`);
        break;
    }

    // 清理弹幕
    setTimeout(() => {
      setDanmakuList(prev => prev.filter(d => d.id !== id));
    }, 5000);
  };

  // 检查游戏结束
  useEffect(() => {
    if (enemy.hp <= 0) {
      addLog('🎉 恭喜！你战胜了魔王！');
    }
  }, [enemy.hp]);

  useEffect(() => {
    if (player.hp <= 0) {
      addLog('💀 游戏结束！你被魔王击败了！');
    }
  }, [player.hp]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 导航栏 */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white">抖音互动游戏</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="outline" className="border-purple-500/50 text-purple-200 hover:bg-purple-500/10">
                <Settings className="h-4 w-4 mr-2" />
                管理
              </Button>
            </Link>
            <Link href="/live">
              <Button variant="outline" className="border-purple-500/50 text-purple-200 hover:bg-purple-500/10">
                <Play className="h-4 w-4 mr-2" />
                直播预览
              </Button>
            </Link>
            <Link href="/stream">
              <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                <Play className="h-4 w-4 mr-2" />
                推流模式
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mx-auto max-w-6xl">
          {/* 标题 */}
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-white">抖音弹幕互动游戏</h1>
            <p className="mt-2 text-purple-200">发送弹幕来触发技能：治疗、攻击、护盾、必杀技</p>
          </div>

        {/* 游戏主区域 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左侧：玩家信息 */}
          <Card className="bg-gradient-to-br from-green-900 to-green-800 p-6 border-green-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{player.name}</h2>
                <p className="text-green-200">HP: {player.hp}/{player.maxHp}</p>
              </div>
            </div>
            <Progress value={(player.hp / player.maxHp) * 100} className="h-4" />
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-green-200">攻击力: {player.atk}</div>
              <div className="text-green-200">防御力: {player.def}</div>
            </div>
          </Card>

          {/* 中间：战斗场景 */}
          <Card className={`relative min-h-[500px] bg-gradient-to-br from-purple-900 to-indigo-900 overflow-hidden border-purple-500 ${isShaking ? 'animate-shake' : ''}`}>
            {/* 敌人 */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
              <div className={`h-24 w-24 rounded-full bg-red-600 flex items-center justify-center mx-auto transition-all ${enemy.hp <= 0 ? 'opacity-30 scale-75' : ''}`}>
                <span className="text-4xl">👹</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-white">{enemy.name}</h3>
              <div className="mt-2 w-48 mx-auto">
                <Progress value={(enemy.hp / enemy.maxHp) * 100} className="h-3 bg-red-900">
                  <div className="bg-red-500 transition-all" />
                </Progress>
                <p className="text-sm text-red-200 mt-1">HP: {enemy.hp}/{enemy.maxHp}</p>
              </div>
            </div>

            {/* 技能特效 */}
            {skillEffects.map(effect => (
              <div
                key={effect.id}
                className="absolute animate-ping"
                style={{ left: `${effect.x}%`, top: `${effect.y}%` }}
              >
                {effect.type === 'heal' && <Heart className="h-16 w-16 text-green-400" />}
                {effect.type === 'attack' && <Sword className="h-16 w-16 text-yellow-400" />}
                {effect.type === 'shield' && <Shield className="h-16 w-16 text-blue-400" />}
                {effect.type === 'ult' && <Zap className="h-20 w-20 text-purple-400" />}
              </div>
            ))}

            {/* 伤害数字 */}
            {damageNumbers.map(damage => (
              <div
                key={damage.id}
                className="absolute font-bold text-3xl animate-damage-float"
                style={{
                  left: `${damage.x}%`,
                  top: `${damage.y}%`,
                  color: damage.color,
                  transform: 'translateX(-50%)',
                }}
              >
                {damage.value}
              </div>
            ))}

            {/* 游戏状态 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              {enemy.hp <= 0 && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-400 animate-bounce">🎉 胜利！</p>
                  <Button
                    onClick={() => setEnemy(prev => ({ ...prev, hp: prev.maxHp }))}
                    className="mt-4 bg-yellow-500 hover:bg-yellow-600"
                  >
                    重新开始
                  </Button>
                </div>
              )}
              {player.hp <= 0 && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-400 animate-pulse">💀 失败</p>
                  <Button
                    onClick={() => setPlayer(prev => ({ ...prev, hp: prev.maxHp }))}
                    className="mt-4 bg-red-500 hover:bg-red-600"
                  >
                    重新开始
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* 右侧：技能面板 */}
          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 border-blue-500">
            <h3 className="text-xl font-bold text-white mb-4">技能列表</h3>
            <div className="space-y-3">
              {skills.map(skill => {
                const now = Date.now();
                const remaining = Math.max(0, skill.cooldown - (now - skill.lastUsed));
                const isReady = remaining === 0;

                return (
                  <div
                    key={skill.type}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isReady ? 'bg-blue-700/50 hover:bg-blue-700' : 'bg-gray-700/50 opacity-60'
                    }`}
                  >
                    <div className="p-2 rounded-full bg-blue-600">
                      {skill.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{skill.name}</p>
                      <p className="text-sm text-blue-200">触发词: {skill.trigger}</p>
                    </div>
                    {!isReady && (
                      <div className="text-sm text-blue-300">
                        {Math.ceil(remaining / 1000)}s
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* 底部：弹幕和日志 */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* 弹幕区域 */}
          <Card className="bg-black/50 p-4 border-purple-500">
            <h3 className="text-lg font-bold text-white mb-3">实时弹幕</h3>
            <div className="h-48 overflow-hidden relative">
              {danmakuList.map(danmaku => (
                <div
                  key={danmaku.id}
                  className="absolute animate-slide-left text-white font-bold text-lg"
                  style={{
                    top: `${Math.random() * 80}%`,
                    left: '100%',
                    animationDuration: `${5 + Math.random() * 3}s`,
                  }}
                >
                  <span className="text-yellow-400">{danmaku.user}:</span> {danmaku.text}
                </div>
              ))}
              {danmakuList.length === 0 && (
                <p className="text-gray-400 text-center mt-16">等待弹幕...</p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => handleDanmaku('治疗', '测试用户')} className="flex-1 bg-green-600 hover:bg-green-700">
                发送"治疗"
              </Button>
              <Button onClick={() => handleDanmaku('攻击', '测试用户')} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                发送"攻击"
              </Button>
              <Button onClick={() => handleDanmaku('必杀技', '测试用户')} className="flex-1 bg-purple-600 hover:bg-purple-700">
                发送"必杀技"
              </Button>
            </div>
          </Card>

          {/* 战斗日志 */}
          <Card className="bg-black/50 p-4 border-purple-500">
            <h3 className="text-lg font-bold text-white mb-3">战斗日志</h3>
            <div className="h-48 overflow-y-auto space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="text-sm text-purple-200">
                  <span className="text-gray-400">[{log.time}]</span> {log.text}
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-gray-400 text-center mt-16">战斗开始...</p>
              )}
            </div>
          </Card>
        </div>

        {/* 说明 */}
        <Card className="mt-6 bg-black/30 p-6 border-purple-500">
          <h3 className="text-lg font-bold text-white mb-3">游戏说明</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-purple-300 mb-2">如何触发技能</h4>
              <ul className="text-sm text-purple-200 space-y-1">
                <li>• 发送弹幕包含"治疗" → 回复生命值</li>
                <li>• 发送弹幕包含"攻击" → 造成伤害</li>
                <li>• 发送弹幕包含"护盾" → 开启防御</li>
                <li>• 发送弹幕包含"必杀技" → 巨额伤害</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-300 mb-2">对接抖音开放平台</h4>
              <p className="text-sm text-purple-200">
                后端将提供 Webhook 接口接收抖音弹幕事件，通过 WebSocket 实时推送弹幕消息到前端。
                支持 WebSocket 长连接和 SSE 推送两种方式。
              </p>
            </div>
          </div>
        </Card>

        {/* 直播页面提示 */}
        <Card className="mt-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm p-6 border-purple-500/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">🎥 准备好开始直播了吗？</h3>
              <p className="text-purple-200">
                进入直播页面，在抖音直播间展示互动游戏，让观众通过弹幕和礼物参与游戏！
              </p>
            </div>
            <Link href="/live">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8">
                进入直播间
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* 本地测试说明 */}
        <Card className="mt-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm p-6 border-blue-500/50">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">💡 本地开发测试</h3>
            <p className="text-blue-200 mb-4">
              想要在本地测试抖音推送？使用内网穿透工具将本地服务暴露到公网，让抖音可以推送消息到你的本地服务器。
            </p>
            <div className="space-y-2 text-sm text-blue-200">
              <div className="flex items-start gap-2">
                <span className="bg-blue-600/50 px-2 py-1 rounded text-xs font-semibold mt-0.5">方法1</span>
                <span>使用 ngrok（推荐）：运行 <code className="bg-black/30 px-2 py-1 rounded">ngrok http 5000</code> 获取公网地址</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-600/50 px-2 py-1 rounded text-xs font-semibold mt-0.5">方法2</span>
                <span>使用测试工具：访问 <code className="bg-black/30 px-2 py-1 rounded">/test.html</code> 手动发送测试消息</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-600/50 px-2 py-1 rounded text-xs font-semibold mt-0.5">方法3</span>
                <span>运行测试脚本：Windows 执行 <code className="bg-black/30 px-2 py-1 rounded">scripts\test-local.bat</code>，Mac/Linux 执行 <code className="bg-black/30 px-2 py-1 rounded">./scripts/test-local.sh</code></span>
              </div>
            </div>
            <div className="mt-4">
              <a href="/test.html" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-blue-500/50 text-blue-200 hover:bg-blue-500/10">
                  打开测试工具
                </Button>
              </a>
            </div>
          </div>
        </Card>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-120%);
          }
        }
        .animate-slide-left {
          animation: slide-left linear forwards;
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes damage-float {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-50px) scale(1.5);
          }
        }
        .animate-damage-float {
          animation: damage-float 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
