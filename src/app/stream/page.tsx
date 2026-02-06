'use client';

import { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Heart, Sword, Shield, Zap, Users, Gift } from 'lucide-react';

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
  avatar: string;
}

export default function StreamPage() {
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
      icon: <Heart className="h-6 w-6" />,
      trigger: '治疗',
      cooldown: 5000,
      lastUsed: 0,
    },
    {
      type: 'attack',
      name: '攻击',
      icon: <Sword className="h-6 w-6" />,
      trigger: '攻击',
      cooldown: 2000,
      lastUsed: 0,
    },
    {
      type: 'shield',
      name: '护盾',
      icon: <Shield className="h-6 w-6" />,
      trigger: '护盾',
      cooldown: 10000,
      lastUsed: 0,
    },
    {
      type: 'ult',
      name: '必杀技',
      icon: <Zap className="h-6 w-6" />,
      trigger: '必杀技',
      cooldown: 30000,
      lastUsed: 0,
    },
  ]);

  const [danmakuList, setDanmakuList] = useState<Array<{ id: number; text: string; user: string; time: number; type?: string }>>([]);
  const [skillEffects, setSkillEffects] = useState<Array<{ id: number; type: SkillType; x: number; y: number }>>([]);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: number; value: number; x: number; y: number; color: string; isHeal?: boolean }>>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

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
      setViewerCount(Math.floor(Math.random() * 10000) + 1000);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'event') {
          handleWebSocketEvent(message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');

      // 自动重连
      const reconnectInterval = setInterval(() => {
        const newWs = new WebSocket(wsUrl);
        newWs.onopen = () => {
          clearInterval(reconnectInterval);
        };
        newWs.onerror = () => {
          // 重连失败，继续尝试
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
      handleDanmaku(data.data.content, data.data.user_name);
    } else if (data.type === 'gift') {
      handleGift(data.data);
    } else if (data.type === 'like') {
      handleDanmaku('点赞', data.data.user_name);
    } else if (data.type === 'follow') {
      handleDanmaku('回血', data.data.user_name);
    }
  };

  // 处理弹幕
  const handleDanmaku = (text: string, user: string = '观众') => {
    const id = danmakuIdRef.current++;
    setDanmakuList(prev => [...prev, { id, text, user, time: Date.now(), type: 'danmaku' }]);

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
    const { gift_name, gift_count, user_name, gift_effect } = giftData;
    const id = danmakuIdRef.current++;

    // 显示礼物消息
    setDanmakuList(prev => [...prev, {
      id,
      text: `${gift_name} x${gift_count}`,
      user: user_name,
      time: Date.now(),
      type: 'gift'
    }]);

    // 根据礼物效果触发技能
    if (gift_effect && gift_effect.skill_type) {
      const skill = skills.find(s => s.type === gift_effect.skill_type);
      if (skill) {
        triggerSkill(skill, user_name, gift_effect.multiplier);
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
        break;

      case 'shield':
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
        break;
    }
  };

  // 检查游戏结束
  useEffect(() => {
    if (enemy.hp <= 0) {
      setTimeout(() => {
        setEnemy(prev => ({ ...prev, hp: prev.maxHp, atk: prev.atk * 1.1, maxHp: prev.maxHp * 1.1 }));
      }, 3000);
    }
  }, [enemy.hp]);

  useEffect(() => {
    if (player.hp <= 0) {
      setTimeout(() => {
        setPlayer(prev => ({ ...prev, hp: prev.maxHp }));
        setEnemy(prev => ({ ...prev, hp: prev.maxHp }));
      }, 3000);
    }
  }, [player.hp]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* 观众人数显示 */}
      <div className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
        <Users className="h-5 w-5 text-pink-500" />
        <span className="text-white text-xl font-bold">{viewerCount.toLocaleString()}</span>
      </div>

      {/* 主游戏区域 */}
      <div className="relative h-full flex">
        {/* 左侧：玩家信息 */}
        <div className="w-80 bg-black/40 backdrop-blur-sm border-r border-white/10 p-6 flex flex-col justify-center">
          <div className="text-center">
            <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border-4 border-green-400 mb-4">
              <span className="text-5xl">{player.avatar}</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{player.name}</h2>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-200">HP</span>
                <span className="text-white font-bold">{player.hp}/{player.maxHp}</span>
              </div>
              <Progress value={(player.hp / player.maxHp) * 100} className="h-6 bg-green-900">
                <div className="bg-gradient-to-r from-green-500 to-green-400 transition-all" />
              </Progress>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-900/50 p-3 rounded-lg">
                <div className="text-green-300 text-sm">攻击力</div>
                <div className="text-white font-bold text-2xl">{player.atk}</div>
              </div>
              <div className="bg-green-900/50 p-3 rounded-lg">
                <div className="text-green-300 text-sm">防御力</div>
                <div className="text-white font-bold text-2xl">{player.def}</div>
              </div>
            </div>
          </div>

          {/* 技能列表 */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="text-white font-semibold">技能</span>
            </div>
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
          </div>
        </div>

        {/* 中间：战斗场景 */}
        <div className={`flex-1 relative bg-gradient-to-br from-slate-900 to-purple-900 ${isShaking ? 'animate-shake' : ''}`}>
          {/* 敌人 */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center z-10">
            <div className={`h-40 w-40 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto transition-all border-4 border-red-400 shadow-2xl shadow-red-500/50 ${enemy.hp <= 0 ? 'opacity-30 scale-75' : ''}`}>
              <span className="text-7xl">{enemy.avatar}</span>
            </div>
            <h3 className="mt-4 text-4xl font-bold text-white">{enemy.name}</h3>
            <div className="mt-3 w-80 mx-auto">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-red-200">HP</span>
                <span className="text-white font-bold">{enemy.hp}/{enemy.maxHp}</span>
              </div>
              <Progress value={(enemy.hp / enemy.maxHp) * 100} className="h-6 bg-red-900">
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
              {effect.type === 'heal' && <Heart className="h-32 w-32 text-green-400" />}
              {effect.type === 'attack' && <Sword className="h-32 w-32 text-yellow-400" />}
              {effect.type === 'shield' && <Shield className="h-32 w-32 text-blue-400" />}
              {effect.type === 'ult' && <Zap className="h-40 w-40 text-purple-400" />}
            </div>
          ))}

          {/* 伤害数字 */}
          {damageNumbers.map(damage => (
            <div
              key={damage.id}
              className="absolute font-bold text-5xl animate-damage-float z-30"
              style={{
                left: `${damage.x}%`,
                top: `${damage.y}%`,
                color: damage.color,
                transform: 'translateX(-50%)',
                textShadow: damage.isHeal ? '0 0 30px rgba(74, 222, 128, 0.8)' : '0 0 30px rgba(251, 191, 36, 0.8)',
              }}
            >
              {damage.isHeal ? '+' : ''}{damage.value}
            </div>
          ))}

          {/* 游戏状态 */}
          {enemy.hp <= 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30">
              <p className="text-6xl font-bold text-yellow-400 animate-bounce mb-6">🎉 胜利！</p>
              <p className="text-2xl text-white">进入下一关...</p>
            </div>
          )}

          {player.hp <= 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30">
              <p className="text-6xl font-bold text-red-400 animate-pulse mb-6">💀 失败</p>
              <p className="text-2xl text-white">重新开始...</p>
            </div>
          )}
        </div>

        {/* 右侧：弹幕展示区 */}
        <div className="w-72 bg-black/60 backdrop-blur-sm border-l border-white/10 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-pink-400" />
            <span className="text-white font-semibold">实时弹幕</span>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {danmakuList.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                等待弹幕...
              </div>
            )}
            <div className="absolute inset-0">
              {danmakuList.map(danmaku => (
                <div
                  key={danmaku.id}
                  className={`absolute mb-2 whitespace-nowrap ${danmaku.type === 'gift' ? 'font-bold' : ''}`}
                  style={{
                    left: '0',
                    top: `${(danmaku.id % 6) * 16 + 2}%`,
                  }}
                >
                  <span className={`${danmaku.type === 'gift' ? 'bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent' : 'text-white'} font-semibold text-sm`}>
                    {danmaku.user}:
                  </span>
                  {danmaku.type === 'gift' ? (
                    <span className="ml-2 text-yellow-400 flex items-center gap-1">
                      <Gift className="h-4 w-4" />
                      {danmaku.text}
                    </span>
                  ) : (
                    <span className="ml-2 text-white text-sm">{danmaku.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 底部提示 */}
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-purple-300">
            <div className="flex items-center gap-1 mb-1">
              <Heart className="h-3 w-3" />
              <span>治疗</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <Sword className="h-3 w-3" />
              <span>攻击</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <Shield className="h-3 w-3" />
              <span>护盾</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>必杀技</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
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
            transform: translateX(-50%) translateY(-40px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-80px) scale(1);
          }
        }
        .animate-damage-float {
          animation: damage-float 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
