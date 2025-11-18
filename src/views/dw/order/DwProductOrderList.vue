<template>
  <div class="stock-trading-dashboard">
    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-header">
          <h3>{{getStatsTitle()}}</h3>
          <div class="time-filter">
            <a-radio-group v-model:value="timeFilter" @change="handleTimeFilterChange" size="small">
              <a-radio-button value="day">日</a-radio-button>
              <a-radio-button value="week">周</a-radio-button>
              <a-radio-button value="month">月</a-radio-button>
            </a-radio-group>
            <div class="time-range-tip">{{ getTimeRangeTip() }}</div>
          </div>
        </div>
        <div class="stats-content">
          <div class="stats-item"> 
            <span class="label">成交单数</span>
            <span class="value amount">{{statsData.totalAmount }}</span>
          </div>
          <div class="stats-item">
            <span class="label">成交车数</span>
            <span class="value count">{{ statsData.sumQty }}</span>
          </div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-header">
          <h3>买卖统计</h3>
        </div>
        <div class="stats-content">
          <div class="stats-item">
            <span class="label buy">买入车数</span>
            <span class="value buy">{{ statsData.buyQty }}</span>
          </div>
          <div class="stats-item">
            <span class="label sell">卖出车数</span>
            <span class="value sell">{{ statsData.sellQty }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 交易订单列表 -->
    <div class="trading-table-container">
      <!-- 表格 -->
      <a-table
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        @change="handleTableChange"
        :scroll="{ x: 1800 }"
        row-key="id"
        :loading="loading"
        size="small"
      >
        <!-- 买卖方向列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'side'">
            <a-tag 
              :color="getSideColor(record.side)" 
              style="font-size: 14px; font-weight: bold;"
            >
              {{ getSideText(record.side) }}
            </a-tag>
          </template>
          
          <!-- 订单状态列 -->
          <template v-else-if="column.key === 'status'">
            <a-tag 
              :color="getStatusColor(record.status_dictText)" 
              style="font-size: 14px; font-weight: bold;"
            >
              {{ record.status_dictText }}
            </a-tag>
          </template>
          
          <!-- 数量相关列 -->
          <template v-else-if="column.key === 'qty'">
            <span class="quantity">{{ record.qty }}</span>
          </template>
          
          <template v-else-if="column.key === 'frozenQty'">
            <span class="quantity">{{ record.frozenQty }}</span>
          </template>
          
          <template v-else-if="column.key === 'positionHoldingQty'">
            <span class="quantity">{{ record.positionHoldingQty }}</span>
          </template>
          
          <!-- 价格相关列 -->
          <template v-else-if="column.key === 'price'">
            <span class="price">{{ record.price }}</span>
          </template>
          
          <template v-else-if="column.key === 'transactionPrice'">
            <span class="price">{{ record.transactionPrice }}</span>
          </template>
          
          <template v-else-if="column.key === 'transactionBasis'">
            <span class="price">{{ record.transactionBasis }}</span>
          </template>
          
          <template v-else-if="column.key === 'basis'">
            <span class="price">{{ record.basis }}</span>
          </template>
          
          <template v-else-if="column.key === 'profitValuation'">
            <span class="price">{{ record.profitValuation }}</span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 订单弹窗 -->
    <DwProductOrderModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" name="dw.order-dwProductOrder" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useModal } from '/@/components/Modal';
  import DwProductOrderModal from './components/DwProductOrderModal.vue';
  import { list, getUserRoles } from './DwProductOrder.api';
  import { getDateByPicker } from '/@/utils';
  import { defHttp } from '/@/utils/http/axios';

  // 用于高级查询选择
  const fieldPickers = reactive({});
  const queryParam = reactive<any>({});
  const timeFilter = ref('day');

  // 用户store
  // const userStore = useUserStore();
  
  // 表格数据
  const tableData = ref([]);
  const loading = ref(false);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });

  // 表格列定义
  const tableColumns = [
    {
      title: "订单号",
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 100,
      align: 'center',
      fixed: 'left',
    },
    {
      title: '审核员',
      dataIndex: 'createBy_dictText',
      key: 'createBy',
      width: 80,
      align: 'center',
    },
    {
      title: '下单用户',
      dataIndex: 'userId_dictText',
      key: 'userId',
      width: 100,
      align: 'center',
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 120,
      align: 'center',
    },
    {
      title: '期货产品名称',
      dataIndex: 'quoteName',
      key: 'quoteName',
      width: 120,
      align: 'center',
    },
    {
      title: '期货产品合约号',
      dataIndex: 'quoteCode',
      key: 'quoteCode',
      width: 120,
      align: 'center',
    },
    {
      title: '买卖方向',
      dataIndex: 'side',
      key: 'side',
      width: 90,
      align: 'center',
    },
    {
      title: '交易车数',
      dataIndex: 'qty',
      key: 'qty',
      width: 80,
      align: 'center',
    },
    {
      title: '冻结车数',
      dataIndex: 'frozenQty',
      key: 'frozenQty',
      width: 80,
      align: 'center',
    },
    {
      title: '持仓',
      dataIndex: 'positionHoldingQty',
      key: 'positionHoldingQty',
      width: 80,
      align: 'center',
    },
    {
      title: '报价价格',
      dataIndex: 'price',
      key: 'price',
      width: 90,
      align: 'center',
    },
    {
      title: '成交价格',
      dataIndex: 'transactionPrice',
      key: 'transactionPrice',
      width: 90,
      align: 'center',
    },
    {
      title: '成交基差',
      dataIndex: 'transactionBasis',
      key: 'transactionBasis',
      width: 90,
      align: 'center',
    },
    {
      title: '基差',
      dataIndex: 'basis',
      key: 'basis',
      width: 80,
      align: 'center',
    },
    {
      title: '订单状态',
      dataIndex: 'status_dictText',
      key: 'status',
      width: 90,
      align: 'center',
    },
    {
      title: '盈利估值',
      dataIndex: 'profitValuation',
      key: 'profitValuation',
      width: 90,
      align: 'center',
    },
    {
      title: '成交时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120,
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 100,
      align: 'center',
    },
  ];

  // 获取统计标题
  const getStatsTitle = () => {
    switch (timeFilter.value) {
      case 'day':
        return '今日成交';
      case 'week':
        return '本周成交';
      case 'month':
        return '本月成交';
      default:
        return '今日成交';
    }
  };
  
  // 统计数据
  const statsData = reactive({
    totalAmount: 0,
    sumQty: 0,  // 成交车数
    buyQty: 0,  // 买入车数
    sellQty: 0, // 卖车数
  });

  // 用户角色相关
  const userRoles = ref<string[]>([]);
  // const isQihuoProxy = computed(() => userRoles.value.includes('期货代理人'));

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

  //注册model
  const [registerModal] = useModal();

  // 获取表格数据
  const fetchTableData = async () => {
    loading.value = true;
    try {
      const params = {
        ...queryParam,
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
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
      
      if (result && result.records) {
        // 处理数据，确保冻结车数字段正确显示，并过滤掉已平仓的订单
        const processedRecords = result.records
          .filter(record => {
            // 过滤掉状态为3（已平仓）的订单
            return record.status !== 3 && record.status !== '3';
          })
          .map(record => {
            // 冻结车数应该根据用户的持仓情况动态计算
            // 如果frozenQty为空或未定义，设置为0
            record.frozenQty = record.frozenQty || 0;
            return record;
          });
        
        tableData.value = processedRecords;
        pagination.total = processedRecords.length; // 使用过滤后的数据长度
      } else {
        tableData.value = [];
        pagination.total = 0;
      }
    } catch (error) {
      console.error('获取表格数据失败:', error);
      tableData.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  };

  // 表格变化处理
  const handleTableChange = (pag: any) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchTableData();
  };

  // 获取统计数据
  const fetchStatsData = async () => {
    try {
      const params = {
        timeFilter: timeFilter.value,
        status: '2', // 只统计已成交的订单
      };
      const response = await defHttp.get({
        url: '/dw/order/dwProductOrder/stats',
        params,
      });
      if (response) {
        statsData.totalAmount = response.totalAmount;
        statsData.sumQty = response.sumQty;
        statsData.buyQty = response.buyQty;
        statsData.sellQty = response.sellQty;
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  // 时间筛选变化
  const handleTimeFilterChange = () => {
    fetchStatsData();
  };

  // 获取时间范围提示
  const getTimeRangeTip = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (timeFilter.value) {
      case 'day':
        return `今日：${today.toLocaleDateString('zh-CN')}`;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `本周：${weekStart.toLocaleDateString('zh-CN')} - ${weekEnd.toLocaleDateString('zh-CN')}`;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return `本月：${monthStart.toLocaleDateString('zh-CN')} - ${monthEnd.toLocaleDateString('zh-CN')}`;
      default:
        return '';
    }
  };

  // 获取买卖方向颜色
  const getSideColor = (side: string) => {
    switch (side) {
      case '1': return 'red';     // 多单平仓
      case '2': return 'green';   // 空单平仓
      case '3': return 'blue';    // 正套平仓
      case '4': return 'orange';  // 反套平仓
      default: return 'default';
    }
  };

  // 获取买卖方向文字
  const getSideText = (side: string) => {
    switch (side) {
      case '1': return '多单平仓';
      case '2': return '空单平仓';
      case '3': return '正套平仓';
      case '4': return '反套平仓';
      default: return '-';
    }
  };

  // 获取状态颜色
  const getStatusColor = (statusText: string) => {
    switch (statusText) {
      case '未成交':
        return 'orange';
      case '已成交':
        return 'green';
      case '已取消':
        return 'default';
      case '已拒绝':
        return 'red';
      case '已结束':
        return 'blue';
      case '平仓待审核':
        return 'orange';
      default:
        return 'default';
    }
  };


  /**
   * 成功回调
   */
  function handleSuccess() {
    fetchTableData();
    fetchStatsData(); // 刷新统计数据
  }

  // 组件挂载时获取统计数据和用户角色
  onMounted(() => {
    fetchStatsData();
    fetchUserRoles();
    fetchTableData();
  });
</script>
<style lang="less" scoped>
  .stock-trading-dashboard {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    color: #334155;
    min-height: 100%;
    padding: 20px;

    .stats-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 10px;

      .stats-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
          border-color: #3b82f6;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 8px;

          h3 {
            color: #1e293b;
            font-size: 16px;
            font-weight: 700;
            margin: 0;
          }

          .time-filter {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;

            :deep(.ant-radio-group) {
              display: flex;
              gap: 4px;

              .ant-radio-button-wrapper {
                background: #f8fafc;
                border-color: #e2e8f0;
                color: #64748b;
                border-radius: 6px;
                margin-right: 0;
                min-width: 60px;
                padding: 4px 12px;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 28px;

                &:hover {
                  background: #e2e8f0;
                  border-color: #3b82f6;
                  color: #3b82f6;
                }

                &.ant-radio-button-wrapper-checked {
                  background: #3b82f6;
                  border-color: #3b82f6;
                  color: #ffffff;
                  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                }
              }
            }

            .time-range-tip {
              font-size: 11px;
              color: #94a3b8;
              font-weight: 400;
              text-align: right;
              line-height: 1.2;
            }
          }
        }

        .stats-content {
          .stats-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 6px 0;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              color: #64748b;
              font-size: 13px;
              font-weight: 500;

              &.buy {
                color: #dc2626;
              }

              &.sell {
                color: #059669;
              }
            }

            .value {
              font-size: 14px;
              font-weight: 700;

              &.amount,
              &.price {
                color: #dc2626;
                font-weight: bold;
              }

              &.count {
                color: #1e293b;
              }

              &.buy {
                color: #dc2626;
              }

              &.sell {
                color: #059669;
              }

              &.positive {
                color: #dc2626;
              }

              &.negative {
                color: #059669;
              }
            }
          }
        }
      }
    }

    .trading-table-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      :deep(.ant-table) {
        background: transparent;
        color: #1e293b;

        .ant-table-thead > tr > th {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          color: #374151;
          font-weight: 600;
          font-size: 13px;
          padding: 8px 12px;
        }

        .ant-table-tbody > tr {
          background: #ffffff;

          &:hover > td {
            background: #f8fafc !important;
          }

          > td {
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
            padding: 8px 12px;
            font-size: 13px;
          }
        }

        .ant-table-pagination {
          background: #f8fafc;
          padding: 12px 20px;
          border-top: 1px solid #e2e8f0;

          .ant-pagination-item {
            background: #ffffff;
            border-color: #e2e8f0;
            border-radius: 6px;
            min-width: 28px;
            height: 28px;

            a {
              color: #64748b;
              font-size: 12px;
            }

            &:hover {
              border-color: #3b82f6;
              background: #f8fafc;

              a {
                color: #3b82f6;
              }
            }

            &.ant-pagination-item-active {
              background: #3b82f6;
              border-color: #3b82f6;

              a {
                color: #ffffff;
              }
            }
          }

          .ant-pagination-prev,
          .ant-pagination-next {
            background: #ffffff;
            border-color: #e2e8f0;
            color: #64748b;
            border-radius: 6px;
            min-width: 28px;
            height: 28px;

            &:hover {
              border-color: #3b82f6;
              color: #3b82f6;
              background: #f8fafc;
            }
          }
        }
      }
    }

    // 自定义样式 - 价格和基差字体更大
    .price {
      color: #059669;
      font-weight: 600;
      font-size: 16px; // 增加字体大小
    }

    .quantity {
      color: #1e293b;
      font-weight: 500;
      font-size: 14px; // 保持原有大小
    }
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }

  :deep(.ant-picker),
  :deep(.ant-input-number) {
    width: 100%;
    background: #ffffff;
    border-color: #e2e8f0;
    color: #1e293b;
    border-radius: 6px;

    &:hover,
    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  // 搜索表单样式优化
  :deep(.ant-form) {
    .ant-form-item {
      margin-bottom: 16px;
    }

    .ant-input,
    .ant-select-selector {
      background: #ffffff;
      border-color: #e2e8f0;
      border-radius: 6px;
      color: #1e293b;

      &:hover,
      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .ant-select-selection-item {
      color: #1e293b;
    }
  }

  // 表格文字颜色修复 - 确保所有文字都是深色
  :deep(.ant-table-tbody > tr > td) {
    color: #1e293b !important;
  }

  :deep(.ant-table-thead > tr > th) {
    color: #374151 !important;
  }

  :deep(.ant-btn) {
    color: #64748b !important;
  }

  :deep(.ant-btn-primary) {
    color: #ffffff !important;
  }

  // 操作按钮文字颜色
  :deep(.ant-table-tbody .ant-btn-link) {
    color: #3b82f6 !important;
  }

  // 确保所有表格内容文字都是深色
  :deep(.ant-table-tbody) {
    color: #1e293b !important;
  }
</style>
