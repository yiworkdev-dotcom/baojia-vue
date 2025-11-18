<template>
  <div class="partner-management">


    <!-- 缩放控制按钮 -->
    <div class="zoom-controls">
      <a-button-group>
        <a-button @click="handleZoomIn" :disabled="scale >= 2">
          <Icon icon="ant-design:plus-outlined" />
        </a-button>
        <a-button @click="handleZoomOut" :disabled="scale <= 0.3">
          <Icon icon="ant-design:minus-outlined" />
        </a-button>
        <a-button @click="handleResetView">
          <Icon icon="ant-design:aim-outlined" />
          恢复中心
        </a-button>
        <a-button @click="handleResetZoom">
          <Icon icon="ant-design:expand-outlined" />
          重置缩放
        </a-button>
      </a-button-group>
      <span class="zoom-info">缩放: {{ Math.round(scale * 100) }}%</span>
    </div>

    <!-- 组织架构图容器 -->
    <div class="org-chart-container" ref="containerRef" @wheel="handleWheel" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
      <div 
        class="org-chart-wrapper" 
        ref="wrapperRef"
        :class="{ 'is-dragging': isDragging }"
        :style="{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transformOrigin: '0 0'
        }"
      >
        <div class="org-chart" v-if="treeData.length > 0">
          <div 
            v-for="node in treeData" 
            :key="node.id" 
            class="org-level level-1"
          >
            <OrgNode 
              :node="node" 
              :level="1"
            />
              </div>
            </div>
        <a-empty v-else description="暂无数据" />
            </div>
    </div>
  </div>
</template>

<script lang="ts" name="dw.partner-dwPtPartner" setup>
  import { ref, reactive, onMounted, nextTick } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { getUserTree } from './DwPtPartner.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import OrgNode from './components/OrgNode.vue';

    const { createMessage } = useMessage();
  
  // 树形数据
  const treeData = ref<any[]>([]);
  
  // 缩放和拖拽相关
  const scale = ref(1);
  const translateX = ref(0);
  const translateY = ref(0);
  const containerRef = ref<HTMLElement>();
  const wrapperRef = ref<HTMLElement>();
  
  // 拖拽状态
  const isDragging = ref(false);
  const dragStart = reactive({ x: 0, y: 0, translateX: 0, translateY: 0 });

  // 加载数据
  async function loadData() {
    try {
      const res = await getUserTree();
      if (res.success && res.result) {
        treeData.value = res.result;
        await nextTick();
        handleResetView();
      } else {
        createMessage.error(res.message || '加载数据失败');
      }
    } catch (error) {
      createMessage.error('加载数据失败');
      console.error(error);
    }
  }

  // 刷新
  function handleRefresh() {
    loadData();
  }

  // 放大
  function handleZoomIn() {
    if (scale.value < 2) {
      const oldScale = scale.value;
      scale.value = Math.min(scale.value + 0.1, 2);
      // 缩放后调整位置，保持视觉中心
      adjustPositionAfterZoom(oldScale, scale.value);
    }
  }

  // 缩小
  function handleZoomOut() {
    if (scale.value > 0.3) {
      const oldScale = scale.value;
      scale.value = Math.max(scale.value - 0.1, 0.3);
      // 缩放后调整位置，保持视觉中心
      adjustPositionAfterZoom(oldScale, scale.value);
    }
  }

  // 缩放后调整位置
  function adjustPositionAfterZoom(oldScale: number, newScale: number) {
    if (!containerRef.value) return;
    
    const containerRect = containerRef.value.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    // 计算鼠标位置相对于容器的坐标
    const scaleRatio = newScale / oldScale;
    
    // 调整位置，使缩放中心保持在视觉中心
    translateX.value = centerX - (centerX - translateX.value) * scaleRatio;
    translateY.value = centerY - (centerY - translateY.value) * scaleRatio;
  }

  // 重置缩放
  function handleResetZoom() {
    scale.value = 1;
    handleResetView();
  }

  // 恢复中心
  function handleResetView() {
    if (!containerRef.value || !wrapperRef.value) return;
    
    // 等待 DOM 更新
    nextTick(() => {
      const containerRect = containerRef.value!.getBoundingClientRect();
      const wrapperRect = wrapperRef.value!.getBoundingClientRect();
      
      // 计算居中位置
      const centerX = (containerRect.width - wrapperRect.width * scale.value) / 2;
      const centerY = 50; // 顶部留一些空间
      
      translateX.value = Math.max(0, centerX);
      translateY.value = centerY;
    });
  }

  // 鼠标滚轮缩放
  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    if (!containerRef.value) return;
    
    const oldScale = scale.value;
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.3, Math.min(2, scale.value + delta));
    
    if (oldScale !== newScale) {
      scale.value = newScale;
      
      // 以鼠标位置为中心缩放
      const containerRect = containerRef.value.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;
      
      const scaleRatio = newScale / oldScale;
      translateX.value = mouseX - (mouseX - translateX.value) * scaleRatio;
      translateY.value = mouseY - (mouseY - translateY.value) * scaleRatio;
    }
  }

  // 鼠标按下开始拖拽
  function handleMouseDown(e: MouseEvent) {
    if (e.button === 0) { // 左键
      isDragging.value = true;
      dragStart.x = e.clientX;
      dragStart.y = e.clientY;
      dragStart.translateX = translateX.value;
      dragStart.translateY = translateY.value;
      if (containerRef.value) {
        containerRef.value.style.cursor = 'grabbing';
      }
    }
  }

  // 鼠标移动拖拽
  function handleMouseMove(e: MouseEvent) {
    if (isDragging.value) {
      // 直接更新，不使用 requestAnimationFrame 以提升响应速度
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      translateX.value = dragStart.translateX + deltaX;
      translateY.value = dragStart.translateY + deltaY;
    }
  }

  // 鼠标释放结束拖拽
  function handleMouseUp() {
    isDragging.value = false;
    if (containerRef.value) {
      containerRef.value.style.cursor = 'grab';
    }
  }

  onMounted(() => {
    loadData();
    if (containerRef.value) {
      containerRef.value.style.cursor = 'grab';
    }
  });
</script>

<style lang="less" scoped>
  .partner-management {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;

    .title-icon {
      font-size: 28px;
      color: #ffd700;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: white;
    }

    .subtitle {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .action-btn {
    border-radius: 8px;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
  }

  .zoom-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 12px 20px;
      border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .zoom-info {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
  }

  .org-chart-container {
    flex: 1;
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;
    min-height: 600px;
  }

  .org-chart-wrapper {
    position: relative;
    transition: transform 0.1s ease-out;
    width: fit-content;
    min-width: 100%;
    will-change: transform;
    
    // 拖拽时禁用 transition，提升响应速度
    &.is-dragging {
      transition: none;
    }
  }

  .org-chart {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    padding: 20px;
  }

  .org-level {
    width: 100%;
    display: flex;
    justify-content: center;
  }


  // 响应式设计
  @media (max-width: 768px) {
    .partner-management {
      padding: 10px;
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .zoom-controls {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .node-card {
      min-width: 240px;
    }
  }
</style>