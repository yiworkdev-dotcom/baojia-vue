import { ref, onMounted, onUnmounted } from 'vue';
import auditWebSocketManager from '/@/utils/auditWebSocket';

/**
 * 审核通知WebSocket Hook
 * 用于在组件中监听审核通知消息
 */
export function useAuditWebSocket() {
  const isConnected = ref(false);
  const messages = ref<any[]>([]);
  const handlerKey = ref<string>('');
  const audioEnabled = ref(true);
  const audioVolume = ref(0.8);

  // 消息处理器
  const handleMessage = (data: any) => {
    console.log('📨 [useAuditWebSocket] 收到审核通知:', data);
    console.log('📨 [useAuditWebSocket] 消息类型:', typeof data);
    console.log('📨 [useAuditWebSocket] 消息是否为字符串:', typeof data === 'string');
    
    // 如果是连接恢复消息
    if (data && data.type === 'connection_restored') {
      console.log('📨 [useAuditWebSocket] 收到连接恢复消息');
      isConnected.value = true;
      return;
    }

    // 添加消息到列表
    const newMessage = {
      id: Date.now() + Math.random(),
      data: data,
      timestamp: new Date().toLocaleString()
    };
    
    console.log('📨 [useAuditWebSocket] 添加新消息到列表:', newMessage);
    messages.value.unshift(newMessage);
    console.log('📨 [useAuditWebSocket] 当前消息数量:', messages.value.length);

    // 限制消息数量，避免内存溢出
    if (messages.value.length > 100) {
      messages.value = messages.value.slice(0, 100);
      console.log('📨 [useAuditWebSocket] 消息列表已清理，保留最新100条');
    }
  };

  // 初始化WebSocket连接
  const initConnection = () => {
    // 生成唯一的处理器key
    handlerKey.value = `audit_handler_${Date.now()}_${Math.random()}`;
    
    // 注册消息处理器
    auditWebSocketManager.registerHandler(handlerKey.value, handleMessage);
    
    // 检查连接状态
    isConnected.value = auditWebSocketManager.isConnected();
    
    console.log('[useAuditWebSocket] 已注册审核通知处理器');
  };

  // 发送消息
  const sendMessage = (message: any) => {
    console.log('📤 [useAuditWebSocket] 发送消息:', message);
    console.log('📤 [useAuditWebSocket] 消息类型:', typeof message);
    auditWebSocketManager.sendMessage(message);
  };

  // 获取连接状态
  const getConnectionState = () => {
    return auditWebSocketManager.getConnectionState();
  };

  // 获取详细连接信息
  const getConnectionInfo = () => {
    return auditWebSocketManager.getConnectionInfo();
  };

  // 音频控制方法
  const setAudioEnabled = (enabled: boolean) => {
    audioEnabled.value = enabled;
    auditWebSocketManager.setAudioEnabled(enabled);
  };

  const setAudioVolume = (volume: number) => {
    audioVolume.value = volume;
    auditWebSocketManager.setAudioVolume(volume);
  };

  const playAudio = () => {
    auditWebSocketManager.playAudio();
  };

  // 组件挂载时初始化
  onMounted(() => {
    initConnection();
    // 初始化音频设置
    audioEnabled.value = auditWebSocketManager.getAudioEnabled();
  });

  // 组件卸载时清理
  onUnmounted(() => {
    if (handlerKey.value) {
      auditWebSocketManager.unregisterHandler(handlerKey.value);
      console.log('[useAuditWebSocket] 已清理审核通知处理器');
    }
  });

  return {
    isConnected,
    messages,
    sendMessage,
    getConnectionState,
    getConnectionInfo,
    initConnection,
    // 音频控制
    audioEnabled,
    audioVolume,
    setAudioEnabled,
    setAudioVolume,
    playAudio,
  };
}
