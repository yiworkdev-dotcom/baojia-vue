<template>
  <div class="org-node-wrapper" :class="`level-${level}`">
    <div class="org-node">
      <div class="node-card" @click="handleNodeClick">
        <div class="node-header">
          <div class="node-avatar">
            <img v-if="avatarUrl" :src="avatarUrl" :alt="node.realname" />
            <Icon v-else icon="ant-design:user-outlined" />
          </div>
          <div class="node-info">
            <div class="node-name-row">
              <span class="node-name">{{ node.realname || node.username }}</span>
              <template v-if="level > 1">
                <a-tag v-if="level === 2" color="blue" class="push-tag">
                  {{ rootNode ? `${rootNode.realname || rootNode.username}的直推` : '直推' }}
                </a-tag>
                <div v-else class="push-tags">
                  <a-tag color="orange" class="push-tag">
                    {{ rootNode ? `${rootNode.realname || rootNode.username}的间推` : '间推' }}
                  </a-tag>
                  <a-tag v-if="parentNode" color="blue" class="push-tag">
                    {{ parentNode.realname || parentNode.username }}的直推
                  </a-tag>
                </div>
              </template>
            </div>
            <div class="node-username">{{ node.username }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="hasChildren" class="org-children">
      <div class="children-wrapper">
        <OrgNode 
          v-for="child in node.children" 
          :key="child.id"
          :node="child"
          :level="level + 1"
          :root-node="rootNode || node"
          :parent-node="node"
        />
      </div>
    </div>
    
    <!-- 详情弹窗 -->
    <BasicModal
      v-model:open="modalVisible"
      title="用户详情"
      :width="800"
      :footer="null"
      destroyOnClose
    >
      <div class="user-detail-content">
        <div class="detail-header">
          <div class="detail-avatar">
            <img v-if="avatarUrl" :src="avatarUrl" :alt="node.realname" />
            <Icon v-else icon="ant-design:user-outlined" />
          </div>
          <div class="detail-title">
            <h3>{{ node.realname || node.username }}</h3>
            <p class="detail-username">{{ node.username }}</p>
          </div>
        </div>
        
        <a-descriptions :column="2" bordered size="small" class="detail-descriptions">
          <a-descriptions-item label="真实姓名">
            {{ node.realname || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="用户名">
            {{ node.username || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="手机号">
            {{ node.phone || '未设置' }}
          </a-descriptions-item>
          <a-descriptions-item label="用户状态">
            <a-tag :color="node.status === 1 ? 'green' : 'red'">
              {{ node.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="总车数">
            {{ node.totalCarNum || 0 }}
          </a-descriptions-item>
          <a-descriptions-item label="已用车数">
            {{ node.usedCarNum || 0 }}
          </a-descriptions-item>
          <a-descriptions-item label="推荐码" :span="2">
            {{ node.recommendCode || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { BasicModal } from '/@/components/Modal';

  interface Props {
    node: any;
    level: number;
    rootNode?: any;
    parentNode?: any;
  }

  const props = defineProps<Props>();

  const hasChildren = computed(() => {
    return props.node.children && props.node.children.length > 0;
  });

  const avatarUrl = computed(() => {
    if (props.node.avatar) {
      return getFileAccessHttpUrl(props.node.avatar);
    }
    return '';
  });

  // 详情弹窗显示状态
  const modalVisible = ref(false);

  // 点击节点显示详情
  function handleNodeClick(e: MouseEvent) {
    e.stopPropagation(); // 阻止事件冒泡，避免触发拖拽
    modalVisible.value = true;
  }
</script>

<style lang="less" scoped>
  .org-node-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    margin: 0 8px;

    &.level-1 {
      margin-bottom: 30px;
    }
  }

  .org-node {
    position: relative;
    z-index: 2;
  }

  .node-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 12px;
    width: 230px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      border-color: #667eea;
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .node-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    flex-shrink: 0;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .node-info {
    flex: 1;
    min-width: 0;
  }

  .node-name-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 2px;
    flex-wrap: wrap;
  }

  .node-name {
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .push-tags {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  .push-tag {
    flex-shrink: 0;
    font-size: 11px;
    padding: 0 6px;
    height: 18px;
    line-height: 18px;
    border-radius: 4px;
    font-weight: 500;
    white-space: nowrap;
  }

  .node-username {
    font-size: 11px;
    color: #7f8c8d;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 4px;
  }

  // 详情弹窗样式
  .user-detail-content {
    padding: 20px 0;
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e9ecef;
  }

  .detail-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 32px;
    flex-shrink: 0;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .detail-title {
    flex: 1;

    h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
    }

    .detail-username {
      margin: 0;
      font-size: 14px;
      color: #7f8c8d;
    }
  }

  .detail-descriptions {
    :deep(.ant-descriptions-item-label) {
      font-weight: 500;
      background-color: #f8f9fa;
    }
  }

  .org-children {
    margin-top: 30px;
    position: relative;
    padding-top: 15px;
    width: 100%;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 15px;
      background: #667eea;
    }
  }

  .children-wrapper {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: flex-start;
    gap: 20px;
    position: relative;
    padding: 0 10px;

    &::before {
      content: '';
      position: absolute;
      top: -15px;
      left: 0;
      right: 0;
      height: 2px;
      background: #667eea;
    }

    &::after {
      content: '';
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 15px;
      background: #667eea;
    }
  }

  // 不同层级的样式
  .org-node-wrapper.level-1 .node-card {
    border-color: #667eea;
    background: linear-gradient(135deg, #ffffff 0%, #f0f2ff 100%);
  }

  .org-node-wrapper.level-2 .node-card {
    border-color: #74b9ff;
    background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  }

  .org-node-wrapper.level-3 .node-card {
    border-color: #fd79a8;
    background: linear-gradient(135deg, #ffffff 0%, #fff0f6 100%);
  }

  .org-node-wrapper.level-4 .node-card {
    border-color: #fdcb6e;
    background: linear-gradient(135deg, #ffffff 0%, #fffbe6 100%);
  }
</style>
