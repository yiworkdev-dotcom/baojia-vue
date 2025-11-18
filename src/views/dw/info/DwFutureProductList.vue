<template>
  <div class="future-product-list">
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection" class="financial-table">
      <!--插槽:table标题-->
      <template #tableTitle>
        <div class="table-toolbar">
          <div class="toolbar-left">
            <a-button
              type="primary"
              v-auth="'dw.product.info:dw_future_product:add'"
              @click="handleAdd"
              preIcon="ant-design:plus-outlined"
              class="action-btn"
            >
              新增产品
            </a-button>
            <a-button
              type="primary"
              v-auth="'dw.product.info:dw_future_product:exportXls'"
              preIcon="ant-design:export-outlined"
              @click="onExportXls"
              class="action-btn"
            >
              导出数据
            </a-button>
          </div>

          <div class="toolbar-right">
            <a-dropdown v-if="selectedRowKeys.length > 0">
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1" @click="batchHandleDelete">
                    <Icon icon="ant-design:delete-outlined" />
                    批量删除
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button v-auth="'dw.product.info:dw_future_product:deleteBatch'" class="batch-btn">
                批量操作
                <Icon icon="mdi:chevron-down" />
              </a-button>
            </a-dropdown>

            <!-- 高级查询 -->
            <super-query :config="superQueryConfig" @search="handleSuperQuery" />
          </div>
        </div>
      </template>

      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>

    <!-- 表单区域 -->
    <DwFutureProductModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="dw.product.info-dwFutureProduct" setup>
  import { ref, reactive, onMounted, onUnmounted } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import DwFutureProductModal from './components/DwFutureProductModal.vue';
  import { columns, searchFormSchema, superQuerySchema } from './DwFutureProduct.data';
  import { list, deleteOne, batchDelete, getImportUrl, getExportUrl } from './DwFutureProduct.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getDateByPicker } from '/@/utils';

  // 日期个性化选择
  const fieldPickers = reactive({});
  const queryParam = reactive<any>({});
  const { createMessage } = useMessage();

  // 注册model
  const [registerModal, { openModal }] = useModal();

  // 注册table数据
  const { tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: '期货产品列表',
      api: list,
      columns,
      canResize: true,
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
      // 简化行样式，移除分组样式因为现在在列中处理
      rowClassName: (record, index) => {
        return index % 2 === 0 ? 'even-row' : 'odd-row';
      },
      scroll: { x: 1500 },
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
      },
    },
    exportConfig: {
      name: '期货产品列表',
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

  // 实时数据更新定时器
  let dataUpdateTimer: NodeJS.Timeout | null = null;

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
    try {
      await deleteOne({ id: record.id }, handleSuccess);
      createMessage.success('删除成功');
    } catch (error) {
      createMessage.error('删除失败');
    }
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    try {
      await batchDelete({ ids: selectedRowKeys.value }, handleSuccess);
      createMessage.success('批量删除成功');
    } catch (error) {
      createMessage.error('批量删除失败');
    }
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    selectedRowKeys.value = [];
    reload();
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'dw.product.info:dw_future_product:edit',
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
        auth: 'dw.product.info:dw_future_product:delete',
      },
    ];
  }

  /**
   * 启动实时数据更新
   */
  function startDataUpdate() {
    dataUpdateTimer = setInterval(() => {
      // 这里可以调用API获取最新数据
      // 为了演示，我们只是重新加载表格
      reload();
    }, 30000); // 30秒更新一次
  }

  /**
   * 停止实时数据更新
   */
  function stopDataUpdate() {
    if (dataUpdateTimer) {
      clearInterval(dataUpdateTimer);
      dataUpdateTimer = null;
    }
  }

  onMounted(() => {
    startDataUpdate();
  });

  onUnmounted(() => {
    stopDataUpdate();
  });
</script>

<style lang="less" scoped>
  .future-product-list {
    background: #f5f7fa;
    min-height: 100vh;
    padding: 20px;

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .toolbar-left {
        display: flex;
        gap: 12px;

        .action-btn {
          border-radius: 8px;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          margin-right: 15px;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          }
        }
      }

      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .batch-btn {
          border-radius: 8px;
          background: #ff4d4f;
          border-color: #ff4d4f;
          color: white;
          font-weight: 500;

          &:hover {
            background: #ff7875;
            border-color: #ff7875;
          }
        }
      }
    }

    .financial-table {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;

      :deep(.ant-table) {
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 2px solid #dee2e6;
          font-weight: 600;
          color: #495057;
          padding: 16px 12px;
          text-align: center;

          &:first-child {
            border-top-left-radius: 12px;
          }

          &:last-child {
            border-top-right-radius: 12px;
          }
        }

        .ant-table-tbody > tr {
          transition: background-color 0.3s ease;

          &:hover {
            background: #f8f9ff;
          }

          &.even-row {
            background: #fafbfc;
          }

          &.odd-row {
            background: white;
          }

          > td {
            padding: 8px 12px;
            border-bottom: 1px solid #f0f0f0;
            vertical-align: middle;
          }
        }
      }

      // 产品代码带前缀标识样式
      :deep(.product-code-with-prefix) {
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .product-code {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;

          .code-text {
            font-family: 'Courier New', monospace;
            font-weight: 600;
            font-size: 16px;
          }

          .code-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
            border: 1px solid;
          }
        }
      }

      // 产品名称带前缀标识样式
      :deep(.product-name-with-prefix) {
        display: flex;
        flex-direction: column;
        gap: 4px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .name-main {
          font-weight: 600;
          font-size: 14px;
        }

        .name-sub {
          font-size: 12px;
        }
      }

      // 交易所标签样式
      :deep(.exchange-tag) {
        background: #f0f5ff;
        color: #1890ff;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid #d6e4ff;
      }

      // 状态标签样式
      :deep(.status-tag) {
        padding: 4px 12px;
        border-radius: 16px;
        font-weight: 500;
        font-size: 12px;

        &.active {
          background: #f6ffed;
          color: #52c41a;
          border: 1px solid #b7eb8f;
        }

        &.inactive {
          background: #fff2e8;
          color: #fa8c16;
          border: 1px solid #ffd591;
        }
      }

      // 时间文本样式
      :deep(.time-text) {
        font-size: 12px;
        color: #8c8c8c;
      }

      // 备注文本样式
      :deep(.remark-text) {
        color: #595959;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    // 响应式设计
    @media (max-width: 768px) {
      .table-toolbar {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;

        .toolbar-left,
        .toolbar-right {
          justify-content: center;
        }
      }
    }
  }

  // 全局样式覆盖
  :deep(.ant-picker),
  :deep(.ant-input-number) {
    width: 100%;
  }

  :deep(.ant-table-pagination) {
    margin: 16px 0;
    text-align: right;
  }

  :deep(.ant-table-selection) {
    .ant-checkbox-wrapper {
      margin-right: 8px;
    }
  }
</style>
