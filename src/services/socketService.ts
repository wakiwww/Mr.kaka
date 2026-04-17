import { io, Socket } from 'socket.io-client';
import { getWsToken } from './workflowApi';

export interface ChatMessage {
  content: string;
  isFromSelf: boolean;
  recordId?: string;
  isFinal?: boolean;
}

export interface ChatEventHandlers {
  onReply?: (message: ChatMessage) => void;
  onThought?: (content: string, title?: string) => void;
  onError?: (error: any) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected') => void;
}

class SocketService {
  private socket: Socket | null = null;
  private currentSessionId: string = '';
  private handlers: ChatEventHandlers = {};

  constructor() {
    this.currentSessionId = `session-${Date.now()}`;
  }

  /**
   * 初始化并建立连接
   */
  async connect(handlers: ChatEventHandlers) {
    this.handlers = handlers;
    
    try {
      this.handlers.onStatusChange?.('connecting');
      console.log('🌐 正在获取 WebSocket Token...');
      
      // 1. 获取一次性 Token
      const token = await getWsToken();
      console.log('🔑 已获取 Token:', token.slice(0, 10) + '...');

      // 2. 创建 Socket.IO 连接
      // 腾讯云 LKE 要求在 auth 对象中传递 token
      this.socket = io('wss://wss.lke.cloud.tencent.com', {
        path: '/v1/qbot/chat/conn/',
        transports: ['websocket'],
        query: {
          EIO: '4',
          transport: 'websocket'
        },
        auth: {
          token: token
        },
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 10000
      });

      // 3. 注册 Socket.IO 事件
      this.socket.on('connect', () => {
        console.log('✅ WebSocket 物理连接成功, SID:', this.socket?.id);
        this.handlers.onStatusChange?.('connected');
      });

      this.socket.on('connect_error', (err) => {
        console.error('❌ WebSocket 连接错误:', err.message);
        this.handlers.onError?.(err);
        this.handlers.onStatusChange?.('disconnected');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket 已断开:', reason);
        this.handlers.onStatusChange?.('disconnected');
      });

      // 监听 LKE 业务事件
      this.socket.on('reply', (data: any) => {
        console.log('📩 收到回复事件, 完整数据:', data);
        const payload = data.payload || data;
        const message: ChatMessage = {
          content: payload.content || '',
          isFromSelf: payload.is_from_self || false,
          recordId: payload.record_id,
          isFinal: payload.is_final
        };
        this.handlers.onReply?.(message);
      });

      this.socket.on('thought', (data: any) => {
        console.log('🧠 收到思考事件');
        const payload = data.payload || data;
        const debugging = payload.procedures?.[0]?.debugging;
        if (debugging?.content) {
          this.handlers.onThought?.(debugging.content, payload.procedures[0].title);
        }
      });

      this.socket.on('error', (err: any) => {
        console.error('⚠️ 业务逻辑错误:', err);
        this.handlers.onError?.(err);
      });

      // 建立连接
      this.socket.connect();

    } catch (error) {
      console.error('❌ 初始化 WebSocket 失败:', error);
      this.handlers.onStatusChange?.('disconnected');
      this.handlers.onError?.(error);
    }
  }

  /**
   * 发送消息
   */
  sendMessage(content: string) {
    if (!this.socket?.connected) {
      console.warn('⚠️ 尝试发送消息但连接已断开，正在尝试重新发送...');
      throw new Error('WebSocket 未连接');
    }

    const payload = {
      content,
      session_id: this.currentSessionId,
      request_id: `req-${Date.now()}`,
      incremental: true,
      stream: 'enable'
    };

    console.log('📤 发送消息:', content);
    this.socket.emit('send', { payload });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
