<template>
  <div>
    <!--引用表格-->
   <BasicTable @register="registerTable" :rowSelection="rowSelection">
     <!--插槽:table标题-->
      <template #tableTitle>
          <a-button type="primary" v-auth="'dw.code:dw_invitation_code:add'" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增</a-button>
          <a-button  type="primary" v-auth="'dw.code:dw_invitation_code:exportXls'" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
          <j-upload-button type="primary" v-auth="'dw.code:dw_invitation_code:importExcel'" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>

          <a-dropdown v-if="selectedRowKeys.length > 0">
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1" @click="batchHandleDelete">
                    <Icon icon="ant-design:delete-outlined"></Icon>
                    删除
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button v-auth="'dw.code:dw_invitation_code:deleteBatch'">批量操作
                <Icon icon="mdi:chevron-down"></Icon>
              </a-button>
        </a-dropdown>
        <!-- 高级查询 -->
        <super-query :config="superQueryConfig" @search="handleSuperQuery" />
      </template>
       <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)"/>
      </template>
      <!--字段回显插槽-->
      <template v-slot:bodyCell="{ }">
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <DwInvitationCodeModal @register="registerModal" @success="handleSuccess"></DwInvitationCodeModal>
  </div>
</template>

<script lang="ts" name="dw.code-dwInvitationCode" setup>
  import {reactive, h} from 'vue';
  import {BasicTable, TableAction, ActionItem} from '/@/components/Table';
  import {useModal} from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage'
  import DwInvitationCodeModal from './components/DwInvitationCodeModal.vue'
  import {columns, searchFormSchema, superQuerySchema} from './DwInvitationCode.data';
  import {list, deleteOne, batchDelete, getImportUrl,getExportUrl, audit} from './DwInvitationCode.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getDateByPicker } from '/@/utils';
  import { Modal } from 'ant-design-vue';
  //日期个性化选择
  const fieldPickers = reactive({
  });
  const queryParam = reactive<any>({});
  const { createMessage } = useMessage();
  //注册model
  const [registerModal, {openModal}] = useModal();
  //注册table数据
  const { tableContext,onExportXls,onImportXls } = useListPage({
      tableProps:{
           title: '邀请码管理',
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
           actionColumn: {
               width: 260,
               fixed:'right'
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
            name:"邀请码管理",
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
  function getTableAction(record): ActionItem[]{
       const actions: ActionItem[] = [
         {
           label: '编辑',
           onClick: handleEdit.bind(null, record),
           auth: 'dw.code:dw_invitation_code:edit'
         }
       ];
       
       // 只有待审核状态（status为0或未审核状态）才显示审核按钮
       // 根据实际业务逻辑调整状态判断条件
       const canAudit = record.status === 0 || record.status === null || record.status === undefined || record.status_dictText === '待审核';
       if (canAudit) {
         actions.push(
           {
             label: '审核通过',
             onClick: handleAuditPass.bind(null, record),
             auth: 'dw.code:dw_invitation_code:edit'
           },
           {
             label: '审核不通过',
             onClick: handleAuditReject.bind(null, record),
             auth: 'dw.code:dw_invitation_code:edit'
           }
         );
       }
       
       return actions;
   }
     /**
        * 下拉操作栏
        */
  function getDropDownAction(record): ActionItem[]{
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
           auth: 'dw.code:dw_invitation_code:delete'
         }
       ];
   }
   
   /**
    * 审核通过
    */
  async function handleAuditPass(record) {
    Modal.confirm({
      title: '确认审核通过',
      content: `确定要审核通过邀请码申请吗？`,
      okText: '确认通过',
      cancelText: '取消',
      okType: 'primary',
      onOk: async () => {
        try {
          await audit({
            id: record.id,
            status: 1,
            invitedUserId: record.invitedUserId
          });
          createMessage.success('审核通过成功');
          handleSuccess();
        } catch (error) {
          console.error('审核通过失败:', error);
          createMessage.error('审核通过失败');
        }
      }
    });
  }
  
  /**
   * 审核不通过
   */
  function handleAuditReject(record) {
    let remark = '';
    
    Modal.confirm({
      title: '审核不通过',
      content: h('div', [
        h('p', { style: 'margin-bottom: 12px;' }, '请输入审核不通过的原因：'),
        h('textarea', {
          placeholder: '请输入审核备注',
          rows: 4,
          style: 'width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; resize: vertical;',
          onInput: (e: any) => {
            remark = e.target.value;
          }
        })
      ]),
      okText: '确认不通过',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        if (!remark || !remark.trim()) {
          createMessage.error('请输入审核备注');
          return Promise.reject();
        }
        
        try {
          await audit({
            id: record.id,
            status: 2,
            invitedUserId: record.invitedUserId,
            remark: remark.trim()
          });
          createMessage.success('审核不通过操作成功');
          handleSuccess();
        } catch (error) {
          console.error('审核不通过失败:', error);
          createMessage.error('审核不通过失败');
          return Promise.reject();
        }
      }
    });
  }




</script>

<style lang="less" scoped>
  :deep(.ant-picker),:deep(.ant-input-number){
    width: 100%;
  }
</style>