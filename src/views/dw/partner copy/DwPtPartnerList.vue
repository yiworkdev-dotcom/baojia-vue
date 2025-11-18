<template>
  <div>
    <!--引用表格-->
    <BasicTable
      @register="registerTable"
      :rowSelection="rowSelection"
      :expandedRowKeys="expandedRowKeys"
      @expand="handleExpand"
      @fetch-success="onFetchSuccess"
    >
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" v-auth="'dw.partner:dw_pt_partner:add'" @click="handleCreate" preIcon="ant-design:plus-outlined"> 新增</a-button>
        <a-button type="primary" v-auth="'dw.partner:dw_pt_partner:exportXls'" preIcon="ant-design:export-outlined" @click="onExportXls">
          导出</a-button
        >
        <j-upload-button type="primary" v-auth="'dw.partner:dw_pt_partner:importExcel'" preIcon="ant-design:import-outlined" @click="onImportXls"
          >导入</j-upload-button
        >
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button v-auth="'dw.partner:dw_pt_partner:deleteBatch'"
            >批量操作
            <Icon icon="ant-design:down-outlined"></Icon>
          </a-button>
        </a-dropdown>
        <!-- 高级查询 -->
        <super-query :config="superQueryConfig" @search="handleSuperQuery" />
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
      <!--字段回显插槽-->
      <template v-slot:bodyCell="{ column, record, index, text }"> </template>
    </BasicTable>
    <!--字典弹窗-->
    <DwPtPartnerModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="dw.partner-dwPtPartner" setup>
  //ts语法
  import { ref, reactive, computed, unref, toRaw, nextTick } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import DwPtPartnerModal from './components/DwPtPartnerModal.vue';
  import { columns, searchFormSchema, superQuerySchema } from './DwPtPartner.data';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { list, deleteDwPtPartner, batchDeleteDwPtPartner, getExportUrl, getImportUrl, getAllPartners } from './DwPtPartner.api';
  import { getDateByPicker } from '/@/utils';
  //日期个性化选择
  const fieldPickers = reactive({});
  const { createMessage } = useMessage();
  const queryParam = reactive<any>({});
  const expandedRowKeys = ref([]);
  //字典model
  const [registerModal, { openModal }] = useModal();
  //注册table数据
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      api: getAllPartners, // 使用新的API获取所有数据
      title: '合伙人列表',
      columns,
      canResize: true,
      isTreeTable: true,
      formConfig: {
        //labelWidth: 120,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
        fieldMapToNumber: [],
        fieldMapToTime: [],
      },
      actionColumn: {
        width: 240,
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
        params.hasQuery = 'true';
        return Object.assign(params, queryParam);
      },
    },
    exportConfig: {
      name: '合伙人列表',
      url: getExportUrl,
      params: queryParam,
    },
    importConfig: {
      url: getImportUrl,
      success: importSuccess,
    },
  });

  const [registerTable, { reload, collapseAll, updateTableDataRecord, findTableDataRecord, getDataSource }, { rowSelection, selectedRowKeys }] =
    tableContext;

  // 高级查询配置
  const superQueryConfig = reactive(superQuerySchema);

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
  function handleCreate() {
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑事件
   */
  async function handleEdit(record) {
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 详情
   */
  async function handleDetail(record) {
    openModal(true, {
      record,
      isUpdate: true,
      hideFooter: true,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteDwPtPartner({ id: record.id }, importSuccess);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    const ids = selectedRowKeys.value.filter((item) => !item.includes('loadChild'));
    await batchDeleteDwPtPartner({ id: ids }, importSuccess);
  }
  /**
   * 导入
   */
  function importSuccess() {
    (selectedRowKeys.value = []) && reload();
  }
  /**
   * 添加下级
   */
  function handleAddSub(record) {
    openModal(true, {
      record,
      isUpdate: false,
    });
  }
  /**
   * 成功回调
   */
  async function handleSuccess({ isUpdate, values, expandedArr, changeParent }) {
    if (isUpdate) {
      if (changeParent) {
        reload();
      } else {
        // 重新构建树状结构
        await buildRecommendationTree();
      }
    } else {
      // 重新构建树状结构
      await buildRecommendationTree();
    }
  }

  /**
   * 接口请求成功后回调 - 构建推荐关系树
   */
  function onFetchSuccess(result) {
    if (result && result.records) {
      const treeData = buildRecommendationTreeFromData(result.records);
      // 更新表格数据
      updateTableDataWithTree(treeData);
    }
  }

  /**
   * 根据推荐关系构建树状结构
   */
  function buildRecommendationTreeFromData(allPartners) {
    // 创建映射表，key为userId，value为合伙人数据
    const partnerMap = new Map();
    const rootNodes = [];

    // 首先建立映射关系
    allPartners.forEach((partner) => {
      partnerMap.set(partner.userId, partner);
    });

    // 构建父子关系
    allPartners.forEach((partner) => {
      const parentId = partner.parent; // 直接推荐人ID

      if (parentId && partnerMap.has(parentId)) {
        // 有推荐人，建立父子关系
        const parent = partnerMap.get(parentId);
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(partner);
        parent.hasChild = '1'; // 标记父节点有子节点
      } else {
        // 没有推荐人或推荐人不在当前数据中，作为根节点
        rootNodes.push(partner);
      }
    });

    return rootNodes;
  }

  /**
   * 更新表格数据为树状结构
   */
  function updateTableDataWithTree(treeData) {
    // 这里需要根据实际的表格组件API来更新数据
    // 可能需要调用表格的更新方法
    console.log('构建的树状数据:', treeData);
  }

  /**
   * 重新构建推荐关系树
   */
  async function buildRecommendationTree() {
    try {
      const result = await getAllPartners({});
      if (result && result.records) {
        const treeData = buildRecommendationTreeFromData(result.records);
        updateTableDataWithTree(treeData);
      }
    } catch (error) {
      console.error('构建推荐关系树失败:', error);
    }
  }

  /**
   *树节点展开合并
   * */
  async function handleExpand(expanded, record) {
    if (expanded) {
      expandedRowKeys.value.push(record.id);
    } else {
      let keyIndex = expandedRowKeys.value.indexOf(record.id);
      if (keyIndex >= 0) {
        expandedRowKeys.value.splice(keyIndex, 1);
      }
    }
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'dw.partner:dw_pt_partner:edit',
      },
      {
        label: '添加下级',
        onClick: handleAddSub.bind(null, { pid: record.id }),
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
          title: '确定删除吗?',
          confirm: handleDelete.bind(null, record),
          placement: 'topLeft',
        },
        auth: 'dw.partner:dw_pt_partner:delete',
      },
    ];
  }
</script>

<style lang="less" scoped>
  :deep(.ant-picker),
  :deep(.ant-input-number) {
    width: 100%;
  }
</style>
