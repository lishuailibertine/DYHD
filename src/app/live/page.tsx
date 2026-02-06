'use client';

import { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Heart, Sword, Shield, Zap, Users, Gift, Star, Settings } from 'lucide-react';

type SkillType = 'heal' | 'attack' | 'shield' | 'ult';

interface Skill {
  type: SkillType;
  name: string;
  icon: React.ReactNode;
  trigger: string;
  cooldown: number;
  lastUsed: number;
  description: string;
}

interface GameCharacter {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  avatar: string;
}

export default function LiveStreamGame() {
  const [player, setPlayer] = useState<GameCharacter>({
    name: '主播',
    hp: 1000,
    maxHp: 1000,
    atk: 100,
    def: 50,
    avatar: '🧙‍♂️',
  });

  const [enemy, setEnemy] = useState<GameCharacter>({
    name: '终极BOSS',
    hp: 5000,
    maxHp: 5000,
    atk: 150,
    def: 80,
    avatar: '🐉',
  });

  const [skills, setSkills] = useState<Skill[]>([
    {
      type: 'heal',
      name: '治疗术',
      icon: <Heart className="h-8 w-8" />,
      trigger: '治疗',
      cooldown: 5000,
      lastUsed: 0,
      description: '回复200点生命值',
    },
    {
      type: 'attack',
      name: '普通攻击',
      icon: <Sword className="h-8 w-8" />,
      trigger: '攻击',
      cooldown: 2000,
      lastUsed: 0,
      description: '造成(攻击力-防御)点伤害',
    },
    {
      type: 'shield',
      name: '神圣护盾',
      icon: <Shield className="h-8 w-8" />,
      trigger: '护盾',
      cooldown: 10000,
      lastUsed: 0,
      description: '格挡50%伤害，持续5秒',
    },
    {
      type: 'ult',
      name: '终极奥义',
      icon: <Zap className="h-8 w-8" />,
      trigger: '必杀技',
      cooldown: 30000,
      lastUsed: 0,
      description: '造成300%攻击力的巨额伤害',
    },
  ]);

  const [danmakuList, setDanmakuList] = useState<Array<{ id: number; text: string; user: string; avatar?: string; time: number; type?: string }>>([]);
  const [skillEffects, setSkillEffects] = useState<Array<{ id: number; type: SkillType; x: number; y: number }>>([]);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: number; value: number; x: number; y: number; color: string; isHeal?: boolean }>>([]);
  const [logs, setLogs] = useState<Array<{ text: string; time: string; type: 'info' | 'skill' | 'gift' | 'error' }>>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused'>('playing');

  const wsRef = useRef<WebSocket | null>(null);
  const danmakuIdRef = useRef(0);
  const effectIdRef = useRef(0);

  // WebSocket 连接
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/api/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      addLog('🔗 实时连接成功', 'info');
      // 模拟观众人数
      setViewerCount(Math.floor(Math.random() * 10000) + 1000);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received WebSocket message:', message);

        if (message.type === 'connected') {
          addLog('✅ 服务器连接成功', 'info');
        } else if (message.type === 'event') {
          handleWebSocketEvent(message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      addLog('❌ 连接错误', 'error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      addLog('🔌 连接断开', 'error');

      // 自动重连
      const reconnectInterval = setInterval(() => {
        addLog('🔄 尝试重连...', 'info');
        const newWs = new WebSocket(wsUrl);
        newWs.onopen = () => {
          clearInterval(reconnectInterval);
          addLog('✅ 重连成功', 'info');
        };
        newWs.onerror = () => {
          addLog('❌ 重连失败', 'error');
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

  // 更新观众人数
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 100) - 50;
        return Math.max(1000, prev + change);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 处理 WebSocket 事件
  const handleWebSocketEvent = (data: any) => {
    if (data.type === 'danmaku') {
      handleDanmaku(data.data.content, data.data.user_name, data.data.avatar_url);
    } else if (data.type === 'gift') {
      handleGift(data.data);
    } else if (data.type === 'like') {
      // 点赞可以触发小额治疗
      handleDanmaku('点赞', data.data.user_name, data.data.avatar_url);
    } else if (data.type === 'follow') {
      // 关注触发中等治疗
      handleDanmaku('回血', data.data.user_name, data.data.avatar_url);
    }
  };

  // 添加日志
  const addLog = (text: string, type: 'info' | 'skill' | 'gift' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ text, time, type }, ...prev].slice(0, 50));
  };

  // 处理弹幕
  const handleDanmaku = (text: string, user: string = '观众', avatar?: string) => {
    const id = danmakuIdRef.current++;
    setDanmakuList(prev => [...prev, { id, text, user, avatar, time: Date.now(), type: 'danmaku' }]);

    // 检查是否触发技能
    const skill = skills.find(s => text.includes(s.trigger));
    if (skill) {
      triggerSkill(skill, user);
    }

    // 清理弹幕
    setTimeout(() => {
      setDanmakuList(prev => prev.filter(d => d.id !== id));
    }, 8000);
  };

  // 处理礼物
  const handleGift = (giftData: any) => {
    const { gift_name, gift_count, user_name, avatar_url, gift_effect } = giftData;
    const id = danmakuIdRef.current++;

    // 显示礼物消息
    setDanmakuList(prev => [...prev, {
      id,
      text: `${gift_name} x${gift_count}`,
      user: user_name,
      avatar: avatar_url,
      time: Date.now(),
      type: 'gift'
    }]);

    // 根据礼物效果触发技能
    if (gift_effect && gift_effect.skill_type) {
      const skill = skills.find(s => s.type === gift_effect.skill_type);
      if (skill) {
        // 应用倍率
        triggerSkill(skill, user_name, gift_effect.multiplier);
        addLog(`🎁 ${user_name} 送出 ${gift_name} x${gift_count}，触发${skill.name}`, 'gift');
      }
    }

    setTimeout(() => {
      setDanmakuList(prev => prev.filter(d => d.id !== id));
    }, 10000);
  };

  // 触发技能
  const triggerSkill = (skill: Skill, userName: string, multiplier: number = 1) => {
    const now = Date.now();
    if (now - skill.lastUsed < skill.cooldown) {
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
    }, 2000);

    // 更新冷却时间
    setSkills(prev => prev.map(s =>
      s.type === skill.type ? { ...s, lastUsed: now } : s
    ));

    // 执行技能效果
    switch (skill.type) {
      case 'heal':
        const healAmount = Math.floor(200 * multiplier);
        setPlayer(prev => ({
          ...prev,
          hp: Math.min(prev.hp + healAmount, prev.maxHp),
        }));

        const healId = effectIdRef.current++;
        setDamageNumbers(prev => [...prev, {
          id: healId,
          value: healAmount,
          x: 50,
          y: 30,
          color: '#4ade80',
          isHeal: true,
        }]);
        setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== healId)), 2000);

        addLog(`💚 ${skill.name} ${userName} 回复 ${healAmount} 点生命值！`, 'skill');
        break;

      case 'attack':
        const damage = Math.floor((player.atk - enemy.def) * multiplier);
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));

        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 200);

        const damageId = effectIdRef.current++;
        setDamageNumbers(prev => [...prev, {
          id: damageId,
          value: damage,
          x: 50,
          y: 25,
          color: '#fbbf24',
        }]);
        setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== damageId)), 2000);

        addLog(`⚔️ ${skill.name} ${userName} 造成了 ${damage} 点伤害！`, 'skill');
        break;

      case 'shield':
        addLog(`🛡️ ${skill.name} ${userName} 开启了护盾！`, 'skill');
        break;

      case 'ult':
        const ultDamage = Math.floor(player.atk * 3 * multiplier);
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - ultDamage) }));

        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);

        const ultId = effectIdRef.current++;
        setDamageNumbers(prev => [...prev, {
          id: ultId,
          value: ultDamage,
          x: 50,
          y: 25,
          color: '#a855f7',
        }]);
        setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== ultId)), 2500);

        addLog(`⚡ ${skill.name} ${userName} 造成了 ${ultDamage} 点巨额伤害！`, 'skill');
        break;
    }
  };

  // 检查游戏结束
  useEffect(() => {
    if (enemy.hp <= 0) {
      addLog('🎉 恭喜！主播战胜了终极BOSS！', 'skill');
    }
  }, [enemy.hp]);

  useEffect(() => {
    if (player.hp <= 0) {
      addLog('💀 游戏结束！主播被击败了！', 'error');
    }
  }, [player.hp]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* 顶部栏 */}
      <div className="bg-black/40 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-pink-500" />
            <span className="text-2xl font-bold">{viewerCount.toLocaleString()}</span>
          </div>
          <div className="text-gray-400">|</div>
          <div className="text-white font-semibold">互动游戏直播间</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-400">直播中</span>
        </div>
      </div>

      {/* 主游戏区域 */}
      <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-64px)]">
        {/* 左侧：玩家信息 */}
        <div className="col-span-3 flex flex-col gap-4">
          <Card className="flex-1 bg-gradient-to-br from-green-900/80 to-green-800/80 backdrop-blur-sm border-green-500/50 p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-400">
                <span className="text-4xl">{player.avatar}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{player.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-green-200">LV.50</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-200">HP</span>
                  <span className="text-white font-bold">{player.hp}/{player.maxHp}</span>
                </div>
                <Progress value={(player.hp / player.maxHp) * 100} className="h-6 bg-green-900">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 transition-all" />
                </Progress>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-green-900/50 p-3 rounded-lg">
                  <div className="text-green-300">攻击力</div>
                  <div className="text-white font-bold text-xl">{player.atk}</div>
                </div>
                <div className="bg-green-900/50 p-3 rounded-lg">
                  <div className="text-green-300">防御力</div>
                  <div className="text-white font-bold text-xl">{player.def}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* 技能列表 */}
          <Card className="bg-black/40 backdrop-blur-sm border-white/10 p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              技能列表
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {skills.map(skill => {
                const now = Date.now();
                const remaining = Math.max(0, skill.cooldown - (now - skill.lastUsed));
                const isReady = remaining === 0;

                return (
                  <div
                    key={skill.type}
                    className={`p-3 rounded-lg transition-all ${
                      isReady ? 'bg-purple-900/50 hover:bg-purple-800/50' : 'bg-gray-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded-full bg-purple-600">
                        {skill.icon}
                      </div>
                      <div className="text-white font-semibold text-sm">{skill.name}</div>
                    </div>
                    <div className="text-xs text-purple-200">{skill.trigger}</div>
                    {!isReady && (
                      <div className="text-xs text-purple-300 mt-1">CD: {Math.ceil(remaining / 1000)}s</div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* 中间：战斗场景 */}
        <div className="col-span-6 flex flex-col">
          <Card className={`flex-1 relative bg-gradient-to-br from-slate-900 to-purple-900 backdrop-blur-sm border-purple-500/50 overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
            {/* 敌人 */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-10">
              <div className={`h-32 w-32 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto transition-all border-4 border-red-400 shadow-2xl shadow-red-500/50 ${enemy.hp <= 0 ? 'opacity-30 scale-75' : ''}`}>
                <span className="text-6xl">{enemy.avatar}</span>
              </div>
              <h3 className="mt-4 text-3xl font-bold text-white">{enemy.name}</h3>
              <div className="mt-3 w-64 mx-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-red-200">HP</span>
                  <span className="text-white font-bold">{enemy.hp}/{enemy.maxHp}</span>
                </div>
                <Progress value={(enemy.hp / enemy.maxHp) * 100} className="h-4 bg-red-900">
                  <div className="bg-gradient-to-r from-red-600 to-red-400 transition-all" />
                </Progress>
              </div>
            </div>

            {/* 技能特效 */}
            {skillEffects.map(effect => (
              <div
                key={effect.id}
                className="absolute animate-ping z-20"
                style={{ left: `${effect.x}%`, top: `${effect.y}%` }}
              >
                {effect.type === 'heal' && <Heart className="h-24 w-24 text-green-400" />}
                {effect.type === 'attack' && <Sword className="h-24 w-24 text-yellow-400" />}
                {effect.type === 'shield' && <Shield className="h-24 w-24 text-blue-400" />}
                {effect.type === 'ult' && <Zap className="h-32 w-32 text-purple-400" />}
              </div>
            ))}

            {/* 伤害数字 */}
            {damageNumbers.map(damage => (
              <div
                key={damage.id}
                className="absolute font-bold text-4xl animate-damage-float z-30"
                style={{
                  left: `${damage.x}%`,
                  top: `${damage.y}%`,
                  color: damage.color,
                  transform: 'translateX(-50%)',
                  textShadow: damage.isHeal ? '0 0 20px rgba(74, 222, 128, 0.8)' : '0 0 20px rgba(251, 191, 36, 0.8)',
                }}
              >
                {damage.isHeal ? '+' : ''}{damage.value}
              </div>
            ))}

            {/* 游戏状态 */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
              {enemy.hp <= 0 && (
                <div className="text-center">
                  <p className="text-4xl font-bold text-yellow-400 animate-bounce mb-4">🎉 胜利！</p>
                  <Button
                    onClick={() => setEnemy(prev => ({ ...prev, hp: prev.maxHp, atk: prev.atk * 1.1, maxHp: prev.maxHp * 1.1 }))}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 text-lg"
                  >
                    下一关
                  </Button>
                </div>
              )}
              {player.hp <= 0 && (
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-400 animate-pulse mb-4">💀 失败</p>
                  <Button
                    onClick={() => {
                      setPlayer(prev => ({ ...prev, hp: prev.maxHp }));
                      setEnemy(prev => ({ ...prev, hp: prev.maxHp }));
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-6 text-lg"
                  >
                    重新开始
                  </Button>
                </div>
              )}
            </div>

            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent pointer-events-none" />
          </Card>

          {/* 弹幕展示区 */}
          <Card className="h-32 mt-4 bg-black/60 backdrop-blur-sm border-white/10 p-4 relative overflow-hidden">
            {danmakuList.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                等待弹幕...
              </div>
            )}
            <div className="absolute inset-0">
              {danmakuList.map(danmaku => (
                <div
                  key={danmaku.id}
                  className={`absolute animate-slide-left whitespace-nowrap ${
                    danmaku.type === 'gift' ? 'font-bold' : ''
                  }`}
                  style={{
                    top: `${(danmaku.id % 5) * 20}%`,
                    left: '100%',
                    animationDuration: `${6 + Math.random() * 3}s`,
                  }}
                >
                  <span className={`${danmaku.type === 'gift' ? 'bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent' : 'text-white'} font-semibold`}>
                    {danmaku.user}:
                  </span>
                  {danmaku.type === 'gift' ? (
                    <span className="ml-2 text-yellow-400 flex items-center gap-1">
                      <Gift className="h-4 w-4" />
                      {danmaku.text}
                    </span>
                  ) : (
                    <span className="ml-2 text-white">{danmaku.text}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 右侧：日志和统计 */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* 触发词提示 */}
          <Card className="bg-black/40 backdrop-blur-sm border-white/10 p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-400" />
              观众互动提示
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-200">
                <Heart className="h-4 w-4" />
                <span>发送"治疗"、"回血" → 回复生命</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-200">
                <Sword className="h-4 w-4" />
                <span>发送"攻击"、"打" → 造成伤害</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Shield className="h-4 w-4" />
                <span>发送"护盾" → 开启防御</span>
              </div>
              <div className="flex items-center gap-2 text-purple-200">
                <Zap className="h-4 w-4" />
                <span>发送"必杀技" → 巨额伤害</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 text-pink-200">
                <Gift className="h-4 w-4 inline mr-2" />
                <span>送礼物可触发技能特效</span>
              </div>
            </div>
          </Card>

          {/* 战斗日志 */}
          <Card className="flex-1 bg-black/60 backdrop-blur-sm border-white/10 p-4 overflow-hidden flex flex-col">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              战斗日志
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {logs.map((log, index) => (
                <div key={index} className={`text-sm ${
                  log.type === 'skill' ? 'text-purple-300' :
                  log.type === 'gift' ? 'text-pink-300' :
                  log.type === 'error' ? 'text-red-400' :
                  'text-gray-300'
                }`}>
                  <span className="text-gray-500">[{log.time}]</span> {log.text}
                </div>
              ))}
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
            transform: translateX(-3px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(3px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        @keyframes damage-float {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          50% {
            transform: translateX(-50%) translateY(-30px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-60px) scale(1);
          }
        }
        .animate-damage-float {
          animation: damage-float 1.5s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
