<template>
  <div class="chat-room-container">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <a-button type="text" @click="goBack" class="back-btn">
        <template #icon>
          <ArrowLeftOutlined />
        </template>
        返回
      </a-button>
      <div class="chat-title">
        <span v-if="userRealname">{{ userRealname }}</span>
        <span v-else class="text-gray-400">加载中...</span>
      </div>
      <div class="chat-status">
        <a-tag :color="sessionStatus === 1 ? 'processing' : 'default'">
          {{ sessionStatus === 1 ? '进行中' : '已结束' }}
        </a-tag>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="loading" class="loading-container">
        <a-spin size="large" />
        <div class="loading-text">加载历史消息中...</div>
      </div>
      
      <div v-else-if="allMessages.length === 0" class="empty-container">
        <a-empty description="暂无消息" />
      </div>
      
      <div v-else class="messages-list">
        <div
          v-for="message in allMessages"
          :key="`${message.id}-${messageListKey}`"
          class="message-item"
          :class="{ 'message-right': isMyMessage(message) }"
        >
          <div class="message-content">
            <div class="message-text">{{ getMessageContent(message) }}</div>
            <div class="message-time">{{ formatTime(message.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input" v-if="sessionStatus == 1">
      <div class="input-container">
        <a-textarea
          v-model:value="inputMessage"
          placeholder="请输入消息..."
          :auto-size="{ minRows: 6, maxRows: 6 }"
          @keydown.enter.prevent="handleSendMessage"
          class="message-input"
        />
        <a-button
          type="primary"
          @click="handleSendMessage"
          :disabled="!inputMessage.trim()"
          class="send-btn"
        >
          发送
        </a-button>
      </div>
    </div>

    <!-- 已结束会话提示 -->
    <div v-else class="session-ended">
      <a-alert
        message="会话已结束"
        description="此会话已结束，无法发送新消息"
        type="info"
        show-icon
      />
    </div>
  </div>
</template>

<script lang="ts" name="dw.chat-dwChatRoom" setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { getHistory } from './DwChatMessage.api';
import { list } from './DwChatSession.api';
import { defHttp } from '/@/utils/http/axios';
import { useUserStore } from '/@/store/modules/user';
import dayjs from 'dayjs';
import { wsManager, type WebSocketMessage } from '/@/utils/websocket';
import { getToken } from '/@/utils/auth';

// 定义消息类型
interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const currentUserId = userStore.getUserInfo.id;

// 响应式数据 - 分离历史消息和实时消息
const historyMessages = ref<ChatMessage[]>([]); // 历史消息
const realtimeMessages = ref<ChatMessage[]>([]); // 实时消息
const loading = ref(false);
const inputMessage = ref('');
const userRealname = ref('');
const sessionStatus = ref(1);
const messagesContainer = ref<HTMLElement>();

// 添加一个强制更新的key
const messageListKey = ref(0);

// 计算属性 - 合并所有消息并按时间排序
const allMessages = computed(() => {
  const combined = [...historyMessages.value, ...realtimeMessages.value];
  return combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
});

// 监听allMessages变化，立即滚动到底部
watch(allMessages, () => {
  messageListKey.value++;
  // 立即滚动到底部，体现实时性
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

// 计算属性
const sessionId = computed(() => route.query.sessionId as string);
const userId = computed(() => route.query.userId as string);

// 判断是否是我的消息
const isMyMessage = (msg: ChatMessage) => {
  // 确保两个值都转换为字符串进行比较，避免类型不一致问题
  return String(msg.senderId) === String(currentUserId);
};

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('HH:mm:ss');
};

// 获取用户真实姓名
const fetchUserRealname = async (userId: string) => {
  try {
    const data = await defHttp.get<any>({
      url: '/sys/user/queryByIds',
      params: { userIds: userId },
    });
    const list = Array.isArray(data) ? data : data?.records || [];
    if (list.length > 0) {
      return list[0].realname || list[0].username || '未知用户';
    }
    return '未知用户';
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return '未知用户';
  }
};

// 获取历史消息
const getHistoryMessages = async () => {
  if (!sessionId.value) {
    message.error('会话ID不存在');
    return;
  }

  try {
    loading.value = true;
    const res = await getHistory(sessionId.value);
    historyMessages.value = res || [];
  } catch (error) {
    console.error('获取历史消息失败:', error);
    message.error('获取历史消息失败');
  } finally {
    loading.value = false;
  }
};

// 获取会话状态
const fetchSessionStatus = async () => {
  if (!sessionId.value) return;
  
  try {
    // 从会话列表中获取当前会话的状态
    const res = await list({ id: sessionId.value });
    if (res && res.records && res.records.length > 0) {
      sessionStatus.value = res.records[0].status;
      }
  } catch (error) {
    console.error('获取会话状态失败:', error);
    // 如果获取失败，保持默认状态（进行中）
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 发送消息
const handleSendMessage = async () => {
  if (!inputMessage.value.trim()) return;
  
  const messageContent = inputMessage.value;
  inputMessage.value = '';
  
  // 创建消息对象
  const newMessage: ChatMessage = {
    id: `send_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sessionId: sessionId.value,
    senderId: currentUserId.toString(),
    receiverId: userId.value,
    content: messageContent,
    createdAt: new Date().toISOString(),
  };
  
  // 立即添加到实时消息列表，立即渲染
  realtimeMessages.value.push(newMessage);
  
  // 通过WebSocket发送消息 - 直接发送字符串内容
  wsManager.sendMessage(messageContent);
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};

// WebSocket消息处理 - 接收消息立即渲染
const handleWebSocketMessage = (data: any) => {
  data = JSON.parse(data);
  
  // 处理新的消息格式：包含 senderId, content, timestamp
  if (data.senderId && data.content && data.timestamp) {
    const newMessage: ChatMessage = {
      id: `receive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: sessionId.value,
      senderId: data.senderId,
      receiverId: currentUserId.toString(),
      content: data.content,
      createdAt: new Date(data.timestamp).toISOString(),
    };

    // 立即添加到实时消息列表，立即渲染
    realtimeMessages.value.push(newMessage);
  } 
  // 保留原有的消息格式兼容性
  else if (data.type === 'new_message' && data.sessionId === sessionId.value) {
    const newMessage: ChatMessage = {
      id: data.id || `receive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: data.sessionId || '',
      senderId: data.senderId || '',
      receiverId: data.receiverId || '',
      content: data.content || '',
      createdAt: data.createdAt || new Date().toISOString(),
    };

    // 立即添加到实时消息列表，立即渲染
    realtimeMessages.value.push(newMessage);
  }
};

// 清空实时消息（用于重新加载历史消息时）
const clearRealtimeMessages = () => {
  realtimeMessages.value = [];
};

// 在script部分添加一个函数来提取消息内容
const getMessageContent = (message: ChatMessage) => {
  try {
    // 如果content是JSON字符串，尝试解析并提取content字段
    const parsed = JSON.parse(message.content);
    if (parsed.content) {
      return parsed.content;
    }
  } catch (error) {
    // 如果不是JSON，直接返回原内容
  }
  return message.content;
};

onMounted(async () => {
  // 清空实时消息
  clearRealtimeMessages();
  
  // 检查WebSocket连接状态，如果未连接则尝试重连
  if (wsManager.getConnectionState() !== 'OPEN') {
    const token = getToken();
    if (token) {
      console.log('[聊天房间] WebSocket未连接，尝试重连...');
      wsManager.initWebSocket(token);
    }
  }
  
  // 获取会话状态
  await fetchSessionStatus();
  
  // 获取用户真实姓名
  if (userId.value) {
    userRealname.value = await fetchUserRealname(userId.value);
  }
  
  // 获取历史消息
  await getHistoryMessages();
  
  // 注册WebSocket消息处理器
  wsManager.registerHandler('chatRoom', handleWebSocketMessage);
});

onUnmounted(() => {
  // 注销WebSocket消息处理器
  // 关闭WebSocket连接
  wsManager.close();
  wsManager.unregisterHandler('chatRoom');
});
</script>

<style lang="less" scoped>
.chat-room-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 115px);
  background-color: #f5f5f5;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .back-btn {
    margin-right: 16px;
  }
  
  .chat-title {
    flex: 1;
    font-size: 18px;
    font-weight: 500;
    color: #333;
  }
  
  .chat-status {
    margin-left: 16px;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    
    .loading-text {
      margin-top: 16px;
      color: #666;
    }
  }
  
  .empty-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
  }
  
  .messages-list {
    .message-item {
      margin-bottom: 16px;
      display: flex;
      
      &.message-right {
        justify-content: flex-end;
        
        .message-content {
          background-color: #1890ff;
          color: #fff;
          
          .message-time {
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
      
      .message-content {
        max-width: 70%;
        padding: 12px 16px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        
        .message-text {
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
        }
        
        .message-time {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
    }
  }
}

.chat-input {
  height: 200px;
  padding: 16px 24px;
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
  
  .input-container {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    
    .message-input {
      flex: 1;
      min-height: 150px;
    }
    
    .send-btn {
      height: 40px;
      padding: 0 24px;
    }
  }
}

.session-ended {
  padding: 16px 24px;
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
}

.text-gray-400 {
  color: #9ca3af;
}

:deep(.ant-textarea) {
  resize: none;
}

:deep(.ant-empty) {
  margin: 0;
}
</style>
