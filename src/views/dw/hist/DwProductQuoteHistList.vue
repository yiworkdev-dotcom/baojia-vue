<template>
  <div>
    <a-card :bordered="false" title="产品价格走势" class="mb-4">
      <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px">
        <span>产品：</span>
        <JDictSelectTag v-model:value="currentProductId" dictCode="dw_future_product,name,id" allowClear placeholder="请选择产品" />
      </div>
      <LineMulti :chartData="chartData" height="33vh" type="line" :option="{ legend: { top: 'bottom' } }" />
    </a-card>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection" @fetch-success="onTableFetchSuccess">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" v-auth="'dw.product.hist:dw_product_quote_hist:add'" @click="handleAdd" preIcon="ant-design:plus-outlined">
          新增</a-button
        >
        <a-button type="primary" v-auth="'dw.product.hist:dw_product_quote_hist:exportXls'" preIcon="ant-design:export-outlined" @click="onExportXls">
          导出</a-button
        >
        <j-upload-button
          type="primary"
          v-auth="'dw.product.hist:dw_product_quote_hist:importExcel'"
          preIcon="ant-design:import-outlined"
          @click="onImportXls"
          >导入</j-upload-button
        >

        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined" />
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button v-auth="'dw.product.hist:dw_product_quote_hist:deleteBatch'"
            >批量操作
            <Icon icon="mdi:chevron-down" />
          </a-button>
        </a-dropdown>
        <!-- 高级查询 -->
        <super-query :config="superQueryConfig" @search="handleSuperQuery" />
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <DwProductQuoteHistModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="dw.product.hist-dwProductQuoteHist" setup>
  import { ref, reactive, watch, defineAsyncComponent } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { useModal } from '@/components/Modal';
  import { useListPage } from '@/hooks/system/useListPage';
  import LineMulti from '@/components/chart/LineMulti.vue';
  import { columns, searchFormSchema, superQuerySchema } from './DwProductQuoteHist.data';
  import { list, deleteOne, batchDelete, getImportUrl, getExportUrl } from './DwProductQuoteHist.api';
  import { getDateByPicker } from '@/utils';

  const DwProductQuoteHistModal = defineAsyncComponent(() => import('./components/DwProductQuoteHistModal.vue'));

  // 折线图 - 选择的产品与数据
  const currentProductId = ref<string | number | undefined>();
  const chartData = ref<any[]>([]);

  // 日期个性化选择
  const fieldPickers = reactive({});
  const queryParam = reactive<any>({});

  // 注册 model
  const [registerModal, { openModal }] = useModal();
  // 注册 table 数据
  const { tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: '产品历史报价',
      api: list,
      columns,
      canResize: true,
      formConfig: {
        //labelWidth: 120,
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
          for (const key in fieldPickers) {
            if (params[key]) {
              params[key] = getDateByPicker(params[key], fieldPickers[key]);
            }
          }
        }
        return Object.assign(params, queryParam);
      },
    },
    exportConfig: {
      name: '产品历史报价',
      url: getExportUrl,
      params: queryParam,
    },
    importConfig: {
      url: getImportUrl,
      success: handleSuccess,
    },
  });

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  // 高级查询配置
  const superQueryConfig = reactive(superQuerySchema);

  /**
   * 加载折线图数据（根据当前产品）
   */
  async function loadChartData() {
    try {
      if (!currentProductId.value) {
        chartData.value = [];
        return;
      }
      const res: any = await list({ productId: currentProductId.value, pageNo: 1, pageSize: 1000 });
      const rows: any[] = (res && (res.records || res.result?.records || res.result || res)) || [];
      rows.sort((a, b) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime());
      const buyColor = '#67B962';
      const sellColor = '#f5222d';
      const lastColor = '#1890ff';
      const data: any[] = [];
      rows.forEach((r) => {
        const x = r.updateTime;
        data.push({ name: x, type: '买入', value: Number(r.bidPrice), color: buyColor });
        data.push({ name: x, type: '卖出', value: Number(r.askPrice), color: sellColor });
        data.push({ name: x, type: '成交', value: Number(r.lastPrice), color: lastColor });
      });
      chartData.value = data;
    } catch (e) {
      // ignore
    }
  }

  /**
   * 高级查询事件
   */
  function handleSuperQuery(params) {
    Object.keys(params).map((k) => {
      queryParam[k] = params[k];
    });
    reload();
    loadChartData();
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
    (selectedRowKeys.value = []) && reload();
    loadChartData();
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'dw.product.hist:dw_product_quote_hist:edit',
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
        auth: 'dw.product.hist:dw_product_quote_hist:delete',
      },
    ];
  }

  // 监听产品切换：联动表格与折线图
  watch(
    () => currentProductId.value,
    () => {
      queryParam.productId = currentProductId.value;
      reload();
      loadChartData();
    }
  );

  /** 表格首次加载完成后，自动设置产品并加载图表 */
  function onTableFetchSuccess({ items }) {
    if (!currentProductId.value && items && items.length) {
      const first = items[0];
      const pid = first.productId || first.product_id || first.productID;
      if (pid != null) {
        currentProductId.value = pid;
      }
    }
  }
</script>

<style lang="less" scoped>
  :deep(.ant-picker),
  :deep(.ant-input-number) {
    width: 100%;
  }
</style>
