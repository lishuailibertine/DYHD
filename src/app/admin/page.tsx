'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Save, RefreshCw, Play, Pause, Info } from 'lucide-react';

interface GameConfig {
  roomId: string;
  gameId: string;
  duration: number;
  player: {
    name: string;
    hp: number;
    atk: number;
    def: number;
  };
  enemy: {
    name: string;
    hp: number;
    atk: number;
    def: number;
  };
  skills: {
    heal: {
      enabled: boolean;
      cooldown: number;
      value: number;
    };
    attack: {
      enabled: boolean;
      cooldown: number;
      multiplier: number;
    };
    shield: {
      enabled: boolean;
      cooldown: number;
      value: number;
    };
    ult: {
      enabled: boolean;
      cooldown: number;
      multiplier: number;
    };
  };
}

export default function AdminPanel() {
  const [config, setConfig] = useState<GameConfig>({
    roomId: '',
    gameId: 'douyin-game-001',
    duration: 300,
    player: {
      name: '主播',
      hp: 1000,
      atk: 100,
      def: 50,
    },
    enemy: {
      name: 'BOSS',
      hp: 5000,
      atk: 150,
      def: 80,
    },
    skills: {
      heal: {
        enabled: true,
        cooldown: 5000,
        value: 200,
      },
      attack: {
        enabled: true,
        cooldown: 2000,
        multiplier: 1,
      },
      shield: {
        enabled: true,
        cooldown: 10000,
        value: 0.5,
      },
      ult: {
        enabled: true,
        cooldown: 30000,
        multiplier: 3,
      },
    },
  });

  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // 保存配置到 localStorage
    localStorage.setItem('game-config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLoad = () => {
    const savedConfig = localStorage.getItem('game-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  };

  useEffect(() => {
    handleLoad();
  }, []);

  const handleStartGame = async () => {
    setStatus('running');
    // 调用游戏开始接口
    try {
      const response = await fetch('/api/douyin/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: config.roomId,
          game_id: config.gameId,
          duration: config.duration,
          skills: config.skills,
        }),
      });
      const result = await response.json();
      console.log('Game started:', result);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleEndGame = async () => {
    setStatus('idle');
    // 调用游戏结束接口
    try {
      const response = await fetch('/api/douyin/game/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: config.roomId,
          game_id: config.gameId,
          result: {
            winner: 'player',
            score: 1000,
          },
        }),
      });
      const result = await response.json();
      console.log('Game ended:', result);
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mx-auto max-w-6xl">
        {/* 标题 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">游戏配置管理</h1>
              <p className="text-purple-200">配置直播间游戏参数和技能设置</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleLoad} variant="outline" className="border-purple-500/50 text-purple-200">
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
            <Button onClick={handleSave} className={`bg-gradient-to-r from-purple-600 to-pink-600 ${saved ? 'from-green-600 to-green-500' : ''}`}>
              <Save className="h-4 w-4 mr-2" />
              {saved ? '已保存' : '保存配置'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 基础配置 */}
          <Card className="bg-black/40 backdrop-blur-sm border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              基础配置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">直播间 ID</label>
                <input
                  type="text"
                  value={config.roomId}
                  onChange={(e) => setConfig({ ...config, roomId: e.target.value })}
                  className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50"
                  placeholder="输入抖音直播间ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">游戏 ID</label>
                <input
                  type="text"
                  value={config.gameId}
                  onChange={(e) => setConfig({ ...config, gameId: e.target.value })}
                  className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">游戏时长（秒）</label>
                <input
                  type="number"
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) || 300 })}
                  className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                />
              </div>
            </div>
          </Card>

          {/* 玩家配置 */}
          <Card className="bg-black/40 backdrop-blur-sm border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🧙‍♂️ 玩家配置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">角色名称</label>
                <input
                  type="text"
                  value={config.player.name}
                  onChange={(e) => setConfig({ ...config, player: { ...config.player, name: e.target.value } })}
                  className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">生命值</label>
                  <input
                    type="number"
                    value={config.player.hp}
                    onChange={(e) => setConfig({ ...config, player: { ...config.player, hp: parseInt(e.target.value) || 1000 } })}
                    className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">攻击力</label>
                  <input
                    type="number"
                    value={config.player.atk}
                    onChange={(e) => setConfig({ ...config, player: { ...config.player, atk: parseInt(e.target.value) || 100 } })}
                    className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">防御力</label>
                  <input
                    type="number"
                    value={config.player.def}
                    onChange={(e) => setConfig({ ...config, player: { ...config.player, def: parseInt(e.target.value) || 50 } })}
                    className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* 敌人配置 */}
          <Card className="bg-black/40 backdrop-blur-sm border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🐉 敌人配置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">角色名称</label>
                <input
                  type="text"
                  value={config.enemy.name}
                  onChange={(e) => setConfig({ ...config, enemy: { ...config.enemy, name: e.target.value } })}
                  className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">生命值</label>
                  <input
                    type="number"
                    value={config.enemy.hp}
                    onChange={(e) => setConfig({ ...config, enemy: { ...config.enemy, hp: parseInt(e.target.value) || 5000 } })}
                    className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">攻击力</label>
                  <input
                    type="number"
                    value={config.enemy.atk}
                    onChange={(e) => setConfig({ ...config, enemy: { ...config.enemy, atk: parseInt(e.target.value) || 150 } })}
                    className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">防御力</label>
                  <input
                    type="number"
                    value={config.enemy.def}
                    onChange={(e) => setConfig({ ...config, enemy: { ...config.enemy, def: parseInt(e.target.value) || 80 } })}
                    className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* 游戏控制 */}
          <Card className="bg-black/40 backdrop-blur-sm border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🎮 游戏控制
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-200">游戏状态</span>
                  <span className={`font-bold ${
                    status === 'running' ? 'text-green-400' :
                    status === 'paused' ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    {status === 'running' ? '运行中' : status === 'paused' ? '已暂停' : '未开始'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {status === 'running' ? (
                  <Button onClick={handleEndGame} className="flex-1 bg-red-600 hover:bg-red-700">
                    <Pause className="h-4 w-4 mr-2" />
                    结束游戏
                  </Button>
                ) : (
                  <Button onClick={handleStartGame} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    开始游戏
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 技能配置 */}
        <Card className="mt-6 bg-black/40 backdrop-blur-sm border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            ⚡ 技能配置
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* 治疗 */}
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-green-400">治疗术</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.skills.heal.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, heal: { ...config.skills.heal, enabled: e.target.checked } }
                    })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-purple-200">启用</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">冷却时间（秒）</label>
                  <input
                    type="number"
                    value={config.skills.heal.cooldown / 1000}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, heal: { ...config.skills.heal, cooldown: parseInt(e.target.value) * 1000 } }
                    })}
                    className="w-full p-2 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">回复值</label>
                  <input
                    type="number"
                    value={config.skills.heal.value}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, heal: { ...config.skills.heal, value: parseInt(e.target.value) || 200 } }
                    })}
                    className="w-full p-2 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            {/* 攻击 */}
            <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-yellow-400">普通攻击</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.skills.attack.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, attack: { ...config.skills.attack, enabled: e.target.checked } }
                    })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-purple-200">启用</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">冷却时间（秒）</label>
                  <input
                    type="number"
                    value={config.skills.attack.cooldown / 1000}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, attack: { ...config.skills.attack, cooldown: parseInt(e.target.value) * 1000 } }
                    })}
                    className="w-full p-2 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">伤害倍率</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.skills.attack.multiplier}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, attack: { ...config.skills.attack, multiplier: parseFloat(e.target.value) || 1 } }
                    })}
                    className="w-full p-2 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            {/* 护盾 */}
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-400">神圣护盾</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.skills.shield.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, shield: { ...config.skills.shield, enabled: e.target.checked } }
                    })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-purple-200">启用</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">冷却时间（秒）</label>
                  <input
                    type="number"
                    value={config.skills.shield.cooldown / 1000}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, shield: { ...config.skills.shield, cooldown: parseInt(e.target.value) * 1000 } }
                    })}
                    className="w-full p-2 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">格挡比例</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.skills.shield.value}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, shield: { ...config.skills.shield, value: parseFloat(e.target.value) || 0.5 } }
                    })}
                    className="w-full p-2 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            {/* 必杀技 */}
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-purple-400">终极奥义</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.skills.ult.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, ult: { ...config.skills.ult, enabled: e.target.checked } }
                    })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-purple-200">启用</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">冷却时间（秒）</label>
                  <input
                    type="number"
                    value={config.skills.ult.cooldown / 1000}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, ult: { ...config.skills.ult, cooldown: parseInt(e.target.value) * 1000 } }
                    })}
                    className="w-full p-2 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">伤害倍率</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.skills.ult.multiplier}
                    onChange={(e) => setConfig({
                      ...config,
                      skills: { ...config.skills, ult: { ...config.skills.ult, multiplier: parseFloat(e.target.value) || 3 } }
                    })}
                    className="w-full p-2 bg-black/50 border border-purple-500/30 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
