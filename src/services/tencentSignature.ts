/**
 * 腾讯云 API 3.0 签名工具 (TC3-HMAC-SHA256) - 极简稳定版
 */

const encoder = new TextEncoder();

async function hmacSha256(key: Uint8Array | ArrayBuffer, message: string | Uint8Array): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = typeof message === 'string' ? encoder.encode(message) : message;
  return await crypto.subtle.sign('HMAC', cryptoKey, data);
}

async function sha256Hex(message: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(message));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function getLocalDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
}

/**
 * 生成签名
 * 采用极简 Header 签名策略：仅签名 content-type 和 host，以获得最高兼容性
 */
export async function generateSignatureHeaders(params: {
  secretId: string;
  secretKey: string;
  region: string;
  action: string;
  version: string;
  service: string;
  payload: string; // 传入已经序列化并排好序的 JSON 字符串
  timestamp: number;
}) {
  const { secretId, secretKey, service, payload, timestamp } = params;
  const date = getLocalDate(timestamp);
  
  // 1. 规范请求串 (CanonicalRequest)
  // 极简策略仅签名这两个必填项
  const contentType = 'application/json; charset=utf-8';
  const host = `${service}.tencentcloudapi.com`;
  
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const signedHeaders = 'content-type;host';
  const hashedPayload = await sha256Hex(payload);
  
  const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${hashedPayload}`;

  // 2. 待签名字符串 (StringToSign)
  const credentialScope = `${date}/${service}/tc3_request`;
  const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
  const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

  // 3. 计算签名
  const kDate = await hmacSha256(encoder.encode(`TC3${secretKey}`), date);
  const kService = await hmacSha256(kDate, service);
  const kSigning = await hmacSha256(kService, 'tc3_request');
  const signature = Array.from(new Uint8Array(await hmacSha256(kSigning, stringToSign)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // 4. 构建头部
  const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    Authorization: authorization,
    'X-TC-Timestamp': timestamp.toString()
  };
}
