<template>
  <div>
    <!--引用表格-->
   <BasicTable @register="registerTable" :rowSelection="rowSelection">
     <!-- 买卖方向列 -->
     <template #bodyCell="{ column, record }">
       <template v-if="column.key === 'side'">
         <a-tag :color="getSideColor(record.side)" style="font-size: 16px; font-weight: bold;">
           {{ getSideText(record.side) }}
         </a-tag>
       </template>
     </template>
   </BasicTable>
    <!-- 表单区域 -->
    <DwUserCloseModal @register="registerModal" @success="handleSuccess"></DwUserCloseModal>
  </div>
</template>

<script lang="ts" name="dw.close-dwUserClose" setup>
  import {ref, reactive, computed, unref} from 'vue';
  import {BasicTable, useTable, TableAction} from '/@/components/Table';
  import {useModal} from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage'
  import DwUserCloseModal from './components/DwUserCloseModal.vue'
  import {columns, searchFormSchema, superQuerySchema} from './DwUserClose.data';
  import {list, deleteOne, batchDelete, getImportUrl,getExportUrl} from './DwUserClose.api';
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
  //注册model
  const [registerModal, {openModal}] = useModal();
  //注册table数据
  const { prefixCls,tableContext,onExportXls,onImportXls } = useListPage({
      tableProps:{
           title: '用户平仓表',
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
      },
       exportConfig: {
            name:"用户平仓表",
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
   /**
      * 操作栏
      */
  function getTableAction(record){
       return [
         {
           label: '编辑',
           onClick: handleEdit.bind(null, record),
           auth: 'dw.close:dw_user_close:edit'
         }
       ]
   }
   /**
      * 下拉操作栏
      */
  function getDropDownAction(record){
       return [
         {
           label: '详情',
           onClick: handleDetail.bind(null, record),
         }, {
           label: '删除',
           popConfirm: {
             title: '是否确认删除',
             confirm: handleDelete.bind(null, record),
             placement: 'topLeft',
           },
           auth: 'dw.close:dw_user_close:delete'
         }
       ]
   }

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




</script>

<style lang="less" scoped>
  :deep(.ant-picker),:deep(.ant-input-number){
    width: 100%;
  }
</style>