<template>
  <div class="stock-trading-dashboard">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">
            <Icon icon="ant-design:line-chart-outlined" class="title-icon" />
            带钢现货交易系统
          </h1>
          <p class="subtitle">实时价格监控与配置管理</p>
        </div>
        <div class="header-actions">
          <!-- <a-button
            type="primary"
            size="large"
            class="action-btn primary-btn"
            v-auth="'dw.product.xian:dw_main_product:add'"
            @click="handleAdd"
            preIcon="ant-design:plus-outlined"
          >
            新增产品
          </a-button> -->
        </div>
      </div>
    </div>

    <!-- 实时价格看板 -->
    <div class="price-board">
      <div class="board-header">
        <div class="board-title">
          <Icon icon="ant-design:dashboard-outlined" class="board-icon" />
          <span>实时价格看板</span>
        </div>
        <div class="board-status">
          <div class="status-indicator live"></div>
          <span>实时更新</span>
        </div>
      </div>

      <div class="board-content">
        <BasicTable @register="registerLatestTable" :rowSelection="rowSelection" class="price-table">
          <!--插槽:table标题-->
          <template #tableTitle>
            <div class="table-actions">
              <a-dropdown v-if="selectedRowKeys.length > 0">
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="batchHandleDelete">
                      <Icon icon="ant-design:delete-outlined" />
                      批量删除
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button class="batch-btn" v-auth="'dw.product.xian:dw_main_product:deleteBatch'">
                  <Icon icon="ant-design:setting-outlined" />
                  批量操作
                  <Icon icon="mdi:chevron-down" />
                </a-button>
              </a-dropdown>
            </div>
          </template>

          <!--字段回显插槽-->
          <template v-slot:bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'price'">
              <div class="price-control">
                <a-button class="price-btn decrease-btn" size="small" @click="handlePriceChange(record, 'price', -1)">
                  <Icon icon="ant-design:minus-outlined" />
                </a-button>
                <div class="price-display">
                  <a-input-number
                    v-if="editingPrice[record.id] === 'price'"
                    v-model:value="editingValues[record.id]"
                    :min="0"
                    :precision="0"
                    class="price-input"
                    @blur="handlePriceInputBlur(record, 'price')"
                    @pressEnter="handlePriceInputEnter(record, 'price')"
                    @keyup.esc="cancelPriceEdit(record.id)"
                    ref="priceInputRef"
                  />
                  <span 
                    v-else 
                    class="price-value clickable" 
                    @click="startPriceEdit(record, 'price')"
                  >
                    {{ getDisplayPrice(record, 'price') }}
                  </span>
                  <span class="price-unit">元/吨</span>
                </div>
                <a-button class="price-btn increase-btn" size="small" @click="handlePriceChange(record, 'price', 1)">
                  <Icon icon="ant-design:plus-outlined" />
                </a-button>
              </div>
            </template>
            <template v-if="column.dataIndex === 'sellPrice'">
              <div class="price-control">
                <a-button class="price-btn decrease-btn" size="small" @click="handlePriceChange(record, 'sellPrice', -1)">
                  <Icon icon="ant-design:minus-outlined" />
                </a-button>
                <div class="price-display">
                  <a-input-number
                    v-if="editingPrice[record.id] === 'sellPrice'"
                    v-model:value="editingValues[record.id]"
                    :min="0"
                    :precision="0"
                    class="price-input"
                    @blur="handlePriceInputBlur(record, 'sellPrice')"
                    @pressEnter="handlePriceInputEnter(record, 'sellPrice')"
                    @keyup.esc="cancelPriceEdit(record.id)"
                    ref="sellPriceInputRef"
                  />
                  <span 
                    v-else 
                    class="price-value clickable" 
                    @click="startPriceEdit(record, 'sellPrice')"
                  >
                    {{ getDisplayPrice(record, 'sellPrice') }}
                  </span>
                  <span class="price-unit">元/吨</span>
                </div>
                <a-button class="price-btn increase-btn" size="small" @click="handlePriceChange(record, 'sellPrice', 1)">
                  <Icon icon="ant-design:plus-outlined" />
                </a-button>
              </div>
            </template>
            <template v-if="column.dataIndex === 'buyPrice'">
              <div class="price-control">
                <a-button class="price-btn decrease-btn" size="small" @click="handlePriceChange(record, 'buyPrice', -1)">
                  <Icon icon="ant-design:minus-outlined" />
                </a-button>
                <div class="price-display">
                  <a-input-number
                    v-if="editingPrice[record.id] === 'buyPrice'"
                    v-model:value="editingValues[record.id]"
                    :min="0"
                    :precision="0"
                    class="price-input"
                    @blur="handlePriceInputBlur(record, 'buyPrice')"
                    @pressEnter="handlePriceInputEnter(record, 'buyPrice')"
                    @keyup.esc="cancelPriceEdit(record.id)"
                    ref="buyPriceInputRef"
                  />
                  <span 
                    v-else 
                    class="price-value clickable" 
                    @click="startPriceEdit(record, 'buyPrice')"
                  >
                    {{ getDisplayPrice(record, 'buyPrice') }}
                  </span>
                  <span class="price-unit">元/吨</span>
                </div>
                <a-button class="price-btn increase-btn" size="small" @click="handlePriceChange(record, 'buyPrice', 1)">
                  <Icon icon="ant-design:plus-outlined" />
                </a-button>
              </div>
            </template>
          </template>
        </BasicTable>
      </div>
    </div>

    <!-- 历史交易记录 -->
    <div class="history-section">
      <div class="section-header">
        <div class="section-title">
          <Icon icon="ant-design:history-outlined" class="section-icon" />
          <span>价格变更记录</span>
        </div>
        <div class="section-actions">
          <a-button class="refresh-btn" @click="reloadHistory">
            <Icon icon="ant-design:reload-outlined" />
            刷新
          </a-button>
        </div>
      </div>

      <div class="section-content">
        <BasicTable @register="registerHistoryTable" class="history-table">
          <!--操作栏-->
          <template #action="{ record }">
            <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
          </template>
          <!--字段回显插槽-->
          <template v-slot:bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'price'">
              <div class="price-cell">
                <span
                  class="price-text"
                  :style="{
                    color: getPriceColor(record.price, 'price'),
                  }"
                >
                  {{ record.price }}
                </span>
                <span class="price-unit-small">元/吨</span>
              </div>
            </template>
            <template v-if="column.dataIndex === 'sellPrice'">
              <div class="price-cell">
                <span
                  class="price-text"
                  :style="{
                    color: getPriceColor(record.sellPrice, 'sellPrice'),
                  }"
                >
                  {{ record.sellPrice }}
                </span>
                <span class="price-unit-small">元/吨</span>
              </div>
            </template>
            <template v-if="column.dataIndex === 'buyPrice'">
              <div class="price-cell">
                <span
                  class="price-text"
                  :style="{
                    color: getPriceColor(record.buyPrice, 'buyPrice'),
                  }"
                >
                  {{ record.buyPrice }}
                </span>
                <span class="price-unit-small">元/吨</span>
              </div>
            </template>
          </template>
        </BasicTable>
      </div>
    </div>

    <!-- 表单区域 -->
    <DwMainProductModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="dw.product.xian-dwMainProduct" setup>
  import { reactive, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import DwMainProductModal from './components/DwMainProductModal.vue';
  import { columns, searchFormSchema } from './DwMainProduct.data';
  import { list, deleteOne, batchDelete, getImportUrl, getExportUrl, saveOrUpdate } from './DwMainProduct.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getDateByPicker } from '/@/utils';

  //日期个性化选择
  const fieldPickers = reactive({});
  const queryParam = reactive<any>({});
  const { createMessage } = useMessage();

  //注册model
  const [registerModal, { openModal }] = useModal();

  //注册table数据 - 最新价格表格
  const { tableContext: latestTableContext } = useListPage({
    tableProps: {
      title: '带钢现货价格',
      api: list,
      columns,
      canResize: true,
      pagination: false, // 最新价格表格不显示分页
      formConfig: {
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
        fieldMapToNumber: [],
        fieldMapToTime: [],
      },
      beforeFetch: (params) => {
        if (params && fieldPickers) {
          for (let key in fieldPickers) {
            if (params[key]) {
              params[key] = getDateByPicker(params[key], fieldPickers[key]);
            }
          }
        }
        // 添加排序和限制，只获取最新的一条记录
        const finalParams = Object.assign(params, queryParam);
        finalParams.column = 'updateTime';
        finalParams.order = 'desc';
        finalParams.pageNo = 1;
        finalParams.pageSize = 1;
        // 添加时间戳确保每次刷新都获取最新数据
        finalParams._t = Date.now();
        return finalParams;
      },
      afterFetch: (result) => {
        // 更新最新价格，用于颜色比较
        if (result && result.items && result.items.length > 0) {
          const latestRecord = result.items[0];
          latestPrice.value = latestRecord.price || 0;
          latestSellPrice.value = latestRecord.sellPrice || 0;
          latestBuyPrice.value = latestRecord.buyPrice || 0;
          isLatestPriceLoaded.value = true;
        }
      },
    },
    exportConfig: {
      name: '带钢现货价格',
      url: getExportUrl,
      params: queryParam,
    },
    importConfig: {
      url: getImportUrl,
      success: handleSuccess,
    },
  });

  //注册table数据 - 变更记录表格
  const { tableContext: historyTableContext } = useListPage({
    tableProps: {
      title: '变更记录',
      api: list,
      columns,
      canResize: true,
      pagination: { pageSize: 10 }, // 历史记录表格显示分页
      formConfig: {
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
        fieldMapToNumber: [],
        fieldMapToTime: [],
      },
      actionColumn: {
        width: 120,
        fixed: 'right',
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
      immediate: false, // 不立即加载，等最新价格加载完成后再加载
    },
  });

  const [
    registerLatestTable,
    { reload: reloadLatest, getDataSource: getLatestDataSource, setTableData: setLatestTableData },
    { rowSelection, selectedRowKeys },
  ] = latestTableContext;
  const [registerHistoryTable, { reload: reloadHistory }] = historyTableContext;

  // 存储最新价格，用于颜色比较
  const latestPrice = ref(0);
  const latestSellPrice = ref(0);
  const latestBuyPrice = ref(0);
  // 标记最新价格是否已加载
  const isLatestPriceLoaded = ref(false);

  // 编辑状态管理
  const editingPrice = ref<Record<string, string>>({});
  const editingValues = ref<Record<string, number>>({});
  const priceInputRef = ref();
  const sellPriceInputRef = ref();
  const buyPriceInputRef = ref();
  // 防止重复提交的标志位
  const isSubmitting = ref<Record<string, boolean>>({});
  // 防抖定时器
  const debounceTimers = ref<Record<string, NodeJS.Timeout>>({});
  // 本地价格缓存，用于快速更新UI
  const localPriceCache = ref<Record<string, { price: number; sellPrice: number; buyPrice: number }>>({});

  /**
   * 开始编辑价格
   * @param record 记录对象
   * @param priceField 价格字段名
   */
  function startPriceEdit(record: any, priceField: string) {
    editingPrice.value[record.id] = priceField;
    editingValues.value[record.id] = record[priceField];
    isSubmitting.value[record.id] = false; // 重置提交状态
    
    // 下一个tick聚焦输入框
    nextTick(() => {
      const inputRef = priceField === 'price' ? priceInputRef.value : 
                     priceField === 'sellPrice' ? sellPriceInputRef.value : 
                     buyPriceInputRef.value;
      if (inputRef) {
        inputRef.focus();
        inputRef.select();
      }
    });
  }

  /**
   * 取消编辑
   * @param recordId 记录ID
   */
  function cancelPriceEdit(recordId: string) {
    delete editingPrice.value[recordId];
    delete editingValues.value[recordId];
    delete isSubmitting.value[recordId];
    // 清除防抖定时器
    if (debounceTimers.value[recordId]) {
      clearTimeout(debounceTimers.value[recordId]);
      delete debounceTimers.value[recordId];
    }
  }

  /**
   * 快速更新本地价格缓存
   * @param record 记录对象
   * @param priceField 价格字段名
   * @param newPrice 新价格
   */
  function updateLocalPriceCache(record: any, priceField: string, newPrice: number) {
    if (!localPriceCache.value[record.id]) {
      localPriceCache.value[record.id] = {
        price: record.price,
        sellPrice: record.sellPrice,
        buyPrice: record.buyPrice
      };
    }
    localPriceCache.value[record.id][priceField] = newPrice;
  }

  /**
   * 获取显示的价格（优先使用本地缓存）
   * @param record 记录对象
   * @param priceField 价格字段名
   */
  function getDisplayPrice(record: any, priceField: string): number {
    const cache = localPriceCache.value[record.id];
    if (cache) {
      return cache[priceField];
    }
    return record[priceField];
  }

  /**
   * 处理价格输入框失去焦点
   * @param record 记录对象
   * @param priceField 价格字段名
   */
  async function handlePriceInputBlur(record: any, priceField: string) {
    // 如果正在提交中，直接返回
    if (isSubmitting.value[record.id]) {
      return;
    }
    
    await submitPriceChange(record, priceField);
  }

  /**
   * 处理回车键按下
   * @param record 记录对象
   * @param priceField 价格字段名
   */
  async function handlePriceInputEnter(record: any, priceField: string) {
    // 如果正在提交中，直接返回
    if (isSubmitting.value[record.id]) {
      return;
    }
    
    await submitPriceChange(record, priceField);
  }

  /**
   * 提交价格变更的通用方法
   * @param record 记录对象
   * @param priceField 价格字段名
   */
  async function submitPriceChange(record: any, priceField: string) {
    // 设置提交状态，防止重复提交
    isSubmitting.value[record.id] = true;
    
    const newPrice = editingValues.value[record.id];
    
    // 验证价格
    if (newPrice === undefined || newPrice === null || isNaN(newPrice) || newPrice < 0) {
      createMessage.warning('请输入有效的价格');
      cancelPriceEdit(record.id);
      return;
    }

    // 如果价格没有变化，直接取消编辑
    if (newPrice === record[priceField]) {
      cancelPriceEdit(record.id);
      return;
    }

    try {
      // 获取北京时间（UTC+8）
      const now = new Date();
      const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      const beijingTimeString = beijingTime.toISOString().slice(0, 19).replace('T', ' ');

      // 创建新的记录，相当于新增
      const newRecord = {
        ...record,
        id: undefined, // 移除原ID，让系统自动生成新ID
        [priceField]: newPrice,
        updateTime: beijingTimeString,
        createTime: beijingTimeString,
      };

      await saveOrUpdate(newRecord, false); // false表示新增

      // 清空选中状态
      selectedRowKeys.value = [];

      // 更新最新价格
      switch (priceField) {
        case 'price':
          latestPrice.value = newPrice;
          break;
        case 'sellPrice':
          latestSellPrice.value = newPrice;
          break;
        case 'buyPrice':
          latestBuyPrice.value = newPrice;
          break;
      }
      isLatestPriceLoaded.value = true;

      // 先重新加载最新价格，确保颜色比较正确
      await reloadLatest();
      // 手动更新最新价格，确保颜色显示正确
      updateLatestPrice();
      // 最新价格加载完成后，再加载历史记录
      await reloadHistory();

      createMessage.success('价格更新成功');
    } catch (error) {
      createMessage.error('价格更新失败');
    } finally {
      // 无论成功失败都要取消编辑状态和提交状态
      cancelPriceEdit(record.id);
    }
  }

  /**
   * 手动更新最新价格
   */
  function updateLatestPrice() {
    // 添加小延迟，确保数据完全加载
    setTimeout(() => {
      try {
        const dataSource = getLatestDataSource();
        if (dataSource && dataSource.length > 0) {
          const latestRecord = dataSource[0];
          latestPrice.value = latestRecord.price || 0;
          latestSellPrice.value = latestRecord.sellPrice || 0;
          latestBuyPrice.value = latestRecord.buyPrice || 0;
          isLatestPriceLoaded.value = true;
          // 强制重新渲染表格，确保颜色更新
          setLatestTableData(dataSource);
        }
      } catch (error) {
        // 手动更新最新价格失败
      }
    }, 100);
  }

  /**
   * 获取价格颜色
   * @param price 当前价格
   * @param priceType 价格类型：'price', 'sellPrice', 'buyPrice'
   * @returns 颜色值
   */
  function getPriceColor(price: number, priceType: string): string {
    // 确保价格是有效数字
    const currentPrice = Number(price);
    let latestPriceNum = 0;

    // 根据价格类型获取对应的最新价格
    switch (priceType) {
      case 'price':
        latestPriceNum = Number(latestPrice.value);
        break;
      case 'sellPrice':
        latestPriceNum = Number(latestSellPrice.value);
        break;
      case 'buyPrice':
        latestPriceNum = Number(latestBuyPrice.value);
        break;
      default:
        latestPriceNum = Number(latestPrice.value);
    }

    // 如果最新价格还未加载，返回默认黑色
    if (!isLatestPriceLoaded.value || !latestPriceNum || isNaN(latestPriceNum)) {
      return '#1f2937';
    }

    if (isNaN(currentPrice)) {
      return '#1f2937';
    }

    let color = '#1f2937';
    if (currentPrice > latestPriceNum) {
      color = '#ef4444'; // 红色 - 比最新价格高
    } else if (currentPrice < latestPriceNum) {
      color = '#10b981'; // 绿色 - 比最新价格低
    } else {
      color = '#1f2937'; // 深灰色 - 与最新价格相等
    }

    return color;
  }

  /**
   * 价格变更处理 - 优化版本，使用防抖和本地缓存
   * @param record 记录对象
   * @param priceField 价格字段名：'price', 'sellPrice', 'buyPrice'
   * @param change 变化量
   */
  async function handlePriceChange(record, priceField: string, change: number) {
    const currentPrice = getDisplayPrice(record, priceField);
    const newPrice = Number(currentPrice) + change;
    
    if (newPrice < 0) {
      createMessage.warning('价格不能为负数');
      return;
    }

    // 立即更新本地缓存，提供即时反馈
    updateLocalPriceCache(record, priceField, newPrice);
    
    // 更新最新价格缓存
    switch (priceField) {
      case 'price':
        latestPrice.value = newPrice;
        break;
      case 'sellPrice':
        latestSellPrice.value = newPrice;
        break;
      case 'buyPrice':
        latestBuyPrice.value = newPrice;
        break;
    }

    // 清除之前的防抖定时器
    if (debounceTimers.value[record.id]) {
      clearTimeout(debounceTimers.value[record.id]);
    }

    // 设置防抖，500ms后执行实际保存
    debounceTimers.value[record.id] = setTimeout(async () => {
      try {
        // 获取北京时间（UTC+8）
        const now = new Date();
        const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const beijingTimeString = beijingTime.toISOString().slice(0, 19).replace('T', ' ');

        // 创建新的记录，相当于新增
        const newRecord = {
          ...record,
          id: undefined, // 移除原ID，让系统自动生成新ID
          [priceField]: newPrice,
          updateTime: beijingTimeString,
          createTime: beijingTimeString,
        };

        await saveOrUpdate(newRecord, false); // false表示新增

        // 清空选中状态
        selectedRowKeys.value = [];

        // 先重新加载最新价格，确保颜色比较正确
        await reloadLatest();
        // 手动更新最新价格，确保颜色显示正确
        updateLatestPrice();
        // 最新价格加载完成后，再加载历史记录
        await reloadHistory();

        // 清除本地缓存，使用服务器数据
        delete localPriceCache.value[record.id];
      } catch (error) {
        createMessage.error('价格更新失败');
        // 失败时恢复本地缓存
        delete localPriceCache.value[record.id];
        // 重新加载数据
        await reloadLatest();
        await reloadHistory();
      }
    }, 500); // 500ms防抖
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
    await deleteOne({ id: record.id }, handleSuccess);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ ids: selectedRowKeys.value }, handleSuccess);
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    selectedRowKeys.value = [];
    // 先重新加载最新价格，确保颜色比较正确
    reloadLatest().then(() => {
      // 手动更新最新价格，确保颜色显示正确
      updateLatestPrice();
      // 最新价格加载完成后，再加载历史记录
      reloadHistory();
    });
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'dw.product.xian:dw_main_product:edit',
      },
    ];
  }

  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    return [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
          placement: 'topLeft',
        },
        auth: 'dw.product.xian:dw_main_product:delete',
      },
    ];
  }

  /**
   * 组件挂载后立即加载最新价格
   */
  onMounted(async () => {
    // 立即加载最新价格，确保页面刷新后颜色显示正确
    try {
      await reloadLatest();
      // 手动更新最新价格，确保颜色显示正确
      updateLatestPrice();
      // 最新价格加载完成后，再加载历史表格
      await reloadHistory();
    } catch (error) {
      // 初始化加载最新价格失败
    }
  });

  /**
   * 组件卸载前清理状态
   */
  onBeforeUnmount(() => {
    // 重置状态，确保下次进入时重新加载
    latestPrice.value = 0;
    latestSellPrice.value = 0;
    latestBuyPrice.value = 0;
    isLatestPriceLoaded.value = false;
    
    // 清理所有防抖定时器
    Object.values(debounceTimers.value).forEach(timer => {
      if (timer) {
        clearTimeout(timer);
      }
    });
    debounceTimers.value = {};
    localPriceCache.value = {};
    
    // 移除事件监听器
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });

  /**
   * 页面可见性变化监听器
   */
  function handleVisibilityChange() {
    if (!document.hidden) {
      // 页面重新可见时，重新加载数据
      reloadLatest().then(() => {
        updateLatestPrice();
        reloadHistory();
      });
    }
  }

  // 添加页面可见性监听器
  document.addEventListener('visibilitychange', handleVisibilityChange);
</script>

<style lang="less" scoped>
  .stock-trading-dashboard {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  // 页面头部样式
  .dashboard-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title-section {
      .main-title {
        font-size: 28px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 12px;

        .title-icon {
          font-size: 32px;
          color: #3b82f6;
        }
      }

      .subtitle {
        font-size: 16px;
        color: #6b7280;
        margin: 0;
        font-weight: 400;
      }
    }

    .header-actions {
      .action-btn {
        height: 48px;
        padding: 0 24px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
      }
    }
  }

  // 价格看板样式
  .price-board {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    margin-bottom: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;

    .board-header {
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .board-title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
        font-size: 18px;
        font-weight: 600;

        .board-icon {
          font-size: 20px;
          color: #10b981;
        }
      }

      .board-status {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #d1d5db;
        font-size: 14px;

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 2s infinite;

          &.live {
            background: #10b981;
          }
        }
      }
    }

    .board-content {
      padding: 0;
    }
  }

  // 历史记录区域样式
  .history-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;

    .section-header {
      background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .section-title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
        font-size: 18px;
        font-weight: 600;

        .section-icon {
          font-size: 20px;
          color: #f59e0b;
        }
      }

      .section-actions {
        .refresh-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 8px;
          height: 36px;
          padding: 0 16px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
          }
        }
      }
    }

    .section-content {
      padding: 0;
    }
  }

  // 表格样式
  .price-table,
  .history-table {
    :deep(.ant-table) {
      background: transparent;
      border-radius: 0;

      .ant-table-thead > tr > th {
        background: #f8fafc;
        border-bottom: 2px solid #e5e7eb;
        color: #374151;
        font-weight: 600;
        font-size: 14px;
        padding: 16px 12px;
      }

      .ant-table-tbody > tr {
        transition: all 0.3s ease;

        &:hover {
          background: #f1f5f9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        > td {
          border-bottom: 1px solid #e5e7eb;
          padding: 16px 12px;
          vertical-align: middle;
        }
      }
    }
  }

  // 价格控制组件样式
  .price-control {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e5e7eb;

    .price-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;

      &.decrease-btn {
        background: #ffaeae;
        color: #dc2626;

        &:hover {
          background: #fecaca;
          transform: scale(1.1);
        }
      }

      &.increase-btn {
        background: #9dffba;
        color: #16a34a;

        &:hover {
          background: #bbf7d0;
          transform: scale(1.1);
        }
      }
    }

    .price-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;

      .price-value {
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
        line-height: 1.2;

        &.clickable {
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s ease;

          &:hover {
            background: #e5e7eb;
            transform: scale(1.05);
          }
        }
      }

      .price-unit {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
      }

      .price-input {
        width: 80px;
        text-align: center;
        font-size: 18px;
        font-weight: 700;
        border: 2px solid #3b82f6;
        border-radius: 6px;

        :deep(.ant-input-number-input) {
          text-align: center;
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
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

    .price-text {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.2;
    }

    .price-unit-small {
      font-size: 11px;
      color: #9ca3af;
      font-weight: 500;
    }
  }

  // 批量操作按钮样式
  .batch-btn {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #374151;
    border-radius: 8px;
    height: 36px;
    padding: 0 16px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      background: #e5e7eb;
      transform: translateY(-1px);
    }
  }

  // 动画效果
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .stock-trading-dashboard {
      padding: 12px;
    }

    .dashboard-header {
      padding: 16px;

      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .main-title {
        font-size: 24px;
      }
    }

    .price-control {
      gap: 8px;
      padding: 6px;

      .price-btn {
        width: 28px;
        height: 28px;
      }

      .price-display {
        min-width: 60px;

        .price-value {
          font-size: 16px;
        }
      }
    }
  }

  // 深度样式覆盖
  :deep(.ant-picker),
  :deep(.ant-input-number) {
    width: 100%;
  }

  :deep(.ant-table-pagination) {
    padding: 16px 24px;
    background: #f8fafc;
    border-top: 1px solid #e5e7eb;
  }
</style>
