import { generateSignatureHeaders } from './tencentSignature';

// 腾讯云智能体相关配置
const SECRET_ID = import.meta.env.VITE_TENCENT_SECRET_ID || '';
const SECRET_KEY = import.meta.env.VITE_TENCENT_SECRET_KEY || '';
const APP_KEY = import.meta.env.VITE_TENCENT_APP_KEY || '';
const REGION = import.meta.env.VITE_TENCENT_REGION || 'ap-guangzhou';
const API_HOST = 'lke.tencentcloudapi.com';
const API_VERSION = '2023-11-30';

// 开发环境使用代理路径解决跨域问题
const isDev = import.meta.env.DEV;
const API_BASE = isDev ? '/tencent-api' : `https://${API_HOST}`;

interface WsTokenResponse {
  Response: {
    Token: string;
    RequestId: string;
    Error?: {
      Code: string;
      Message: string;
    };
  };
}

/**
 * 获取 WebSocket 建立连接所需的 Token
 */
export async function getWsToken(visitorId?: string): Promise<string> {
  try {
    if (!SECRET_ID || !SECRET_KEY || !APP_KEY) {
      throw new Error('缺失必要的腾讯云配置 (SECRET_ID, SECRET_KEY, APP_KEY)');
    }

    // 1. 构造 JSON Payload 并手动排序 Key (按照字母序: BotAppKey, Type, VisitorBizId)
    // 这确保了生成的 JSON 字符串在不同环境下始终一致
    const payloadObject = {
      BotAppKey: APP_KEY,
      Type: 5,
      VisitorBizId: visitorId || `user-${Date.now().toString().slice(-6)}`
    };
    const payloadStr = JSON.stringify(payloadObject);

    const timestamp = Math.floor(Date.now() / 1000);
    
    // 2. 生成签名部
    const sigHeaders = await generateSignatureHeaders({
      secretId: SECRET_ID,
      secretKey: SECRET_KEY,
      region: REGION,
      action: 'GetWsToken',
      version: API_VERSION,
      service: 'lke',
      payload: payloadStr,
      timestamp
    });

    // 3. 执行请求
    // 采用与签名中完全一致的 Content-Type
    const response = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: {
        'Authorization': sigHeaders.Authorization,
        'Content-Type': 'application/json; charset=utf-8',
        'X-TC-Action': 'GetWsToken',
        'X-TC-Version': API_VERSION,
        'X-TC-Region': REGION,
        'X-TC-Timestamp': timestamp.toString(),
      },
      body: payloadStr
    });

    const data: WsTokenResponse = await response.json();
    
    if (data.Response.Error) {
      throw new Error(`GetWsToken Error: ${data.Response.Error.Message} (${data.Response.Error.Code})`);
    }

    return data.Response.Token;

  } catch (error) {
    console.error('❌ 获取 WebSocket Token 失败:', error);
    throw error;
  }
}

// 别名与 legacy 支持
export { callAgent } from './workflowApi_legacy';
