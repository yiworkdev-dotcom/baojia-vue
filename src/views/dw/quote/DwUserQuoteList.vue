<template>
  <div class="futures-background">

    <!--引用表格-->
   <BasicTable @register="registerTable" :rowSelection="rowSelection">

    </BasicTable>
    <!-- 表单区域 -->
    <DwUserQuoteModal @register="registerModal" @success="handleSuccess"></DwUserQuoteModal>
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
  import {list, deleteOne, batchDelete, getImportUrl,getExportUrl, getMainProductPrice as fetchMainProductPrice, getUserRoles} from './DwUserQuote.api';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getDateByPicker } from '/@/utils';
  
  //日期个性化选择
  const fieldPickers = reactive({
  });
  const queryParam = reactive<any>({});
  const checkedKeys = ref<Array<string | number>>([]);
  const userStore = useUserStore();
  const { createMessage } = useMessage();
  
  // 带钢价格响应式数据
  const mainProductPrice = ref(0);
  // 带钢卖出价格响应式数据
  const mainProductSellPrice = ref(0);
  // 用户角色相关
  const userRoles = ref<string[]>([]);
  const isQihuoProxy = computed(() => userRoles.value.includes('期货代理人'));
  
  // WebSocket连接
  let ws: WebSocket | null = null;
  
  //注册model
  const [registerModal, {openModal}] = useModal();
  const [registerAuditModal, {openModal: openAuditModal}] = useModal();
    // 统计数据
    const statisticsData = reactive({
    completedCount: 0,    // 成交数（平仓状态=5）
    pendingCount: 0,      // 带成交数（平仓状态=1）
    cancelledCount: 0     // 撤单数（撤单时间不为空）
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

  // 停止WebSocket连接
  const stopWebSocket = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  };

  // 轮询方式（作为备用）
  let pricePollingTimer: NodeJS.Timeout | null = null;
  
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
      
      // 处理日期参数
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
        
        // 计算统计数据
        statisticsData.completedCount = allData.filter(item => item.status === 5).length;
        statisticsData.pendingCount = allData.filter(item => item.status === 1 || item.status === 2 || item.status === 3).length;
        statisticsData.cancelledCount = allData.filter(item => item.cancellationTime && item.cancellationTime.trim() !== '').length;
      } else {
        // 如果没有数据，重置统计
        statisticsData.completedCount = 0;
        statisticsData.pendingCount = 0;
        statisticsData.cancelledCount = 0;
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 出错时重置统计
      statisticsData.completedCount = 0;
      statisticsData.pendingCount = 0;
      statisticsData.cancelledCount = 0;
    }
  };
  
  //注册table数据
  const { prefixCls,tableContext,onExportXls,onImportXls } = useListPage({
      tableProps:{
           title: '用户报价表',
           api: list,
           columns,
           canResize:true,
           formConfig: {
              //labelWidth: 120,
              schemas: searchFormSchema,
              autoSubmitOnEnter:true,
              showAdvancedButton:true,
              fieldMapToNumber: [
              ],
              fieldMapToTime: [
              ],
            },
           beforeFetch: (params) => {
              if (params && fieldPickers) {
                for (let key in fieldPickers) {
                  if (params[key]) {
                    params[key] = getDateByPicker(params[key], fieldPickers[key]);
                  }
                }
              }
              
              return Object.assign(params, queryParam);
            },
                        // 监听数据变化，重新计算统计
                        afterFetch: (dataSource) => {
              // 当表格数据加载完成后，重新获取统计数据
              fetchStatisticsData();
            }
      },
       exportConfig: {
            name:"用户报价表",
            url: getExportUrl,
            params: queryParam,
          },
          importConfig: {
            url: getImportUrl,
            success: handleSuccess
          },
  })

  const [registerTable, {reload},{ rowSelection, selectedRowKeys }] = tableContext

  // 高级查询配置
  const superQueryConfig = reactive(superQuerySchema);

  // 组件挂载时获取用户角色和启动WebSocket连接
  onMounted(() => {
    fetchUserRoles();
    startWebSocket();
    fetchStatisticsData();
  });

  // 组件卸载时停止WebSocket连接
  onUnmounted(() => {
    stopWebSocket();
    stopPricePolling();
  });

  /**
   * 高级查询事件
   */
  function handleSuperQuery(params) {
    Object.keys(params).map((k) => {
      queryParam[k] = params[k];
    });
    reload();
  }
   /**
    * 新增事件
    */
  function handleAdd() {
     openModal(true, {
       isUpdate: false,
       showFooter: true,
     });
  }
   /**
    * 编辑事件
    */
  function handleEdit(record: Recordable) {
     openModal(true, {
       record,
       isUpdate: true,
       showFooter: true,
     });
   }
   /**
    * 详情
   */
  function handleDetail(record: Recordable) {
     openModal(true, {
       record,
       isUpdate: true,
       showFooter: false,
     });
   }
   
   
   /**
    * 删除事件
    */
  async function handleDelete(record) {
     await deleteOne({id: record.id}, handleSuccess);
   }
   /**
    * 批量删除事件
    */
  async function batchHandleDelete() {
     await batchDelete({ids: selectedRowKeys.value}, handleSuccess);
   }
   /**
    * 成功回调
    */
  function handleSuccess() {
      (selectedRowKeys.value = []) && reload();
   }

</script>

<style lang="less" scoped>
  :deep(.ant-picker),:deep(.ant-input-number){
    width: 100%;
  }
    // 期货后台整体背景
    .futures-background {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 16px;
  }
  
  // 统计卡片区域
  .statistics-cards {
    margin-bottom: 20px;
    
    .statistics-card {
      border-radius: 12px;
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
        padding: 20px;
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
    margin-bottom: 20px;
    
    .price-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
      border-left: 4px solid #1890ff;
      
      :deep(.ant-card-body) {
        padding: 16px 20px;
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
  .price-info {
    display: flex;
    align-items: center;
    margin-left: 16px;
    gap: 12px;
    
    .main-price {
      font-weight: bold;
      color: #000000;
      font-size: 18px;
      background: #f0f8ff;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #d6e4ff;
    }
    
    .price-explanation {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
  }
</style>