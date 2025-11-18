<template>
  <a-modal
    v-model:open="open"
    title="用户下级信息"
    :width="isFullscreen ? '100vw' : '900px'"
    :style="isFullscreen ? { top: 0, paddingBottom: 0, maxWidth: '100vw' } : {}"
    :bodyStyle="isFullscreen ? { height: 'calc(100vh - 55px)', overflow: 'auto' } : {}"
    :footer="null"
    @cancel="handleCancel"
  >
    <!-- 全屏按钮放在 closeIcon 插槽中 -->
    <template #closeIcon>
      <div class="modal-close-buttons">
        <a-button 
          type="text" 
          class="modal-action-button"
          @click.stop="toggleFullscreen"
          :title="isFullscreen ? '退出全屏' : '全屏显示'"
        >
          <template #icon>
            <FullscreenOutlined v-if="!isFullscreen" />
            <FullscreenExitOutlined v-else />
          </template>
        </a-button>
        <a-button 
          type="text" 
          class="modal-action-button"
          @click.stop="handleCancel"
          title="关闭"
        >
          <template #icon>
            <CloseOutlined />
          </template>
        </a-button>
      </div>
    </template>
    
    <div class="user-info-container">
      <!-- 用户基本信息 - 紧凑设计 -->
      <div class="user-basic-section">
        <a-descriptions :column="isFullscreen ? 4 : 3" bordered size="small">
          <a-descriptions-item label="用户账号" :span="isFullscreen ? 2 : 1">
            {{ userInfo.username || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="用户姓名">
            {{ userInfo.realname || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="性别">
            {{ getSexText(userInfo.sex) }}
          </a-descriptions-item>
          <a-descriptions-item label="手机号" :span="isFullscreen ? 2 : 1">
            {{ userInfo.phone || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="所属部门" :span="isFullscreen ? 2 : 1">
            {{ userInfo.orgCodeTxt || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="总余额">
            {{ userInfo.totalCarNum || 0 }}
          </a-descriptions-item>
          <a-descriptions-item label="已使用">
            {{ userInfo.usedCarNum || 0 }}
          </a-descriptions-item>
          <a-descriptions-item label="历史成交车数">
            {{ subordinateData?.num || 0 }}
          </a-descriptions-item>
          <a-descriptions-item label="用户状态">
            {{ getStatusText(userInfo.status) }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间" :span="isFullscreen ? 2 : 1">
            {{ userInfo.createTime || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
      
      <!-- 角色信息 -->
      <div class="role-section" v-if="userInfo.roles && userInfo.roles.length > 0">
        <h4>
          <CrownOutlined />
          角色信息
        </h4>
        <div class="role-tags">
          <a-tag v-for="role in userInfo.roles" :key="role.id" color="blue" class="role-tag">
            <CrownOutlined />
            {{ role.roleName }}
          </a-tag>
        </div>
      </div>
      
      <!-- 下级用户列表 -->
      <div class="subordinate-section">
        <div class="section-header">
          <h4>
            <TeamOutlined />
            下级用户
            <a-badge v-if="subordinateData?.children?.length" :count="subordinateData.children.length" class="subordinate-count" />
          </h4>
          <div class="section-actions">
            <a-button 
              v-if="subordinateData?.children && subordinateData.children.length > 0" 
              size="small" 
              @click="toggleAllSubordinates"
              :icon="h(expandedUsers.size > 0 ? h(UpOutlined) : h(DownOutlined))"
            >
              {{ expandedUsers.size > 0 ? '全部收起' : '全部展开' }}
            </a-button>
          </div>
        </div>
        
        <div v-if="subordinateData && subordinateData.children && subordinateData.children.length > 0" class="subordinate-list">
          <div v-for="(subordinate, index) in subordinateData.children" :key="subordinate.userId" class="subordinate-item">
            <!-- 一级下级用户 -->
            <div class="user-level-1">
              <div class="user-card level-1-card" :class="{ 'expanded': expandedUsers.has(subordinate.userId) }">
                <div class="user-content">
                  <a-avatar :size="32" class="user-avatar level-1-avatar">
                    {{ subordinate.realname ? subordinate.realname.charAt(0) : '用' }}
                  </a-avatar>
                  
                  <div class="user-info">
                    <div class="user-name">{{ subordinate.realname || '未知用户' }}</div>
                    <div class="user-meta">
                      <span class="user-id">ID: {{ subordinate.userId }}</span>
                      <span v-if="subordinate.children?.length" class="subordinate-count">{{ subordinate.children.length }} 个下级</span>
                    </div>
                  </div>
                  
                  <div class="user-stats">
                    <span class="stat-value">{{ subordinate.num || 0 }}</span>
                    <span class="stat-label">成交车数</span>
                  </div>
                  
                  <div class="user-actions" v-if="subordinate.children && subordinate.children.length > 0">
                    <a-button 
                      type="primary" 
                      size="small" 
                      :icon="expandedUsers.has(subordinate.userId) ? h(UpOutlined) : h(DownOutlined)"
                      @click="toggleSubordinate(subordinate.userId)"
                    >
                      {{ expandedUsers.has(subordinate.userId) ? '收起' : '展开' }}
                    </a-button>
                  </div>
                </div>
              </div>
              
              <!-- 二级下级用户展开区域 -->
              <div 
                v-if="subordinate.children && subordinate.children.length > 0 && expandedUsers.has(subordinate.userId)" 
                class="subordinate-children"
              >
                <div 
                  v-for="child in subordinate.children" 
                  :key="child.userId" 
                  class="subordinate-child-item"
                >
                  <!-- 二级下级用户 -->
                  <div class="user-level-2">
                    <div class="user-card level-2-card" :class="{ 'expanded': expandedUsers.has(child.userId) }">
                      <div class="user-content">
                        <a-avatar :size="28" class="user-avatar level-2-avatar">
                          {{ child.realname ? child.realname.charAt(0) : '用' }}
                        </a-avatar>
                        
                        <div class="user-info">
                          <div class="user-name">{{ child.realname || '未知用户' }}</div>
                          <div class="user-meta">
                            <span class="user-id">ID: {{ child.userId }}</span>
                            <span v-if="child.children?.length" class="subordinate-count">{{ child.children.length }} 个下级</span>
                          </div>
                        </div>
                        
                        <div class="user-stats">
                          <span class="stat-value">{{ child.num || 0 }}</span>
                          <span class="stat-label">成交车数</span>
                        </div>
                        
                        <div class="user-actions" v-if="child.children && child.children.length > 0">
                          <a-button 
                            type="primary" 
                            size="small" 
                            :icon="expandedUsers.has(child.userId) ? h(UpOutlined) : h(DownOutlined)"
                            @click="toggleSubordinate(child.userId)"
                          >
                            {{ expandedUsers.has(child.userId) ? '收起' : '展开' }}
                          </a-button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 三级下级用户展开区域 -->
                    <div 
                      v-if="child.children && child.children.length > 0 && expandedUsers.has(child.userId)" 
                      class="subordinate-children"
                    >
                      <div 
                        v-for="grandChild in child.children" 
                        :key="grandChild.userId" 
                        class="subordinate-child-item"
                      >
                        <!-- 三级下级用户 -->
                        <div class="user-level-3">
                          <div class="user-card level-3-card">
                            <div class="user-content">
                              <a-avatar :size="24" class="user-avatar level-3-avatar">
                                {{ grandChild.realname ? grandChild.realname.charAt(0) : '用' }}
                              </a-avatar>
                              
                              <div class="user-info">
                                <div class="user-name">{{ grandChild.realname || '未知用户' }}</div>
                                <div class="user-meta">
                                  <span class="user-id">ID: {{ grandChild.userId }}</span>
                                </div>
                              </div>
                              
                              <div class="user-stats">
                                <span class="stat-value">{{ grandChild.num || 0 }}</span>
                                <span class="stat-label">成交车数</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <a-empty v-else description="暂无下级用户信息" class="empty-state">
          <template #image>
            <TeamOutlined style="font-size: 48px; color: #d9d9d9;" />
          </template>
        </a-empty>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, watch, h } from 'vue';
import { 
  FullscreenOutlined, 
  FullscreenExitOutlined, 
  CloseOutlined,
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CrownOutlined,
  IdcardOutlined,
  UpOutlined,
  DownOutlined
} from '@ant-design/icons-vue';
import { getByUserSubordinate, list } from './user.api';

// 下级用户数据结构
interface SubordinateUser {
  userId: string;
  num: number;
  realname?: string;
  children: SubordinateUser[];
}

interface UserInfo {
  id?: string;
  username?: string;
  realname?: string;
  sex?: number;
  phone?: string;
  orgCodeTxt?: string;
  totalCarNum?: number;
  usedCarNum?: number;
  status?: number;
  createTime?: string;
  lastLoginTime?: string;
  roles?: Array<{
    id: string;
    roleName: string;
  }>;
}

const props = defineProps<{
  open: boolean;
  userInfo: UserInfo;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'cancel'): void;
}>();

const open = ref(false);
const subordinateData = ref<SubordinateUser | null>(null);
const loading = ref(false);
const expandedUsers = ref(new Set<string>());
const isFullscreen = ref(false);

// 根据用户ID查询用户真实姓名
const fetchUserRealname = async (userId: string): Promise<string> => {
  try {
    const res = await list({ id: userId });
    if (res && res.records && res.records.length > 0) {
      return res.records[0].realname || '未知用户';
    }
    return '未知用户';
  } catch (error) {
    console.error('查询用户姓名失败:', error);
    return '未知用户';
  }
};

// 递归处理下级用户数据，获取真实姓名
const processSubordinateData = async (data: SubordinateUser): Promise<SubordinateUser> => {
  // 获取当前用户的真实姓名
  const realname = await fetchUserRealname(data.userId);
  data.realname = realname;
  
  // 递归处理子级用户
  if (data.children && data.children.length > 0) {
    for (let i = 0; i < data.children.length; i++) {
      data.children[i] = await processSubordinateData(data.children[i]);
    }
  }
  
  return data;
};

// 获取下级用户数据
const fetchSubordinateData = async () => {
  if (!props.userInfo.id) return;
  
  loading.value = true;
  try {
    const res = await getByUserSubordinate({ currentUserId: props.userInfo.id });
    console.log('下级用户数据:', res);
    
    if (res) {
      subordinateData.value = await processSubordinateData(res);
    }
  } catch (error) {
    console.error('获取下级用户数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 切换下级用户展开/收起状态
const toggleSubordinate = (userId: string) => {
  if (expandedUsers.value.has(userId)) {
    expandedUsers.value.delete(userId);
  } else {
    expandedUsers.value.add(userId);
  }
};

// 切换全部下级用户展开/收起状态
const toggleAllSubordinates = () => {
  if (expandedUsers.value.size > 0) {
    expandedUsers.value.clear();
  } else {
    // 展开所有有下级的用户
    const expandAll = (users: SubordinateUser[]) => {
      users.forEach(user => {
        if (user.children && user.children.length > 0) {
          expandedUsers.value.add(user.userId);
          expandAll(user.children);
        }
      });
    };
    if (subordinateData.value?.children) {
      expandAll(subordinateData.value.children);
    }
  }
};

// 切换全屏状态
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

watch(() => props.open, (newVal) => {
  open.value = newVal;
  if (newVal && props.userInfo.id) {
    fetchSubordinateData();
    // 重置展开状态
    expandedUsers.value.clear();
  }
});

watch(open, (newVal) => {
  emit('update:open', newVal);
});

function handleCancel() {
  open.value = false;
  emit('cancel');
}

function getSexText(sex?: number) {
  if (sex === undefined || sex === null) return '-';
  const sexMap = {
    1: '男',
    2: '女',
  };
  return sexMap[sex] || '-';
}

function getStatusText(status?: number) {
  if (status === undefined || status === null) return '-';
  const statusMap = {
    1: '正常',
    2: '冻结',
    3: '审批中',
  };
  return statusMap[status] || '-';
}
</script>

<style scoped>
.user-info-container {
  padding: 16px 0;
}

/* 用户基本信息区域 - 紧凑设计 */
.user-basic-section {
  margin-bottom: 20px;
}

/* 角色信息区域 */
.role-section {
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.role-section h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.role-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* 下级用户区域 */
.subordinate-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.section-header h4 {
  margin: 0;
  color: #1890ff;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.subordinate-count {
  margin-left: 6px;
}

.section-actions {
  display: flex;
  gap: 6px;
}

/* 下级用户列表 */
.subordinate-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.subordinate-item {
  position: relative;
}

/* 用户卡片 - 极简设计 */
.user-card {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fff;
  transition: border-color 0.3s ease;
}

.user-card.expanded {
  border-color: #1890ff;
}

.user-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  min-height: 40px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: #262626;
  margin: 0 0 2px 0;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  display: flex;
  gap: 6px;
  font-size: 11px;
  color: #8c8c8c;
}

.user-id {
  white-space: nowrap;
}

.subordinate-count {
  color: #52c41a;
  font-weight: 500;
}

.user-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  margin: 0 6px;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #1890ff;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  color: #8c8c8c;
  line-height: 1;
}

.user-actions {
  flex-shrink: 0;
}

/* 层级样式 - 简化 */
.user-level-1 {
  position: relative;
}

.user-level-2 {
  position: relative;
  margin-left: 12px;
}

.user-level-3 {
  position: relative;
  margin-left: 12px;
}

/* 下级用户容器 */
.subordinate-children {
  margin-top: 3px;
}

.subordinate-child-item {
  margin-bottom: 3px;
}

/* 不同层级的卡片样式 */
.level-1-card {
  background: #fafafa;
  border-left: 2px solid #1890ff;
}

.level-1-avatar {
  background: #1890ff;
}

.level-2-card {
  background: #f6ffed;
  border-left: 2px solid #52c41a;
}

.level-2-avatar {
  background: #52c41a;
}

.level-3-card {
  background: #fff7e6;
  border-left: 2px solid #fa8c16;
}

.level-3-avatar {
  background: #fa8c16;
}

/* 空状态 */
.empty-state {
  padding: 30px 0;
  text-align: center;
}

/* 全屏模式下的样式调整 */
:deep(.ant-modal) {
  transition: all 0.3s ease;
}

:deep(.ant-modal-content) {
  transition: all 0.3s ease;
}

/* 确保全屏按钮显示 */
:deep(.ant-modal-header) {
  position: relative;
}

:deep(.ant-modal-title) {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
}

.modal-close-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.modal-action-button {
  padding: 4px 8px !important;
  margin: 0 !important;
  border: none !important;
  box-shadow: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

.modal-action-button:hover {
  background-color: rgba(0, 0, 0, 0.06) !important;
  color: #1890ff !important;
}

.modal-action-button:focus {
  background-color: rgba(0, 0, 0, 0.06) !important;
  color: #1890ff !important;
}

.modal-action-button:active {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-content {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .user-stats {
    margin: 0;
  }
  
  .user-level-2,
  .user-level-3 {
    margin-left: 8px;
  }
}

/* 动画效果 - 极简 */
.user-card {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.subordinate-children {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}
</style> 