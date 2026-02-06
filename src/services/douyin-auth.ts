/**
 * 抖音开放平台认证服务
 */

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

interface DouyinAuthConfig {
  appId: string;
  appSecret: string;
}

class DouyinAuthService {
  private static instance: DouyinAuthService;
  private config: DouyinAuthConfig;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;
  private refreshToken: string | null = null;

  private constructor() {
    // 从环境变量读取配置
    this.config = {
      appId: process.env.DOUYIN_APP_ID || '',
      appSecret: process.env.DOUYIN_APP_SECRET || '',
    };

    if (!this.config.appId || !this.config.appSecret) {
      console.warn('抖音开放平台配置未设置，请检查环境变量');
    }
  }

  static getInstance(): DouyinAuthService {
    if (!DouyinAuthService.instance) {
      DouyinAuthService.instance = new DouyinAuthService();
    }
    return DouyinAuthService.instance;
  }

  /**
   * 获取 Access Token
   */
  async getAccessToken(): Promise<string> {
    // 检查 token 是否还有效
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    // 获取新的 token
    return this.fetchAccessToken();
  }

  /**
   * 从抖音开放平台获取 Access Token
   */
  private async fetchAccessToken(): Promise<string> {
    try {
      const response = await fetch('https://open.douyin.com/oauth/access_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_key: this.config.appId,
          client_secret: this.config.appSecret,
          grant_type: 'client_credential',
        }),
      });

      const result = await response.json();

      if (result.message !== 'success' || !result.data) {
        throw new Error(`获取 Access Token 失败: ${JSON.stringify(result)}`);
      }

      const data = result.data as AccessTokenResponse;
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token || null;
      this.tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000; // 提前5分钟过期

      console.log('成功获取 Access Token');
      return this.accessToken;
    } catch (error) {
      console.error('获取 Access Token 错误:', error);
      throw error;
    }
  }

  /**
   * 刷新 Access Token
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('没有可用的 Refresh Token');
    }

    try {
      const response = await fetch('https://open.douyin.com/oauth/refresh_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_key: this.config.appId,
          refresh_token: this.refreshToken,
        }),
      });

      const result = await response.json();

      if (result.message !== 'success' || !result.data) {
        throw new Error(`刷新 Access Token 失败: ${JSON.stringify(result)}`);
      }

      const data = result.data as AccessTokenResponse;
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token || null;
      this.tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000;

      console.log('成功刷新 Access Token');
      return this.accessToken;
    } catch (error) {
      console.error('刷新 Access Token 错误:', error);
      throw error;
    }
  }

  /**
   * 验证签名
   */
  verifySign(body: string, sign: string): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.config.appSecret);
    hmac.update(body);
    const calculatedSign = hmac.digest('hex');
    return calculatedSign === sign;
  }

  /**
   * 清除 token（用于测试或重新认证）
   */
  clearToken(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpireTime = 0;
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    return !!(this.config.appId && this.config.appSecret);
  }
}

export default DouyinAuthService;
