import { generateSignatureHeaders } from './tencentSignature';

const SECRET_ID = import.meta.env.VITE_TENCENT_SECRET_ID || '';
const SECRET_KEY = import.meta.env.VITE_TENCENT_SECRET_KEY || '';
const APP_BIZ_ID = import.meta.env.VITE_APP_BIZ_ID || '';
const REGION = import.meta.env.VITE_TENCENT_REGION || 'ap-guangzhou';
const API_HOST = 'lke.tencentcloudapi.com';
const API_VERSION = '2023-11-30';

const isDev = import.meta.env.DEV;
const API_BASE = isDev ? '/tencent-api' : `https://${API_HOST}`;

interface WorkflowResponse {
  Response: {
    WorkflowRunId: string;
    RequestId: string;
    Error?: {
      Code: string;
      Message: string;
    };
  };
}

interface OutcomeResponse {
  Response: {
    Status: string;
    Outcome: string;
    Error?: {
      Code: string;
      Message: string;
    };
  };
}

export async function callAgent(query: string): Promise<string> {
  try {
    if (!SECRET_ID || !SECRET_KEY || !APP_BIZ_ID) {
      throw new Error('缺失必要的腾讯云配置 (SECRET_ID, SECRET_KEY, APP_BIZ_ID)');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      AppBizId: APP_BIZ_ID,
      RunEnv: 0,
      Query: query,
      VisitorId: `user-${Date.now().toString().slice(-6)}`
    };

    const headers = await generateSignatureHeaders({
      secretId: SECRET_ID,
      secretKey: SECRET_KEY,
      region: REGION,
      action: 'CreateWorkflowRun',
      version: API_VERSION,
      service: 'lke',
      payload,
      timestamp
    });

    const response = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'X-TC-Action': 'CreateWorkflowRun',
        'X-TC-Version': API_VERSION,
        'X-TC-Region': REGION
      },
      body: JSON.stringify(payload)
    });

    const data: WorkflowResponse = await response.json();
    if (data.Response.Error) throw new Error(data.Response.Error.Message);
    const workflowRunId = data.Response.WorkflowRunId;
    if (!workflowRunId) throw new Error('未获取到 WorkflowRunId');

    return await pollWorkflowOutcome(workflowRunId);
  } catch (error) {
    console.error('❌ 调用智能体失败:', error);
    return `[服务调用异常] ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function pollWorkflowOutcome(workflowRunId: string, retryCount = 0): Promise<string> {
  if (retryCount > 15) return '抱歉，AI 响应超时，请稍后重试。';
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = { AppBizId: APP_BIZ_ID, WorkflowRunId: workflowRunId };
  const headers = await generateSignatureHeaders({
    secretId: SECRET_ID, secretKey: SECRET_KEY, region: REGION,
    action: 'GetWorkflowRunOutcome', version: API_VERSION, service: 'lke',
    payload, timestamp
  });

  const response = await fetch(`${API_BASE}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', 'X-TC-Action': 'GetWorkflowRunOutcome', 'X-TC-Version': API_VERSION, 'X-TC-Region': REGION },
    body: JSON.stringify(payload)
  });

  const data: OutcomeResponse = await response.json();
  if (data.Status === 'SUCCESS') return data.Outcome;
  if (data.Status === 'FAIL') return '失败';
  await new Promise(resolve => setTimeout(resolve, 2000));
  return pollWorkflowOutcome(workflowRunId, retryCount + 1);
}
