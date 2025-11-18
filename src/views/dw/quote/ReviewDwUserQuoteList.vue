<template>
  <div class="futures-background">
        <!-- 统计卡片区域 -->
        <div class="statistics-cards">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card class="statistics-card success-card" :bordered="false">
            <a-statistic
              title="成交数"
              :value="statisticsData.completedCount"
              :value-style="{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }"
            >
              <template #prefix>
                <Icon icon="ant-design:check-circle-outlined" style="color: #52c41a; font-size: 20px;" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="statistics-card warning-card" :bordered="false">
            <a-statistic
              title="待成交数"
              :value="statisticsData.pendingCount"
              :value-style="{ color: '#faad14', fontSize: '24px', fontWeight: 'bold' }"
            >
              <template #prefix>
                <Icon icon="ant-design:clock-circle-outlined" style="color: #faad14; font-size: 20px;" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="statistics-card error-card" :bordered="false">
            <a-statistic
              title="撤销或审核不通过数"
              :value="statisticsData.cancelledCount"
              :value-style="{ color: '#ff4d4f', fontSize: '24px', fontWeight: 'bold' }"
            >
              <template #prefix>
                <Icon icon="ant-design:close-circle-outlined" style="color: #ff4d4f; font-size: 20px;" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>
        <!-- 带钢价格信息 -->
        <div class="price-info-section">
      <a-card class="price-card" :bordered="false">
        <div class="price-content">
          <div class="main-price">
              <Icon icon="ant-design:line-chart-outlined" style="color: #1890ff; margin-right: 8px;" />
              <span class="price-label">带钢买入价格:</span>
              <span class="price-value">{{ mainProductPrice }}</span>
              <span class="price-unit">元/吨</span>
            </div>
            <div class="main-price">
              <Icon icon="ant-design:line-chart-outlined" style="color: #1890ff; margin-right: 8px;" />
              <span class="price-label">带钢卖出价格:</span>
              <span class="price-value">{{ mainProductSellPrice }}</span>
              <span class="price-unit">元/吨</span>
            </div>
        </div>
      </a-card>
    </div>
    
    <!-- 自定义审核表格 -->
    <div class="custom-review-table">
      <a-card class="review-table-card" :bordered="false">
        
        <!-- 表格内容 -->
        <div class="table-container">
          <a-table
            :columns="reviewColumns"
            :data-source="reviewData"
            :pagination="pagination"
            @change="handleTableChange"
            :scroll="tableScroll"
            row-key="id"
          >
            <!-- 买卖方向列 -->
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'side'">
                <a-tag 
                  :color="getSideColor(record.side_dictText)" 
                  style="font-size: 16px; font-weight: bold;"
                >
                  {{ record.side_dictText }}
                </a-tag>
              </template>
              
              <!-- 产品名称列 -->
              <template v-else-if="column.key === 'productName'">
                  {{ record.productName }}
              </template>
              
              <!-- 报价产品名称列 -->
              <template v-else-if="column.key === 'quoteName'">
                <a-tag :color="record.quoteName === '螺纹钢' ? 'orange' : 'blue'" style="font-size: 16px; font-weight: bold;">
                  {{ record.quoteName }}
                </a-tag>
              </template>
              
              <!-- 报价产品编码列 -->
              <template v-else-if="column.key === 'quoteCode'">
                <a-tag color="purple" style="font-size: 16px; font-weight: bold;">
                  {{ record.quoteCode }}
                </a-tag>
              </template>
              
              <!-- 报价价格列 -->
              <template v-else-if="column.key === 'quotePrice'">
                <div class="price-cell">
                  <span class="price-value" style="font-size: 18px;font-weight: bold;">{{ record.quotePrice }}</span>
                  
                </div>
              </template>
              
              <!-- 基差列 -->
              <template v-else-if="column.key === 'basis'">
                <div class="basis-cell">
                  <span 
                    :class="['basis-value', record.basis > 0 ? 'basis-positive' : record.basis < 0 ? 'basis-negative' : '']"
                    style="font-size: 16px; font-weight: bold;"
                  >
                    {{ record.basis > 0 ? '+' : record.basis < 0 ? '' : '' }}{{ record.basis }}
                  </span>
                </div>
              </template>
              
              <!-- 提交时间列 -->
              <template v-else-if="column.key === 'updateTime'">
                <span>{{ formatDateTime(record.updateTime) }}</span>
              </template>
              
              <!-- 操作列 -->
              <template v-else-if="column.key === 'action'">
                <div class="action-buttons">
                  <a-button 
                    type="primary" 
                    size="small" 
                    @click="handleConfirmAudit(record)"
                    :disabled="!canAudit(record)"
                  >
                    <Icon icon="ant-design:check-outlined" />
                    审核通过
                  </a-button>
                  <a-button 
                    size="small" 
                    @click="handleRejectAudit(record)"
                    :disabled="!canAudit(record)"
                  >
                    <Icon icon="ant-design:close-outlined" />
                    审核不通过
                  </a-button>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </a-card>
    </div>

    <!-- 表单区域 -->
    <DwUserQuoteModal @register="registerModal" @success="handleSuccess"></DwUserQuoteModal>
    <!-- 审核对话框 -->
    <DwUserQuoteAuditModal @register="registerAuditModal" @success="handleSuccess"></DwUserQuoteAuditModal>
  </div>
</template>

<script lang="ts" name="dw.quote-dwUserQuote" setup>
  import {ref, reactive, computed, unref, onMounted, onUnmounted, h} from 'vue';
  import {BasicTable, useTable, TableAction} from '/@/components/Table';
  import {useModal} from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage'
  import DwUserQuoteModal from './components/DwUserQuoteModal.vue'
  import DwUserQuoteAuditModal from './components/DwUserQuoteAuditModal.vue'
  import {columns, searchFormSchema, superQuerySchema, setMainProductPrice, getMainProductPrice} from './DwUserQuote.data';
  import {list, deleteOne, batchDelete, getImportUrl,getExportUrl, getMainProductPrice as fetchMainProductPrice, getUserRoles, review} from './DwUserQuote.api';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Modal, notification } from 'ant-design-vue';
  import { getDateByPicker } from '/@/utils';
  import auditWebSocketManager from '/@/utils/auditWebSocket';
  
  //日期个性化选择
  const fieldPickers = reactive({
  });
  const queryParam = reactive<any>({});
  const userStore = useUserStore();
  const { createMessage } = useMessage();
  
  // 带钢价格响应式数据
  const mainProductPrice = ref(0);
  // 带钢卖出价格响应式数据
  const mainProductSellPrice = ref(0);
  // 用户角色相关
  const userRoles = ref<string[]>([]);
  const isQihuoProxy = computed(() => userRoles.value.includes('期货代理人'));
  
  // 审核表格相关数据
  const reviewData = ref([]);
  const loading = ref(false);
  const pagination = reactive({
    current: 1,
    pageSize: 10, // 修改为10条数据
    total: 0,
    showSizeChanger: false, // 禁用分页大小选择器
    showQuickJumper: false, // 禁用快速跳转功能
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });
  
  // 动态计算表格滚动高度
  const getTableScrollHeight = () => {
    const windowHeight = window.innerHeight;
    if (windowHeight <= 768) {
      return 'calc(100vh - 250px)'; // 小屏幕
    } else if (windowHeight <= 1024) {
      return 'calc(100vh - 300px)'; // 中等屏幕
    } else {
      return 'calc(100vh - 350px)'; // 大屏幕
    }
  };
  
  const tableScroll = computed(() => ({
    x: 1440,
    y: getTableScrollHeight()
  }));
  
  // 审核表格列定义
  const reviewColumns = [
    {
      title: '用户',
      dataIndex: 'userId_dictText',
      key: 'userId',
      width: 70,
      align: 'center',
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 70,
      align: 'center',
    },
    {
      title: '期货产品名称',
      dataIndex: 'quoteName',
      key: 'quoteName',
      width: 70,
      align: 'center',
    },
    {
      title: '报价产品编码',
      dataIndex: 'quoteCode',
      key: 'quoteCode',
      width: 70,
      align: 'center',
    },
    {
      title: '买卖方向',
      dataIndex: 'side_dictText',
      key: 'side',
      width: 70,
      align: 'center',
    },
    {
      title: '报价价格',
      dataIndex: 'quotePrice',
      key: 'quotePrice',
      width: 70,
      align: 'center',
    },
    {
      title:'基差',
      dataIndex:'basis',
      key:'basis',
      width: 100, // 增加宽度从70到100
      align:'center'
    },
    {
      title: '交易车数',
      dataIndex: 'qty',
      key: 'qty',
      width: 70,
      align: 'center',
    },
    {
      title: '报价时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 120,
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      align: 'center',
      fixed: 'right',
    },
  ];
  
  // WebSocket连接
  let ws: WebSocket | null = null;
  // 审核通知WebSocket连接
  let auditWs: WebSocket | null = null;
  
  //注册model
  const [registerModal, {openModal}] = useModal();
  const [registerAuditModal, {openModal: openAuditModal}] = useModal();
    // 统计数据
    const statisticsData = reactive({
    completedCount: 0,    // 成交数（平仓状态=5）
    pendingCount: 0,      // 带成交数（平仓状态=1）
    cancelledCount: 0     // 撤销或审核不通过数（撤单时间不为空）
  });
  
  // 获取用户角色
  const fetchUserRoles = async () => {
    try {
      const result = await getUserRoles();
      if (result && result.length > 0) {
        userRoles.value = result[0];
      }
    } catch (error) {
      console.error('获取用户角色失败:', error);
    }
  };
  
  // 获取带钢价格（保留作为备用）
  const fetchMainProductPriceData = async () => {
    try {
      const result = await fetchMainProductPrice();
      if (result && result && result.buyPrice) {
        const price = result.buyPrice;
        setMainProductPrice(price);
        mainProductPrice.value = price;
        mainProductSellPrice.value = result.sellPrice;
        }
    } catch (error) {
      console.error('获取带钢价格失败:', error);
    }
  };

  // 启动WebSocket连接
  const startWebSocket = () => {
    try {
      // 先通过HTTP获取一次价格数据
      fetchMainProductPriceData();
      
      // 建立WebSocket连接
      ws = new WebSocket('ws://localhost:8080jeecg-boot/ws/mains');
      
      ws.onopen = () => {
        };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // 根据WebSocket返回的数据结构更新价格
          if (data && typeof data === 'object') {
            // 如果数据包含买入价格
            if (data.buyPrice !== undefined) {
              const price = data.buyPrice;
              setMainProductPrice(price);
              mainProductPrice.value = price;
              }
            
            // 如果数据包含卖出价格
            if (data.sellPrice !== undefined) {
              mainProductSellPrice.value = data.sellPrice;
              }
            
            // 如果数据结构不同，可以根据实际返回格式调整
            // 例如：data.price, data.mainProductPrice 等
          }
        } catch (error) {
          console.error('解析WebSocket数据失败:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        createMessage.error('价格数据连接失败，将使用轮询方式');
        // 连接失败时回退到轮询方式
        startPricePolling();
      };
      
      ws.onclose = () => {
        // 连接关闭时尝试重连
        setTimeout(() => {
          if (ws?.readyState === WebSocket.CLOSED) {
            startWebSocket();
          }
        }, 3000);
      };
      
    } catch (error) {
      console.error('启动WebSocket失败:', error);
      createMessage.error('WebSocket连接失败，将使用轮询方式');
      // 启动失败时回退到轮询方式
      startPricePolling();
    }
  };

  // 启动审核通知WebSocket连接
  const startAuditWebSocket = () => {
    try {
      // 获取用户token
      const token = userStore.getToken;
      if (!token) {
        console.error('用户token不存在，无法建立审核通知WebSocket连接');
        return;
      }
      
      // 使用全局WebSocket管理器，避免重复连接
      console.log('🔌 [ReviewDwUserQuoteList] 使用全局WebSocket管理器');
      
      // 注册消息处理器
      const handlerKey = 'ReviewDwUserQuoteList';
      auditWebSocketManager.registerHandler(handlerKey, (data) => {
        try {
          // 检查是否是审核通知类型
          if (data.type === 'audit_notice' && data.content && data.content.includes('报价')) {
            // 使用 notification API 显示通知
            notification.success({
              message: '审核通知',
              description: data.content,
              duration: 1,
              placement: 'topRight'
            });
          }
        } catch (error) {
          console.error('解析审核通知数据失败:', error);
        }
      });
      
      // 如果WebSocket管理器未初始化，则初始化它
      if (!auditWebSocketManager.isConnected()) {
        auditWebSocketManager.initWebSocket(token);
      }
      
    } catch (error) {
      console.error('启动审核通知WebSocket失败:', error);
    }
  };

  // 停止WebSocket连接
  const stopWebSocket = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  };

  // 停止审核通知WebSocket连接
  const stopAuditWebSocket = () => {
    // 注销消息处理器
    const handlerKey = 'ReviewDwUserQuoteList';
    auditWebSocketManager.unregisterHandler(handlerKey);
    console.log('🔌 [ReviewDwUserQuoteList] 已注销WebSocket处理器');
  };

  // 轮询方式（作为备用）
  let pricePollingTimer: NodeJS.Timeout | null = null;
  // 添加审核数据轮询定时器
  let reviewDataPollingTimer: NodeJS.Timeout | null = null;
  
  const startPricePolling = () => {
    // 先立即执行一次
    fetchMainProductPriceData();
    
    // 然后每5秒轮询一次（降低频率）
    pricePollingTimer = setInterval(() => {
      fetchMainProductPriceData();
    }, 5000);
  };

  const stopPricePolling = () => {
    if (pricePollingTimer) {
      clearInterval(pricePollingTimer);
      pricePollingTimer = null;
    }
  };

  // 启动审核数据轮询
  const startReviewDataPolling = () => {
    // 先立即执行一次
    fetchReviewData();
    fetchStatisticsData();
    
    // 每1秒轮询一次审核数据
    reviewDataPollingTimer = setInterval(() => {
      fetchReviewData();
      fetchStatisticsData();
    }, 1000);
  };

  // 停止审核数据轮询
  const stopReviewDataPolling = () => {
    if (reviewDataPollingTimer) {
      clearInterval(reviewDataPollingTimer);
      reviewDataPollingTimer = null;
    }
  };

    // 获取统计数据 - 基于完整查询结果
    const fetchStatisticsData = async () => {
    try {
      // 构建查询参数，获取所有数据（不分页）
      const params = {
        ...queryParam,
        pageNo: 1,
        pageSize: 999999, // 设置一个很大的值来获取所有数据
        ...fieldPickers
      };
      
      // 添加调试信息
      
      // 处理日期参数
      if (params && fieldPickers) {
        for (let key in fieldPickers) {
          if (params[key]) {
            params[key] = getDateByPicker(params[key], fieldPickers[key]);
          }
        }
      }
      
      const result = await list(params);
      // 添加调试信息
      
      if (result && result.records && Array.isArray(result.records)) {
        const allData = result.records;
        // 添加调试信息
        
        // 计算统计数据
        statisticsData.completedCount = allData.filter(item => item.status === 2).length;
        statisticsData.pendingCount = allData.filter(item => item.status === 1 ).length;
        statisticsData.cancelledCount = allData.filter(item =>  item.status === 5).length;
        
        // 添加调试信息
      } else {
        // 如果没有数据，重置统计
        statisticsData.completedCount = 0;
        statisticsData.pendingCount = 0;
        statisticsData.cancelledCount = 0;
        // 添加调试信息
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 出错时重置统计
      statisticsData.completedCount = 0;
      statisticsData.pendingCount = 0;
      statisticsData.cancelledCount = 0;
    }
  };
  
  // 获取审核数据（只获取状态为1的数据）
  const fetchReviewData = async () => {
    loading.value = true;
    try {
      const params = {
        ...queryParam,
        status: 1, // 只获取状态为1的数据
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        column: 'updateTime', // 按更新时间排序
        order: 'desc', // 倒序
        ...fieldPickers
      };
      
      // 添加调试信息
      
      // 处理日期参数
      if (params && fieldPickers) {
        for (let key in fieldPickers) {
          if (params[key]) {
            params[key] = getDateByPicker(params[key], fieldPickers[key]);
          }
        }
      }
      
      const result = await list(params);
      // 添加调试信息
      
      if (result && result.records) {
        reviewData.value = result.records;
        pagination.total = result.total || 0;
        // 添加调试信息
      } else {
        reviewData.value = [];
        pagination.total = 0;
        // 添加调试信息
      }
    } catch (error) {
      console.error('获取审核数据失败:', error);
      createMessage.error('获取数据失败');
      reviewData.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  };
  
  // 刷新数据
  const refreshData = () => {
    fetchReviewData();
    fetchStatisticsData();
  };
  
  // 表格变化处理
  const handleTableChange = (pag: any) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchReviewData();
  };
  
  // 格式化日期时间
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '-';
    return dateTime.replace('T', ' ').substring(0, 19);
  };
  
  // 检查是否可以审核
  const canAudit = (record: any) => {
    return record.status === 1; // 只有状态为1的才能审核
  };
  
  // 审核通过 - 根据报价价格是否为空决定输入成交基差还是成交价格
  const handleConfirmAudit = async (record: any) => {
    let inputValue = '';
    const isQuotePriceEmpty = !record.quotePrice || record.quotePrice === '' || record.quotePrice === null || record.quotePrice === undefined;
    const inputLabel = isQuotePriceEmpty ? '成交基差' : '成交价格';
    const inputPlaceholder = isQuotePriceEmpty ? '请输入成交基差' : '请输入成交价格';
    
    Modal.confirm({
      title: '确认审核通过',
      content: h('div', [
        h('p', `确定要审核通过用户 "${record.userId_dictText}" 的报价吗？`),
        h('div', { style: 'margin-top: 16px;' }, [
          h('label', { style: 'display: block; margin-bottom: 8px; font-weight: bold;' }, `${inputLabel}:`),
          h('input', {
            type: 'number',
            placeholder: inputPlaceholder,
            style: 'width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;',
            onInput: (e: any) => {
              inputValue = e.target.value;
            }
          })
        ])
      ]),
      okText: '确认通过',
      cancelText: '取消',
      okType: 'primary',
      onOk: async () => {
        if (!inputValue) {
          createMessage.error(`请输入${inputLabel}`);
          return Promise.reject();
        }
        
        try {
          // 构建提交参数
          const submitParams: any = {
            id: record.id,
            status: 2
          };
          
          // 根据报价价格是否为空决定提交哪个字段
          if (isQuotePriceEmpty) {
            // 如果报价价格为空，提交成交基差
            submitParams.transactionBasis = parseFloat(inputValue);
          } else {
            // 如果报价价格不为空，提交成交价格
            submitParams.transactionPrice = parseFloat(inputValue);
          }
          
          // 调用review API更新状态为2
          await review(submitParams);
          
          createMessage.success('审核通过');
          // 刷新数据
          fetchReviewData();
          fetchStatisticsData();
        } catch (error) {
          console.error('审核通过失败:', error);
          createMessage.error('审核通过失败');
        }
      }
    });
  };
  
  // 审核不通过 - 打开审核弹窗，预填状态为4
  const handleRejectAudit = (record: any) => {
    openAuditModal(true, {
      record: {
        ...record,
        status: 4 // 预填状态为4
      },
      isAudit: true,
      auditType: 'reject', // 添加审核类型
      showFooter: true,
    });
  };

   
   /**
    * 成功回调
    */
  function handleSuccess() {
      fetchReviewData();
   }

  // 获取买卖方向颜色
  const getSideColor = (sideText: string) => {
    switch (sideText) {
      case '单买做多':
        return 'red';
      case '单卖做空':
        return 'green';
      case '正套对冲':
        return 'blue';
      case '反套对冲':
        return 'orange';
      default:
        return 'default';
    }
  };

  // 窗口大小变化监听
  const handleResize = () => {
    // 触发响应式更新
    getTableScrollHeight();
  };

  // 组件挂载时获取用户角色和启动WebSocket连接
  onMounted(() => {
    fetchUserRoles();
    startWebSocket();
    // 启动审核通知WebSocket连接
    startAuditWebSocket();
    // 启动审核数据轮询
    startReviewDataPolling();
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);
  });

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopWebSocket();
    stopAuditWebSocket();
    stopPricePolling();
    stopReviewDataPolling();
    // 移除窗口大小变化监听
    window.removeEventListener('resize', handleResize);
  });
</script>

<style lang="less" scoped>
  :deep(.ant-picker),:deep(.ant-input-number){
    width: 100%;
  }
  // 期货后台整体背景
  .futures-background {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 16px;
  min-height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
  overflow-y: auto; // 允许垂直滚动
}
  
  // 统计卡片区域
  .statistics-cards {
    margin-bottom: 10px;
    flex-shrink: 0; // 防止收缩
    
    .statistics-card {
      text-align: center;
      height: 70px;
      border-radius: 7px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }
      
      &.success-card {
        background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
        border-left: 4px solid #52c41a;
      }
      
      &.warning-card {
        background: linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%);
        border-left: 4px solid #faad14;
      }
      
      &.error-card {
        background: linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%);
        border-left: 4px solid #ff4d4f;
      }
      
      :deep(.ant-card-body) {
        padding: 5px;
      }
      
      .card-description {
        margin-top: 8px;
        font-size: 20px;
        color: #666;
        font-weight: 500;
      }
    }
  }
    // 价格信息区域
    .price-info-section {
    margin-bottom: 5px;
    flex-shrink: 0; // 防止收缩
    
    .price-card {
      border-radius: 7px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
      border-left: 4px solid #1890ff;
      
      :deep(.ant-card-body) {
        padding: 5px;
      }
      
      .price-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
        
        .main-price {
          display: flex;
          align-items: center;
          font-size: 18px;
          font-weight: bold;
          
          .price-label {
            color: #333;
            margin-right: 8px;
          }
          
          .price-value {
            color: #1890ff;
            font-size: 24px;
            margin: 0 4px;
          }
          
          .price-unit {
            color: #666;
            font-size: 14px;
          }
        }
        
        .price-explanation {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          
          .explanation-item {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #333;
            
            .color-indicator {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              margin-right: 6px;
              
              &.success {
                background-color: #52c41a;
              }
              
              &.danger {
                background-color: #ff4d4f;
              }
            }
          }
        }
      }
    }
  }
  
  // 自定义审核表格样式
  .custom-review-table {
    margin-top: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; // 重要：允许flex子项收缩
    // 移除固定最大高度限制，让表格自适应
    
    .review-table-card {
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background: #fff;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0; // 重要：允许flex子项收缩
      
      :deep(.ant-card-body) {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0;
        min-height: 0; // 重要：允许flex子项收缩
      }
      
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-shrink: 0; // 防止收缩
        
        h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
          font-weight: 600;
        }
        
        .table-actions {
          display: flex;
          gap: 8px;
          
          .ant-btn {
            height: 32px !important; // 统一按钮高度
            width: 80px !important; // 设置固定宽度，避免加载时宽度变化
            min-width: 80px !important; // 双重保险
            max-width: 80px !important; // 限制最大宽度
            border-radius: 4px;
            font-size: 14px;
            padding: 0 16px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important; // 确保padding包含在宽度内
            flex-shrink: 0 !important; // 防止收缩
            
            &.ant-btn-primary {
              background: #1890ff;
              border-color: #1890ff;
              
              &:hover {
                background: #40a9ff;
                border-color: #40a9ff;
              }
            }
          }
        }
      }
      
      .table-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0; // 重要：允许flex子项收缩
        
        :deep(.ant-table) {
          flex: 1;
          display: flex;
          flex-direction: column;
          
          .ant-table-container {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          
          .ant-table-content {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          
          .ant-table-tbody {
            flex: 1;
            overflow-y: auto;
            // 移除固定最大高度限制，让表格内容自适应
          }
          
          .ant-table-thead > tr > th {
            background: #fafafa;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #e8e8e8;
          }
          
          .ant-table-tbody > tr {
            transition: all 0.3s ease;
            height: 40px; // 减小行高从50px到40px
            
            &:hover {
              background: #f5f7fa;
            }
          }
          
          .ant-table-tbody > tr > td {
            border-bottom: 1px solid #f0f0f0;
            padding: 6px 8px; // 减小上下padding从12px到6px
            vertical-align: middle;
          }
        }
        
        // 分页控件居中样式 - 移到表格容器外部
        :deep(.ant-pagination) {
          display: flex !important;
          justify-content: center !important;
          margin-top: 0; // 去掉上外边距
          padding: 10px 0 16px 0; // 上内边距10px，下内边距保持16px
          width: 100%;
        }
      }
    }
  }
  
  // 价格单元格样式
  .price-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    
    .price-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .price-diff {
      font-size: 12px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
      
      &.price-higher {
        color: #ff4d4f;
        background: #fff2f0;
      }
      
      &.price-lower {
        color: #52c41a;
        background: #f6ffed;
      }
    }
  }

  // 基差单元格样式
  .basis-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 80px; // 添加最小宽度
    white-space: nowrap; // 防止文字换行
    
    .basis-value {
      font-weight: bold;
      font-size: 16px; // 确保字体大小
      
      &.basis-positive {
        color: #ff4d4f;
      }
      
      &.basis-negative {
        color: #52c41a;
      }
      
      // 0值的默认样式
      &:not(.basis-positive):not(.basis-negative) {
        color: #333;
      }
    }
  }

  // 操作按钮样式
  .action-buttons {
    display: flex;
    gap: 8px; // 添加按钮间距
    justify-content: center;
    align-items: center;
  }

  // 响应式设计 - 小屏幕适配
  @media (max-width: 768px) {
    .futures-background {
      padding: 8px;
      min-height: calc(100vh - 80px);
    }
    
    .statistics-cards {
      margin-bottom: 8px;
      
      .statistics-card {
        height: 60px;
        
        :deep(.ant-card-body) {
          padding: 4px;
        }
      }
    }
    
    .price-info-section {
      margin-bottom: 8px;
      
      .price-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        
        .main-price {
          font-size: 16px;
          
          .price-value {
            font-size: 20px;
          }
        }
      }
    }
    
    .custom-review-table {
      margin-top: 8px;
      
      .table-container {
        :deep(.ant-table) {
          .ant-table-tbody > tr {
            height: 35px;
          }
          
          .ant-table-tbody > tr > td {
            padding: 4px 6px;
            font-size: 12px;
          }
        }
      }
    }
    
    .action-buttons {
      flex-direction: column;
      gap: 4px;
      
      .ant-btn {
        width: 100% !important;
        min-width: 60px !important;
        font-size: 12px !important;
        height: 28px !important;
      }
    }
  }

  // 超小屏幕适配
  @media (max-width: 480px) {
    .futures-background {
      padding: 4px;
    }
    
    .statistics-cards {
      .statistics-card {
        height: 50px;
        
        :deep(.ant-statistic-title) {
          font-size: 12px;
        }
        
        :deep(.ant-statistic-content-value) {
          font-size: 18px !important;
        }
      }
    }
    
    .price-info-section {
      .price-content {
        .main-price {
          font-size: 14px;
          
          .price-value {
            font-size: 18px;
          }
        }
      }
    }
    
    .custom-review-table {
      .table-container {
        :deep(.ant-table) {
          .ant-table-tbody > tr {
            height: 30px;
          }
          
          .ant-table-tbody > tr > td {
            padding: 2px 4px;
            font-size: 11px;
          }
        }
      }
    }
  }
</style>