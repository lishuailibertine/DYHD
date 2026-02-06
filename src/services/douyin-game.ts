/**
 * 抖音互动游戏服务
 */

import DouyinAuthService from './douyin-auth';

interface GameConfig {
  room_id: string;
  game_id: string;
  duration?: number;
  skills?: {
    [key: string]: {
      trigger_words: string[];
      cooldown: number;
      effect: any;
    };
  };
}

interface GameResult {
  room_id: string;
  game_id: string;
  winner: 'player' | 'enemy' | 'draw';
  score: number;
  duration: number;
}

interface GameCommand {
  type: 'skill' | 'effect' | 'message';
  skill_id?: string;
  value?: number;
  data?: any;
}

class DouyinGameService {
  private static instance: DouyinGameService;
  private authService: DouyinAuthService;

  private constructor() {
    this.authService = DouyinAuthService.getInstance();
  }

  static getInstance(): DouyinGameService {
    if (!DouyinGameService.instance) {
      DouyinGameService.instance = new DouyinGameService();
    }
    return DouyinGameService.instance;
  }

  /**
   * 开始游戏
   */
  async startGame(config: GameConfig): Promise<any> {
    try {
      const accessToken = await this.authService.getAccessToken();

      const response = await fetch('https://open.douyin.com/game/start/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          room_id: config.room_id,
          game_id: config.game_id,
          game_config: {
            duration: config.duration || 300,
            skills: config.skills || {},
          },
        }),
      });

      const result = await response.json();

      if (result.message !== 'success') {
        throw new Error(`开始游戏失败: ${JSON.stringify(result)}`);
      }

      console.log('游戏开始成功:', result.data);
      return result.data;
    } catch (error) {
      console.error('开始游戏错误:', error);
      throw error;
    }
  }

  /**
   * 结束游戏
   */
  async endGame(result: GameResult): Promise<any> {
    try {
      const accessToken = await this.authService.getAccessToken();

      const response = await fetch('https://open.douyin.com/game/end/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          room_id: result.room_id,
          game_id: result.game_id,
          result: {
            winner: result.winner,
            score: result.score,
            duration: result.duration,
          },
        }),
      });

      const resultData = await response.json();

      if (resultData.message !== 'success') {
        throw new Error(`结束游戏失败: ${JSON.stringify(resultData)}`);
      }

      console.log('游戏结束成功:', resultData.data);
      return resultData.data;
    } catch (error) {
      console.error('结束游戏错误:', error);
      throw error;
    }
  }

  /**
   * 发送游戏指令
   */
  async sendGameCommand(roomId: string, command: GameCommand): Promise<any> {
    try {
      const accessToken = await this.authService.getAccessToken();

      const response = await fetch('https://open.douyin.com/game/command/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          room_id: roomId,
          command: command,
        }),
      });

      const result = await response.json();

      if (result.message !== 'success') {
        throw new Error(`发送游戏指令失败: ${JSON.stringify(result)}`);
      }

      return result.data;
    } catch (error) {
      console.error('发送游戏指令错误:', error);
      throw error;
    }
  }

  /**
   * 获取直播间信息
   */
  async getRoomInfo(roomId: string): Promise<any> {
    try {
      const accessToken = await this.authService.getAccessToken();

      const response = await fetch(
        `https://open.douyin.com/room/info/?access_token=${accessToken}&room_id=${roomId}`,
        {
          method: 'GET',
        }
      );

      const result = await response.json();

      if (result.message !== 'success') {
        throw new Error(`获取直播间信息失败: ${JSON.stringify(result)}`);
      }

      return result.data;
    } catch (error) {
      console.error('获取直播间信息错误:', error);
      throw error;
    }
  }

  /**
   * 获取游戏列表
   */
  async getGameList(): Promise<any> {
    try {
      const accessToken = await this.authService.getAccessToken();

      const response = await fetch(
        `https://open.douyin.com/game/list/?access_token=${accessToken}`,
        {
          method: 'GET',
        }
      );

      const result = await response.json();

      if (result.message !== 'success') {
        throw new Error(`获取游戏列表失败: ${JSON.stringify(result)}`);
      }

      return result.data;
    } catch (error) {
      console.error('获取游戏列表错误:', error);
      throw error;
    }
  }
}

export default DouyinGameService;
