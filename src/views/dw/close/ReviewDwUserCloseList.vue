<template>
    <div class="futures-background">
      <!-- 统计卡片区域 -->
      <div class="statistics-cards">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card class="statistics-card success-card" :bordered="false">
              <a-statistic
                title="已平仓"
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
                title="平仓待审核"
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
                title="已撤销或审核不通过平仓"
                :value="statisticsData.rejectedCount"
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
              :scroll="{ x: 'max-content', y: 'calc(100vh - 500px)' }"
              row-key="id"
            >
              <!-- 平仓状态列 -->
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)" style="font-size: 16px; font-weight: bold;">
                    {{ record.status_dictText }}
                  </a-tag>
                </template>
                
                <!-- 期货产品名称列 -->
                <template v-else-if="column.key === 'quoteName'">
                  <a-tag :color="record.quoteName === '螺纹钢' ? 'orange' : 'blue'" style="font-size: 16px; font-weight: bold;">
                    {{ record.quoteName }}
                  </a-tag>
                </template>
                
                <!-- 期货产品编码列 -->
                <template v-else-if="column.key === 'quoteCode'">
                  <a-tag color="purple" style="font-size: 16px; font-weight: bold;">
                    {{ record.quoteCode }}
                  </a-tag>
                </template>
                
                <!-- 买卖方向列 -->
                <template v-else-if="column.key === 'side'">
                  <a-tag :color="getSideColor(record.side)" style="font-size: 16px; font-weight: bold;">
                    {{ getSideText(record.side) }}
                  </a-tag>
                </template>
                
                <!-- 平仓申请价格列 -->
                <template v-else-if="column.key === 'closePrice'">
                  <span :style="{ 
                    color: '#1890ff',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }">
                    {{ record.closePrice || '' }}
                  </span>
                </template>
                
                
                <!-- 盈亏估值列 -->
                <template v-else-if="column.key === 'profitLoss'">
                  <span :style="{ 
                    color: record.profitLoss >= 0 ? '#ff4d4f' : '#52c41a',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }">
                    {{ record.profitLoss >= 0 ? '+' : '' }}{{ record.profitLoss }}
                  </span>
                </template>
                
                <!-- 基差列 -->
                <template v-else-if="column.key === 'basis'">
                  <span v-if="record.basis !== null && record.basis !== undefined && record.basis !== ''" :style="{ 
                    color: record.basis >= 0 ? '#ff4d4f' : '#52c41a',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }">
                    {{ record.basis > 0 ? '+' : '' }}{{ record.basis }}
                  </span>
                  <span v-else style="color: #999; font-size: 16px;"></span>
                </template>
                
                <!-- 持仓基差列 -->
                <template v-else-if="column.key === 'positionHoldingBasis'">
                  <span v-if="record.positionHoldingBasis !== null && record.positionHoldingBasis !== undefined && record.positionHoldingBasis !== ''" :style="{ 
                    color: record.positionHoldingBasis >= 0 ? '#ff4d4f' : '#52c41a',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }">
                    {{ record.positionHoldingBasis > 0 ? '+' : '' }}{{ record.positionHoldingBasis }}
                  </span>
                </template>
                
                <!-- 持仓价格列 -->
                <template v-else-if="column.key === 'positionHoldingPrice'">
                  <span :style="{ 
                    color: '#1890ff',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }">
                    {{ record.positionHoldingPrice || '' }}
                  </span>
                </template>
                
                <!-- 平仓时间列 -->
                <template v-else-if="column.key === 'closeTime'">
                  <span>{{ formatDateTime(record.closeTime) }}</span>
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
  
      <!-- 审核对话框 -->
      <DwUserCloseAuditModal @register="registerAuditModal" @success="handleSuccess"></DwUserCloseAuditModal>
    </div>
  </template>
  
  <script lang="ts" name="dw.close-reviewDwUserClose" setup>
    import {ref, reactive, computed, unref, onMounted, onUnmounted, h} from 'vue';
    import {useModal} from '/@/components/Modal';
    import DwUserCloseAuditModal from './components/DwUserCloseAuditModal.vue'
    import {list, getUserRoles, review} from './DwUserClose.api';
    import { useUserStore } from '/@/store/modules/user';
    import { useMessage } from '/@/hooks/web/useMessage';
    import { Modal, notification } from 'ant-design-vue';
    import { getDateByPicker } from '/@/utils';
    import auditWebSocketManager from '/@/utils/auditWebSocket';
    
    //日期个性化选择
    const fieldPickers = reactive({});
    const queryParam = reactive<any>({});
    const userStore = useUserStore();
    const { createMessage } = useMessage();
    
    // 用户角色相关
    const userRoles = ref<string[]>([]);
    const isQihuoProxy = computed(() => userRoles.value.includes('期货代理人'));
    
    // 审核表格相关数据
    const reviewData = ref([]);
    const loading = ref(false);
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
    });
    
    // 审核表格列定义
    const reviewColumns = [
      {
        title: '用户',
        dataIndex: 'userId_dictText',
        key: 'userId',
        width: 80,
        align: 'center',
      },
      {
        title: '产品名称',
        dataIndex: 'productName',
        key: 'productName',
        width: 100,
        align: 'center',
      },
      {
        title: '期货产品名称',
        dataIndex: 'quoteName',
        key: 'quoteName',
        width: 100,
        align: 'center',
      },
      {
        title: '期货产品编码',
        dataIndex: 'quoteCode',
        key: 'quoteCode',
        width: 100,
        align: 'center',
      },
      {
        title: '买卖方向',
        dataIndex: 'side_dictText',
        key: 'side',
        width: 80,
        align: 'center',
      },
      {
        title: '平仓数量',
        dataIndex: 'closeQty',
        key: 'closeQty',
        width: 80,
        align: 'center',
      },
      {
        title: '平仓申请价格',
        dataIndex: 'closePrice',
        key: 'closePrice',
        width: 100,
        align: 'center',
      },
      {
        title: '持仓价格',
        dataIndex: 'positionHoldingPrice',
        key: 'positionHoldingPrice',
        width: 100,
        align: 'center',
      },
      {
        title: '平仓申请基差',
        dataIndex: 'basis',
        key: 'basis',
        width: 100,
        align: 'center',
      },
      {
        title: '持仓基差',
        dataIndex: 'positionHoldingBasis',
        key: 'positionHoldingBasis',
        width: 100,
        align: 'center',
      },

      {
        title: '盈亏估值',
        dataIndex: 'profitLoss',
        key: 'profitLoss',
        width: 100,
        align: 'center',
      },
      {
        title: '平仓时间',
        dataIndex: 'closeTime',
        key: 'closeTime',
        width: 120,
        align: 'center',
      },
      {
        title: '平仓状态',
        dataIndex: 'status_dictText',
        key: 'status',
        width: 100,
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
    
    //注册model
    const [registerAuditModal, {openModal: openAuditModal}] = useModal();
    
    // 统计数据
    const statisticsData = reactive({
      completedCount: 0,    // 已审核通过数（状态=5）
      pendingCount: 0,      // 待审核数（状态=1）
      rejectedCount: 0      // 审核不通过数（状态=4）
    });
    
    // 添加审核数据轮询定时器
    let reviewDataPollingTimer: NodeJS.Timeout | null = null;
    // 审核通知WebSocket连接
    let auditWs: WebSocket | null = null;
    
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
  
    // 启动审核数据轮询
    const startReviewDataPolling = () => {
      fetchReviewData();
      fetchStatisticsData();
      
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

    // 启动审核通知WebSocket连接
    const startAuditWebSocket = () => {
      try {
        const token = userStore.getToken;
        if (!token) {
          console.error('用户token不存在，无法建立审核通知WebSocket连接');
          return;
        }
        
        // 使用全局WebSocket管理器，避免重复连接
        console.log('🔌 [ReviewDwUserCloseList] 使用全局WebSocket管理器');
        
        // 注册消息处理器
        const handlerKey = 'ReviewDwUserCloseList';
        auditWebSocketManager.registerHandler(handlerKey, (data) => {
          try {
            if (data.type === 'audit_notice' && data.content && data.content.includes('平仓')) {
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

    // 停止审核通知WebSocket连接
    const stopAuditWebSocket = () => {
      // 注销消息处理器
      const handlerKey = 'ReviewDwUserCloseList';
      auditWebSocketManager.unregisterHandler(handlerKey);
      console.log('🔌 [ReviewDwUserCloseList] 已注销WebSocket处理器');
    };
  
    // 获取统计数据
    const fetchStatisticsData = async () => {
      try {
        const params = {
          ...queryParam,
          pageNo: 1,
          pageSize: 999999,
          ...fieldPickers
        };
        
        if (params && fieldPickers) {
          for (let key in fieldPickers) {
            if (params[key]) {
              params[key] = getDateByPicker(params[key], fieldPickers[key]);
            }
          }
        }
        
        const result = await list(params);
        
        if (result && result.records && Array.isArray(result.records)) {
          const allData = result.records;
          
          statisticsData.completedCount = allData.filter(item => item.status === 3).length;
          statisticsData.pendingCount = allData.filter(item => item.status === 1).length;
          statisticsData.rejectedCount = allData.filter(item => item.status === 4).length;
        } else {
          statisticsData.completedCount = 0;
          statisticsData.pendingCount = 0;
          statisticsData.rejectedCount = 0;
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
        statisticsData.completedCount = 0;
        statisticsData.pendingCount = 0;
        statisticsData.rejectedCount = 0;
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
          column: 'closeTime',
          order: 'desc',
          ...fieldPickers
        };
        
        if (params && fieldPickers) {
          for (let key in fieldPickers) {
            if (params[key]) {
              params[key] = getDateByPicker(params[key], fieldPickers[key]);
            }
          }
        }
        
        const result = await list(params);
        
        if (result && result.records) {
          reviewData.value = result.records;
          pagination.total = result.total || 0;
        } else {
          reviewData.value = [];
          pagination.total = 0;
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
    
    // 获取状态颜色
    const getStatusColor = (status: number) => {
      switch(status) {
        case 1: return 'orange';  // 待审核
        case 3: return 'green';   // 审核通过
        case 4: return 'red';     // 审核不通过
        default: return 'default';
      }
    };
    
    // 获取买卖方向颜色
    const getSideColor = (side: string) => {
      switch(side) {
        case '1': return 'red';     // 多单平仓
        case '2': return 'green';   // 空单平仓
        case '3': return 'blue';    // 正套平仓
        case '4': return 'orange';  // 反套平仓
        default: return 'default';
      }
    };
    
    // 获取买卖方向文字
    const getSideText = (side: string) => {
      switch(side) {
        case '1': return '多单平仓';
        case '2': return '空单平仓';
        case '3': return '正套平仓';
        case '4': return '反套平仓';
        default: return '-';
      }
    };
    
    // 检查是否可以审核
    const canAudit = (record: any) => {
      return record.status === 1;
    };
    
    // 审核通过
    const handleConfirmAudit = async (record: any) => {
      let dealPrice = '';
      let dealBasis = '';
      const showPriceInput = !!record.closePrice;
      const showBasisInput = !!record.basis;
      
      Modal.confirm({
        title: '确认审核通过',
        content: h('div', [
          h('p', `确定要审核通过用户 "${record.userId_dictText}" 的平仓申请吗？`),
          h('div', { style: 'margin-top: 16px;' }, [
            showPriceInput && h('div', { style: 'margin-bottom: 12px;' }, [
              h('label', { style: 'display: block; margin-bottom: 8px; font-weight: bold;' }, '成交价格'),
              h('input', {
                type: 'number',
                placeholder: '请输入成交价格',
                style: 'width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;',
                onInput: (e: any) => {
                  dealPrice = e.target.value;
                }
              })
            ]),
            showBasisInput && h('div', { style: 'margin-bottom: 12px;' }, [
              h('label', { style: 'display: block; margin-bottom: 8px; font-weight: bold;' }, '成交基差'),
              h('input', {
                type: 'number',
                placeholder: '请输入成交基差',
                style: 'width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;',
                onInput: (e: any) => {
                  dealBasis = e.target.value;
                }
              })
            ]),
            (showPriceInput && showBasisInput) && h('div', { style: 'color:#999; font-size: 12px; margin-top: 4px;' }, '成交价格与成交基差至少填写一个'),
            (!showPriceInput && !showBasisInput) && h('div', { style: 'color:#999; font-size: 12px; margin-top: 4px;' }, '该申请未提供可填写的成交字段')
          ])
        ]),
        okText: '确认通过',
        cancelText: '取消',
        okType: 'primary',
        onOk: async () => {
          // 校验：只显示一个字段时该字段必填；两者都显示时至少填一个
          if (showPriceInput && !showBasisInput) {
            if (!dealPrice || isNaN(Number(dealPrice))) {
              createMessage.error('请输入成交价格');
              return Promise.reject();
            }
          } else if (!showPriceInput && showBasisInput) {
            if (!dealBasis || isNaN(Number(dealBasis))) {
              createMessage.error('请输入成交基差');
              return Promise.reject();
            }
          } else if (showPriceInput && showBasisInput) {
            if ((!dealPrice || isNaN(Number(dealPrice))) && (!dealBasis || isNaN(Number(dealBasis)))) {
              createMessage.error('请输入成交价格或成交基差');
              return Promise.reject();
            }
          }
          
          try {
            const payload: any = {
              closeId: record.id,
              status: 3,
            };
            if (showPriceInput && dealPrice && !isNaN(Number(dealPrice))) {
              payload.transactionPrice = parseFloat(dealPrice);
            }
            if (showBasisInput && dealBasis && !isNaN(Number(dealBasis))) {
              payload.basis = parseFloat(dealBasis);
            }
            
            await review(payload);
            
            createMessage.success('审核通过');
            fetchReviewData();
            fetchStatisticsData();
          } catch (error) {
            console.error('审核通过失败:', error);
            createMessage.error('审核通过失败');
          }
        }
      });
    };
    
    // 审核不通过
    const handleRejectAudit = (record: any) => {
      openAuditModal(true, {
        record: {
          closeId: record.id,
          status: 4 // 预填状态为4
        },
        isAudit: true,
        auditType: 'reject',
        showFooter: true,
      });
    };
  
    // 成功回调
    function handleSuccess() {
      fetchReviewData();
      fetchStatisticsData();
    }
  
    // 组件挂载时获取用户角色和启动数据轮询
    onMounted(() => {
      fetchUserRoles();
      startAuditWebSocket();
      startReviewDataPolling();
    });
  
    // 组件卸载时清理定时器
    onUnmounted(() => {
      stopReviewDataPolling();
      stopAuditWebSocket();
    });
  </script>
  
  <style lang="less" scoped>
    // 期货后台整体背景
    .futures-background {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 16px;
      min-height: calc(100vh - 110px);
      display: flex;
      flex-direction: column;
      overflow: auto;
      
      // 小屏幕适配
      @media (max-width: 768px) {
        padding: 8px;
        min-height: calc(100vh - 80px);
      }
    }
    
    // 统计卡片区域
    .statistics-cards {
      margin-bottom: 10px;
      flex-shrink: 0;
      
      // 小屏幕适配
      @media (max-width: 768px) {
        margin-bottom: 8px;
        
        .ant-col {
          margin-bottom: 8px;
        }
      }
      
      .statistics-card {
        text-align: center;
        height: 70px;
        border-radius: 7px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        overflow: hidden;
        
        // 小屏幕适配
        @media (max-width: 768px) {
          height: 60px;
        }
        
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
      }
    }
    
    // 自定义审核表格样式
    .custom-review-table {
      margin-top: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      
      // 小屏幕适配
      @media (max-width: 768px) {
        margin-top: 8px;
      }
      
      .review-table-card {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        background: #fff;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        
        :deep(.ant-card-body) {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 16px;
          min-height: 0;
          
          // 小屏幕适配
          @media (max-width: 768px) {
            padding: 8px;
          }
        }
        
        .table-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
          
          :deep(.ant-table) {
            flex: 1;
            display: flex;
            flex-direction: column;
            
            .ant-table-container {
              flex: 1;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            
            .ant-table-content {
              flex: 1;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            
            .ant-table-tbody {
              flex: 1;
              overflow-y: auto;
              max-height: calc(100vh - 400px);
              
              // 小屏幕适配
              @media (max-width: 768px) {
                max-height: calc(100vh - 300px);
              }
            }
            
            .ant-table-thead > tr > th {
              background: #fafafa;
              font-weight: 600;
              color: #333;
              border-bottom: 2px solid #e8e8e8;
            }
            
            .ant-table-tbody > tr {
              transition: all 0.3s ease;
              height: 40px;
              
              // 小屏幕适配
              @media (max-width: 768px) {
                height: 35px;
              }
              
              &:hover {
                background: #f5f7fa;
              }
            }
            
            .ant-table-tbody > tr > td {
              border-bottom: 1px solid #f0f0f0;
              padding: 8px 8px;
              vertical-align: middle;
              
              // 小屏幕适配
              @media (max-width: 768px) {
                padding: 6px 4px;
                font-size: 12px;
              }
            }
            
            // 小屏幕下的表格头部样式
            @media (max-width: 768px) {
              .ant-table-thead > tr > th {
                padding: 8px 4px;
                font-size: 12px;
              }
            }
          }
          
          :deep(.ant-pagination) {
            display: flex !important;
            justify-content: center !important;
            margin-top: 16px;
            padding: 16px 0;
            width: 100%;
          }
        }
      }
    }
    
    // 操作按钮样式
    .action-buttons {
      display: flex;
      gap: 6px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      
      // 小屏幕适配
      @media (max-width: 768px) {
        gap: 4px;
        flex-direction: row;
        justify-content: center;
      }
      
      .ant-btn {
        border-radius: 4px;
        font-size: 11px;
        height: 24px;
        padding: 0 8px;
        min-width: 60px;
        white-space: nowrap;
        
        // 小屏幕适配
        @media (max-width: 768px) {
          font-size: 10px;
          height: 22px;
          padding: 0 6px;
          min-width: 50px;
        }
        
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
  </style>