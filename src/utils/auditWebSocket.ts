// 音频文件路径 - 使用完整URL避免路由拦截
const audioBeep = `${window.location.origin}/12720.wav`;
// 音频播放器类
class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private unlocked: boolean = false;
  private ready: boolean = false;
  private pendingPlay: boolean = false;

  constructor() {
    this.initAudio();
    this.setupUnlockByUserGesture();
  }

  private initAudio() {
    try {
      this.audio = new Audio(audioBeep);
      this.audio.preload = 'auto';
      this.audio.volume = 1;
      this.audio.muted = false;
      // 尽早触发加载，提升首播成功率
      try {
        this.audio.load();
      } catch {}
      this.audio.addEventListener('canplaythrough', () => {
        this.ready = true;
      }, { once: true });
    } catch (error) {
      console.warn('音频文件初始化失败:', error);
    }
  }

  // 公共方法：尝试解锁音频
  public async tryUnlock(): Promise<boolean> {
    // 先尝试自动解锁
    const autoUnlockSuccess = await this.tryAutoUnlock();
    if (autoUnlockSuccess) {
      return true;
    }
    
    // 如果自动解锁失败，设置用户手势监听
    this.setupUnlockByUserGesture();
    return false;
  }

  // 公共方法：检查是否已解锁
  public isUnlocked(): boolean {
    return this.unlocked;
  }

  // 尝试自动解锁音频播放
  private async tryAutoUnlock() {
    if (!this.audio || this.unlocked) return;
    
    console.log('🎵 [AudioPlayer] 尝试自动解锁音频播放...');
    const prevVolume = this.audio.volume;
    this.audio.volume = 0; // 静音播放用于解锁
    
    try {
      await this.audio.play();
      this.audio.pause();
      this.audio.currentTime = 0;
      this.unlocked = true;
      this.audio.volume = 1;
      console.log('🎵 [AudioPlayer] 自动解锁成功，音量设置为:', this.audio.volume);
      
      // 如果有待播放请求，立即播放一次
      if (this.pendingPlay) {
        this.pendingPlay = false;
        this.play();
      }
      return true;
    } catch (e) {
      console.log('🎵 [AudioPlayer] 自动解锁失败，需要用户手势:', e);
      this.audio.volume = prevVolume;
      return false;
    }
  }

  // 通过一次用户手势解锁自动播放策略
  private setupUnlockByUserGesture() {
    if (typeof window === 'undefined') return;
    const tryUnlock = async () => {
      if (!this.audio || this.unlocked) return;
      const prevVolume = this.audio.volume;
      this.audio.volume = 0; // 静音播放用于解锁
      try {
        await this.audio.play();
        this.audio.pause();
        this.audio.currentTime = 0;
        this.unlocked = true;
        // 确保音量恢复到1，而不是之前的音量（可能是0）
        this.audio.volume = 1;
        // 解锁后移除事件监听
        window.removeEventListener('click', tryUnlock);
        window.removeEventListener('keydown', tryUnlock);
        window.removeEventListener('touchstart', tryUnlock);
        console.log('🎵 [AudioPlayer] 已通过用户手势解锁音频播放，音量设置为:', this.audio.volume);
        // 如果有待播放请求，立即播放一次
        if (this.pendingPlay) {
          this.pendingPlay = false;
          this.play();
        }
      } catch (e) {
        // 未成功解锁时保持监听，等待下一次用户手势
        this.audio.volume = prevVolume;
      }
    };
    window.addEventListener('click', tryUnlock, { once: false });
    window.addEventListener('keydown', tryUnlock, { once: false });
    window.addEventListener('touchstart', tryUnlock, { once: false });
  }

  // 播放音频
  async play() {
    console.log('🎵 [AudioPlayer] 尝试播放音频...');
    console.log('🎵 [AudioPlayer] 音频启用状态:', this.isEnabled);
    console.log('🎵 [AudioPlayer] 音频对象存在:', !!this.audio);
    console.log('🎵 [AudioPlayer] 是否已解锁:', this.unlocked);
    
    if (!this.isEnabled) {
      console.log('🎵 [AudioPlayer] 音频已禁用，跳过播放');
      return;
    }
    
    if (!this.audio) {
      console.log('🎵 [AudioPlayer] 音频对象不存在，跳过播放');
      return;
    }

    if (!this.unlocked) {
      console.log('🎵 [AudioPlayer] 尚未解锁，尝试自动解锁...');
      const unlockSuccess = await this.tryAutoUnlock();
      if (!unlockSuccess) {
        console.log('🎵 [AudioPlayer] 自动解锁失败，标记待播放并返回');
        this.pendingPlay = true;
        return;
      }
    }

    try {
      console.log('🎵 [AudioPlayer] 重置音频到开始位置');
      this.audio.currentTime = 0;
      console.log('🎵 [AudioPlayer] 当前音量:', this.audio.volume);
      console.log('🎵 [AudioPlayer] 音频源:', this.audio.src);
      
      // 确保音量不为0
      if (this.audio.volume === 0) {
        console.log('🎵 [AudioPlayer] 检测到音量为0，设置为1');
        this.audio.volume = 1;
      }
      
      if (!this.ready) {
        try { this.audio.load(); } catch {}
      }
      
      await this.audio.play();
      console.log('🎵 [AudioPlayer] 音频播放成功，最终音量:', this.audio.volume);
    } catch (error) {
      console.warn('🎵 [AudioPlayer] 音频播放失败:', error);
      console.warn('🎵 [AudioPlayer] 错误详情:', error instanceof Error ? error.message : String(error));
    }
  }

  // 设置音频是否启用
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // 获取音频是否启用
  getEnabled(): boolean {
    return this.isEnabled;
  }

  // 设置音量
  setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // 销毁音频
  destroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }
}

// 审核通知WebSocket管理器
class AuditWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private audioPlayer: AudioPlayer;

  constructor() {
    // 初始化音频播放器
    this.audioPlayer = new AudioPlayer();
    // 尝试解锁音频播放
    this.audioPlayer.tryUnlock();
    
    // 添加页面可见性变化监听，当页面重新可见时尝试解锁音频
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.audioPlayer.isUnlocked()) {
        console.log('🎵 [AudioPlayer] 页面重新可见，尝试解锁音频');
        this.audioPlayer.tryUnlock();
      }
    });
    
    // 延迟检查音频解锁状态，如果未解锁则显示提示
    setTimeout(() => {
      if (!this.audioPlayer.isUnlocked()) {
        this.showAudioUnlockPrompt();
      }
    }, 2000);
    
    // 页面刷新时检查是否需要重连
    this.checkAndReconnect();
  }

  private checkAndReconnect() {
    const savedToken = localStorage.getItem('ws_token');
    if (savedToken && !this.isInitialized) {
      console.log('🔌 [审核通知WebSocket] 页面刷新检测到保存的token，尝试重连...');
      this.initWebSocket(savedToken);
    } else if (this.isInitialized) {
      console.log('🔌 [审核通知WebSocket] 已初始化，跳过自动重连');
    }
  }

  // 初始化WebSocket连接
  initWebSocket(token: string) {
    // 增强保护机制：检查是否已经初始化或正在连接
    if (this.isInitialized && this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      console.log('🔌 [审核通知WebSocket] 连接已存在或正在连接中，跳过重复初始化');
      return;
    }
  
    // 如果存在旧连接，先关闭
    if (this.ws) {
      console.log('🔌 [审核通知WebSocket] 关闭旧连接');
      this.ws.close();
      this.ws = null;
    }
  
    // 保存token到localStorage，用于页面刷新时重连
    localStorage.setItem('ws_token', token);
    this.isInitialized = true;
  
    try {
      const scheme = (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') ? 'wss' : 'ws';
      const wsUrl = `${scheme}://localhost:8080/jeecg-boot/ws/auditNotice?X-Access-Token=${token}`;
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ [审核通知WebSocket] 连接成功！');
        this.reconnectAttempts = 0;
        this.clearReconnectTimer();
        
        // 重连成功后，通知所有处理器连接已恢复
        this.messageHandlers.forEach((handler) => {
          try {
            handler({ type: 'connection_restored' });
          } catch (error) {
            console.error('[审核通知WebSocket] 通知处理器连接恢复失败:', error);
          }
        });
      };
      
      this.ws.onmessage = (event) => {
        try {
          console.log('🔔 [审核通知WebSocket] 收到原始消息:', event.data);
          const parsedData = JSON.parse(event.data);
          
          // 播放音频通知
          this.audioPlayer.play();
          
          // 通知所有注册的处理器
          this.messageHandlers.forEach((handler) => {
            try {
              handler(parsedData);
            } catch (error) {
              console.error('[审核通知WebSocket] 处理器执行失败:', error);
            }
          });
        } catch (error) {
          console.error('[审核通知WebSocket] 处理消息失败:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('❌ [审核通知WebSocket] 连接关闭，尝试重连...');
        this.scheduleReconnect(token);
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ [审核通知WebSocket] 连接错误:', error);
      };
      
    } catch (error) {
      console.error('[审核通知WebSocket] 初始化失败:', error);
    }
  }

  // 注册消息处理器
  registerHandler(key: string, handler: (data: any) => void) {
    this.messageHandlers.set(key, handler);
  }

  // 移除消息处理器
  unregisterHandler(key: string) {
    this.messageHandlers.delete(key);
  }

  // 发送消息
  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const data = typeof message === 'string' ? message : JSON.stringify(message);
        this.ws.send(data);
      } catch (error) {
        console.error('[审核通知WebSocket] 发送消息失败:', error);
      }
    }
  }

  // 关闭连接
  close() {
    this.isInitialized = false;
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // 销毁音频播放器
    this.audioPlayer.destroy();
    
    // 清除保存的token
    localStorage.removeItem('ws_token');
  }

  // 获取连接状态
  getConnectionState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  // 是否已连接
  isConnected(): boolean {
    return this.ws ? this.ws.readyState === WebSocket.OPEN : false;
  }

  // 显示音频解锁提示
  private showAudioUnlockPrompt() {
    // 检查是否已经显示过提示
    if (localStorage.getItem('audio_unlock_prompt_shown') === 'true') {
      return;
    }
    
    // 创建提示元素
    const prompt = document.createElement('div');
    prompt.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1890ff;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-size: 14px;
      max-width: 300px;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    prompt.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>🔊</span>
        <span>点击启用音频通知</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; margin-left: 8px;">×</button>
      </div>
    `;
    
    // 点击提示时尝试解锁音频
    prompt.addEventListener('click', () => {
      this.audioPlayer.tryUnlock();
      prompt.remove();
      localStorage.setItem('audio_unlock_prompt_shown', 'true');
      console.log('🎵 [AudioPlayer] 用户点击了音频解锁提示');
    });
    
    document.body.appendChild(prompt);
    console.log('🎵 [AudioPlayer] 显示音频解锁提示');
    
    // 5秒后自动移除提示
    setTimeout(() => {
      if (prompt.parentElement) {
        prompt.remove();
      }
    }, 5000);
  }

  // 获取WebSocket对象（用于调试）
  getWebSocket() {
    return this.ws;
  }

  // 获取详细连接信息
  getConnectionInfo() {
    const state = this.getConnectionState();
    const stateText = this.getStateText(state);
    return {
      state: stateText,
      readyState: state,
      url: this.ws ? this.ws.url : null,
      isInitialized: this.isInitialized,
      reconnectAttempts: this.reconnectAttempts,
      handlerCount: this.messageHandlers.size
    };
  }

  // 获取状态文本
  private getStateText(readyState: number): string {
    switch (readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'DISCONNECTED';
      default:
        return 'UNKNOWN';
    }
  }

  // 安排重连
  private scheduleReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[审核通知WebSocket] 达到最大重连次数，停止重连');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // 指数退避，最大30秒
    
    console.log(`[审核通知WebSocket] ${delay}ms后尝试第${this.reconnectAttempts}次重连...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.initWebSocket(token);
    }, delay);
  }

  // 清除重连定时器
  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // 音频控制方法
  // 设置音频是否启用
  setAudioEnabled(enabled: boolean) {
    this.audioPlayer.setEnabled(enabled);
  }

  // 获取音频是否启用
  getAudioEnabled(): boolean {
    return this.audioPlayer.getEnabled();
  }

  // 设置音频音量
  setAudioVolume(volume: number) {
    this.audioPlayer.setVolume(volume);
  }

  // 手动播放音频
  playAudio() {
    this.audioPlayer.play();
  }
}

// 创建单例实例
const auditWebSocketManager = new AuditWebSocketManager();

export default auditWebSocketManager;
