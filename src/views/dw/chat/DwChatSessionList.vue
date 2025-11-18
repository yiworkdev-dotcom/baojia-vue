<template>
  <div class="session-list-container">
    <!-- 进行中的会话 -->
    <a-card title="进行中的会话" :bordered="false" class="session-card">
      <a-table
        :columns="columns"
        :data-source="activeSessions"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'userRealname'">
            <span v-if="userRealnameMap[record.userId]">
              {{ userRealnameMap[record.userId] }}
            </span>
            <span v-else class="text-gray-400">加载中...</span>
          </template>
          <template v-else-if="column.key === 'startedAt'">
            {{ formatDateTime(record.startedAt) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="primary" size="small" @click="enterChat(record)">
              进入聊天
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 已结束的会话 -->
    <a-card title="已结束的会话" :bordered="false" class="session-card">
      <a-table
        :columns="columns"
        :data-source="endedSessions"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'userRealname'">
            <span v-if="userRealnameMap[record.userId]">
              {{ userRealnameMap[record.userId] }}
            </span>
            <span v-else class="text-gray-400">加载中...</span>
          </template>
          <template v-else-if="column.key === 'startedAt'">
            {{ formatDateTime(record.startedAt) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="primary" size="small" @click="enterChat(record)">
              查看详情
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" name="dw.chat-dwChatSession" setup>
import { list } from './DwChatSession.api';
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useUserStore } from '/@/store/modules/user';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useGlobSetting } from '/@/hooks/setting';
import { getToken } from '/@/utils/auth';
import { useRoute, useRouter } from 'vue-router';
import { wsManager } from '/@/utils/websocket';

// 定义会话数据类型
interface ChatSession {
  id: string;
  userId: string;
  agentId: string;
  status: number;
  startedAt: string;
  endedAt: string | null;
  status_dictText: string;
}

const userStore = useUserStore();
const globSetting = useGlobSetting();
const currentUserId = userStore.getUserInfo.id;
const sessionList = ref<ChatSession[]>([]);
const loading = ref(false);
const userRealnameMap = ref<Record<string, string>>({});
const router = useRouter();

// 轮询相关
let pollingTimer: NodeJS.Timeout | null = null;
const POLLING_INTERVAL = 5000; // 5秒

// 计算属性：进行中的会话
const activeSessions = computed(() => {
  return sessionList.value.filter(session => session.status === 1);
});

// 计算属性：已结束的会话
const endedSessions = computed(() => {
  return sessionList.value.filter(session => session.status === 2);
});

// 表格列配置
const columns = [
  {
    title: '用户姓名',
    dataIndex: 'userRealname',
    key: 'userRealname',
    width: 200,
  },
  {
    title: '开始时间',
    dataIndex: 'startedAt',
    key: 'startedAt',
    width: 180,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'center',
  },
];

// 状态处理方法
const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return '进行中';
    case 2:
      return '已结束';
    default:
      return '未知状态';
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 1:
      return 'processing'; // 蓝色，表示进行中
    case 2:
      return 'default'; // 灰色，表示已结束
    default:
      return 'error'; // 红色，表示未知状态
  }
};

// WebSocket消息处理
const handleWebSocketMessage = (data: any) => {
  console.log('[聊天会话] 收到WebSocket消息:', data);
  
  // 根据消息类型处理不同的业务逻辑
  if (data.type === 'session_update') {
    // 会话状态更新，刷新列表
    getSessionList();
  } else if (data.type === 'new_message') {
    // 新消息通知
    message.info(`收到新消息: ${data.content}`);
  }
};

// 获取用户真实姓名
const fetchUserRealnames = async (userIds: string[]) => {
  if (!userIds?.length) return {};
  try {
    const uniqueIds = Array.from(new Set(userIds));
    const data = await defHttp.get<any>({
      url: '/sys/user/queryByIds',
      params: { userIds: uniqueIds.join(',') },
    });
    const list = Array.isArray(data) ? data : data?.records || [];
    const map: Record<string, string> = {};
    list.forEach((u: any) => {
      if (u?.id) map[u.id] = u.realname || u.username || '未知用户';
    });
    return map;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return {};
  }
};

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-';
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');
};

// 进入聊天
const enterChat = (record: ChatSession) => {
  // 跳转到聊天页面
  router.push({
    path: '/dw/chat/DwChatRoom',
    query: {
      sessionId: record.id,
      userId: record.userId,
      userRealname: userRealnameMap.value[record.userId] || '未知用户'
    }
  });
};

// 获取会话列表
const getSessionList = async () => {
  try {
    loading.value = true;
    const res = await list({ page: 1, pageSize: 10000 });
    const data = res.records;
    sessionList.value = data.filter((item: any) => item.agentId === currentUserId);
    
    // 获取所有用户ID
    const userIds = sessionList.value.map((item: ChatSession) => item.userId).filter(Boolean);
    if (userIds.length > 0) {
      const userMap = await fetchUserRealnames(userIds);
      userRealnameMap.value = userMap;
    }
  } catch (error) {
    console.error('获取会话列表失败:', error);
    message.error('获取会话列表失败');
  } finally {
    loading.value = false;
  }
};

// 启动轮询
const startPolling = () => {
  // 清除已存在的定时器
  if (pollingTimer) {
    clearInterval(pollingTimer);
  }
  
  // 设置新的定时器
  pollingTimer = setInterval(() => {
    console.log('[聊天会话] 执行轮询查询会话列表');
    getSessionList();
  }, POLLING_INTERVAL);
  
  console.log('[聊天会话] 轮询已启动，间隔:', POLLING_INTERVAL + 'ms');
};

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
    console.log('[聊天会话] 轮询已停止');
  }
};

onMounted(() => {
  // 初始化WebSocket连接
  const token = getToken();
  if (token) {
    wsManager.initWebSocket(token);
    // 注册消息处理器
    wsManager.registerHandler('sessionList', handleWebSocketMessage);
  }
  
  // 获取会话列表
  getSessionList();
  // 启动轮询
  startPolling();
});

onUnmounted(() => {
  // 停止轮询
  stopPolling();
  // 注销消息处理器
  wsManager.unregisterHandler('sessionList');
});
</script>

<style lang="less" scoped>
.session-list-container {
  padding: 16px;
}

.session-card {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

:deep(.ant-picker),
:deep(.ant-input-number) {
  width: 100%;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #f5f5f5;
  font-weight: bold;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f0f9ff;
}

.text-gray-400 {
  color: #9ca3af;
}
</style>
