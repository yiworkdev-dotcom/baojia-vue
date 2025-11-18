// WebSocket管理器
class WebSocketManager {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private currentToken: string | null = null; // 保存当前token
  private isInitialized = false; // 标记是否已初始化

  constructor() {
    // 页面加载时检查是否需要自动重连
    this.checkAndReconnect();
  }

  // 检查并重连
  private checkAndReconnect() {
    // 检查localStorage中是否有保存的token
    const savedToken = localStorage.getItem('ws_token');
    if (savedToken && !this.isInitialized) {
      console.log('[WebSocket管理器] 检测到页面刷新，尝试自动重连...');
      this.initWebSocket(savedToken);
    }
  }

  // 初始化WebSocket连接
  initWebSocket(token: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
  
    // 保存token到localStorage，用于页面刷新时重连
    this.currentToken = token;
    localStorage.setItem('ws_token', token);
    this.isInitialized = true;
  
    try {
      const wsUrl = `ws://localhost:8080jeecg-boot/ws/chat?X-Access-Token=${token}`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = (event) => {
        console.log('[WebSocket管理器] 连接成功');
        this.reconnectAttempts = 0;
        this.clearReconnectTimer();
        
        // 重连成功后，通知所有处理器连接已恢复
        this.messageHandlers.forEach((handler, key) => {
          try {
            handler({ type: 'connection_restored' });
          } catch (error) {
            console.error(`[WebSocket管理器] 通知处理器 ${key} 连接恢复失败:`, error);
          }
        });
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = event.data;
          // 通知所有注册的处理器
          this.messageHandlers.forEach((handler, key) => {
            try {
              handler(data);
            } catch (error) {
              console.error(`[WebSocket管理器] 处理器 ${key} 执行失败:`, error);
            }
          });
        } catch (error) {
          console.error('[WebSocket管理器] 解析消息失败:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('[WebSocket管理器] 连接关闭，尝试重连...');
        this.scheduleReconnect(token);
      };
      
      this.ws.onerror = (event) => {
        console.error('[WebSocket管理器] 连接错误:', event);
      };
      
    } catch (error) {
      console.error('[WebSocket管理器] 初始化失败:', error);
    }
  }

  // 注册消息处理器
  registerHandler(key: string, handler: (data: any) => void) {
    this.messageHandlers.set(key, handler);
  }

  // 注销消息处理器
  unregisterHandler(key: string) {
    this.messageHandlers.delete(key);
  }

  // 发送消息
  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // 如果已经是字符串，直接发送；否则进行JSON序列化
      const messageToSend = typeof message === 'string' ? message : JSON.stringify(message);
      this.ws.send(messageToSend);
    } else {
      console.warn('[WebSocket管理器] WebSocket未连接，无法发送消息');
    }
  }

  // 获取连接状态
  getConnectionState() {
    if (!this.ws) return 'CLOSED';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }

  // 关闭连接
  close() {
    this.clearReconnectTimer();
  }
  
  // 添加一个只关闭当前页面处理器的方法
  closePageHandler(key: string) {
    this.messageHandlers.delete(key);
  }

  // 安排重连
  private scheduleReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket管理器] 重连次数已达上限，停止重连');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WebSocket管理器] 第${this.reconnectAttempts}次重连尝试，${this.reconnectInterval}ms后执行`);
    this.reconnectTimer = setTimeout(() => {
      this.initWebSocket(token);
    }, this.reconnectInterval);
  }

  // 清除重连定时器
  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// 创建全局实例
export const wsManager = new WebSocketManager();

// 导出类型
export interface WebSocketMessage {
  type: string;
  sessionId?: string;
  senderId?: string;
  receiverId?: string;
  content?: string;
  id?: string;
  createdAt?: string;
}
