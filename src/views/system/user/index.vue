<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" :disabled="isDisabledAuth('system:user:export')">
          导出</a-button
        >
        <a-button type="primary" @click="openModal(true, {})" preIcon="ant-design:hdd-outlined"> 回收站</a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
              <a-menu-item key="2" @click="batchFrozen(2)">
                <Icon icon="ant-design:lock-outlined"></Icon>
                冻结
              </a-menu-item>
              <a-menu-item key="3" @click="batchFrozen(1)">
                <Icon icon="ant-design:unlock-outlined"></Icon>
                解冻
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
      <!--自定义列：账户余额-->
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'walletBalance'">
          <a @click="handleViewWalletLogs(record)" style="color: #1890ff; cursor: pointer; font-weight: bold;">
            ¥{{ Number(record.walletBalance || 0).toFixed(2) }}
          </a>
        </template>
      </template>
    </BasicTable>
    <!--用户抽屉-->
    <UserDrawer @register="registerDrawer" @success="handleSuccess" />
    <!--修改密码-->
    <PasswordModal @register="registerPasswordModal" @success="reload" />
    <!--用户代理-->
    <UserAgentModal @register="registerAgentModal" @success="reload" />
    <!--回收站-->
    <UserRecycleBinModal @register="registerModal" @success="reload" />
    <!-- 离职受理人弹窗 -->
    <UserQuitAgentModal @register="registerQuitAgentModal" @success="reload" />
    <!-- 离职人员列弹窗 -->
    <UserQuitModal @register="registerQuitModal" @success="reload" />
    <!-- 充值车数弹窗 -->
    <a-modal
      v-model:open="rechargeModalVisible"
      title="充值车数"

      @ok="handleRechargeConfirm"
      @cancel="handleRechargeCancel"
    >
      <div style="padding: 20px;">
        <p>请输入车数变化量（正数为增加，负数为扣减）：</p>
        <a-input-number
          v-model:value="rechargeAmount"
          :precision="0"
          placeholder="请输入车数变化量，如：10（增加）或 -5（扣减）"
          style="width: 100%"
        />
      </div>
    </a-modal>
    <!-- 充值余额弹窗 -->
    <a-modal
      v-model:open="balanceRechargeModalVisible"
      title="充值余额"
      @ok="handleBalanceRechargeConfirm"
      @cancel="handleBalanceRechargeCancel"
    >
      <div style="padding: 20px;">
        <a-form layout="vertical">
          <a-form-item label="充值金额">
            <a-input-number
              v-model:value="balanceRechargeAmount"
              :min="0.01"
              :precision="2"
              placeholder="请输入充值金额，单位：元"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="备注">
            <a-input v-model:value="balanceRechargeRemark" placeholder="请输入备注" allow-clear />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    <!-- 充值免手续费券弹窗 -->
    <a-modal
      v-model:open="feeVouchersModalVisible"
      title="充值免手续费券"
      @ok="handleFeeVouchersConfirm"
      @cancel="handleFeeVouchersCancel"
    >
      <div style="padding: 20px;">
        <p>请输入免手续费券变化量（正数为增加，负数为扣减）：</p>
        <a-input-number
          v-model:value="feeVouchersAmount"
          :precision="0"
          placeholder="请输入数量，如：10（增加）或 -5（扣减）"
          style="width: 100%"
        />
      </div>
    </a-modal>
    <!-- 充值积分弹窗 -->
    <a-modal
      v-model:open="pointsModalVisible"
      title="充值积分"
      @ok="handlePointsConfirm"
      @cancel="handlePointsCancel"
    >
      <div style="padding: 20px;">
        <p>请输入积分变化量（正数为增加，负数为扣减）：</p>
        <a-input-number
          v-model:value="pointsAmount"
          :precision="0"
          placeholder="请输入数量，如：100（增加）或 -50（扣减）"
          style="width: 100%"
        />
      </div>
    </a-modal>
    <!-- 钱包日志弹窗 -->
    <UserWalletLogsModal
      v-model:open="walletLogsModalVisible"
      :userInfo="currentWalletUser"
      @cancel="handleWalletLogsCancel"
    />
  </div>
</template>

<script lang="ts" name="system-user" setup>
  //ts语法
  import { ref, unref, onActivated } from 'vue';
  import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
  import UserDrawer from './UserDrawer.vue';
  import UserRecycleBinModal from './UserRecycleBinModal.vue';
  import PasswordModal from './PasswordModal.vue';
  import UserAgentModal from './UserAgentModal.vue';
  import UserQuitAgentModal from './UserQuitAgentModal.vue';
  import UserQuitModal from './UserQuitModal.vue';
  import UserWalletLogsModal from './UserWalletLogsModal.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { columns, searchFormSchema } from './user.data';
  import { listNoCareTenant, deleteUser, batchDeleteUser, getImportUrl, getExportUrl, frozenBatch, saveOrUpdateUser, rechargeUserBalance, rechargeFeeVouchers, rechargePoints } from './user.api';
  import { getFrozenQtyByUserId, getPositionCarNumByUserId } from '/@/views/dw/order/DwProductOrder.api';
  import { getAllUsersTradeGoals } from '/@/views/dw/close/TradeGoal.api';
  import { calculateDirectRewardByCycle } from '/@/views/dw/settlement/Reward.api';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { createMessage, createConfirm } = useMessage();
  const { isDisabledAuth } = usePermission();
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  //回收站model
  const [registerModal, { openModal }] = useModal();
  //密码model
  const [registerPasswordModal, { openModal: openPasswordModal }] = useModal();
  //代理人model
  const [registerAgentModal, { openModal: openAgentModal }] = useModal();
  //离职代理人model
  const [registerQuitAgentModal, { openModal: openQuitAgentModal }] = useModal();
  //离职用户列表model
  const [registerQuitModal, { openModal: openQuitModal }] = useModal();

  // 充值车数相关状态
  const rechargeModalVisible = ref(false);
  const rechargeAmount = ref(1);
  const currentRechargeRecord = ref<any>(null);

  // 充值余额相关状态
  const balanceRechargeModalVisible = ref(false);
  const balanceRechargeAmount = ref<number | null>(null);
  const balanceRechargeRemark = ref('后台充值');
  const currentBalanceRechargeUser = ref<any>(null);

  // 钱包日志弹窗相关状态
  const walletLogsModalVisible = ref(false);
  const currentWalletUser = ref<any>({});

  // 充值免手续费券相关状态
  const feeVouchersModalVisible = ref(false);
  const feeVouchersAmount = ref<number | null>(null);
  const currentFeeVouchersUser = ref<any>(null);

  // 充值积分相关状态
  const pointsModalVisible = ref(false);
  const pointsAmount = ref<number | null>(null);
  const currentPointsUser = ref<any>(null);

  // 列表页面公共参数、方法
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'user-list',
    tableProps: {
      title: '用户列表',
      api: listNoCareTenant,
      columns: columns,
      size: 'small',
      childrenColumnName: 'children_disabled', // 禁用树形结构，避免显示+号
      formConfig: {
        // labelWidth: 200,
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 380,
      },
      beforeFetch: (params) => {
        return Object.assign({ column: 'createTime', order: 'desc' }, params);
      },
      afterFetch: async (result) => {
        console.log('afterFetch 被调用了！', result);
        // 在获取用户数据后，计算每个用户的交易目标完成度
        // 注意：冻结车数和持仓车数已经在后端返回了，不需要再次请求
        if (result) {
          try {
            console.log('开始获取交易目标完成度...');

            // 获取所有用户的交易目标完成度
            let tradeGoalsMap = {};
            try {
              const tradeGoalsResponse = await getAllUsersTradeGoals();
              if (tradeGoalsResponse && Array.isArray(tradeGoalsResponse)) {
                // 将交易目标数据转换为Map,方便查找
                tradeGoalsMap = tradeGoalsResponse.reduce((map, goal) => {
                  map[goal.userId] = goal;
                  return map;
                }, {});
                console.log('交易目标完成度获取成功,共', tradeGoalsResponse.length, '条数据');
              }
            } catch (error) {
              console.error('获取交易目标完成度失败:', error);
            }

            // 设置交易目标数据，冻结车数和持仓车数已经从后端返回
            result.forEach(user => {
              // 确保后端返回的数据有默认值
              user.frozenQty = user.frozenQty || 0;
              user.positionCarNum = user.positionCarNum || 0;
              user.tradeGoal = tradeGoalsMap[user.id] || null;
            });

            console.log('所有用户的交易目标完成度设置完成');

          } catch (error) {
            console.error('获取用户数据失败:', error);
            // 如果获取失败，设置默认值
            result.forEach(user => {
              user.frozenQty = user.frozenQty || 0;
              user.positionCarNum = user.positionCarNum || 0;
              user.tradeGoal = user.tradeGoal || null;
            });
          }
        }

        return result;
      },
    },
    exportConfig: {
      name: '用户列表',
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
    },
  });

  //注册table数据
  const [registerTable, { reload, updateTableDataRecord }, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;

  // 页面激活时刷新数据
  onActivated(async () => {
    await reload();
  });

  /**
   * 新增事件
   */
  function handleCreate() {
    openDrawer(true, {
      isUpdate: false,
      showFooter: true,
      tenantSaas: false,
    });
  }
  /**
   * 编辑事件
   */
  async function handleEdit(record: Recordable) {
    openDrawer(true, {
      record,
      isUpdate: true,
      showFooter: true,
      tenantSaas: false,
    });
  }
  /**
   * 详情
   */
  async function handleDetail(record: Recordable) {
    openDrawer(true, {
      record,
      isUpdate: true,
      showFooter: false,
      tenantSaas: false,
    });
  }
  /**
   * 删除事件
   */
  async function handleDelete(record) {
    if ('admin' == record.username) {
      createMessage.warning('管理员账号不允许此操作！');
      return;
    }
    await deleteUser({ id: record.id }, reload);
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    let hasAdmin = unref(selectedRows).filter((item) => item.username == 'admin');
    if (unref(hasAdmin).length > 0) {
      createMessage.warning('管理员账号不允许此操作！');
      return;
    }
    await batchDeleteUser({ ids: selectedRowKeys.value }, () => {
      selectedRowKeys.value = [];
      reload();
    });
  }
  /**
   * 成功回调
   */
  function handleSuccess() {
    reload();
  }

  /**
   * 打开修改密码弹窗
   */
  function handleChangePassword(username) {
    openPasswordModal(true, { username });
  }
  /**
   * 打开代理人弹窗
   */
  function handleAgentSettings(userName) {
    openAgentModal(true, { userName });
  }
  /**
   * 冻结解冻
   */
  async function handleFrozen(record, status) {
    if ('admin' == record.username) {
      createMessage.warning('管理员账号不允许此操作！');
      return;
    }
    await frozenBatch({ ids: record.id, status: status }, reload);
  }
  /**
   * 批量冻结解冻
   */
  function batchFrozen(status) {
    let hasAdmin = selectedRows.value.filter((item) => item.username == 'admin');
    if (unref(hasAdmin).length > 0) {
      createMessage.warning('管理员账号不允许此操作！');
      return;
    }
    createConfirm({
      iconType: 'warning',
      title: '确认操作',
      content: '是否' + (status == 1 ? '解冻' : '冻结') + '选中账号?',
      onOk: async () => {
        await frozenBatch({ ids: unref(selectedRowKeys).join(','), status: status }, reload);
      },
    });
  }

  /**
   * 打开充值车数弹窗
   */
  function handleRecharge(record) {
    currentRechargeRecord.value = record;
    rechargeAmount.value = 1;
    rechargeModalVisible.value = true;
  }

  /**
   * 确认充值车数
   */
  async function handleRechargeConfirm() {
    if (!rechargeAmount.value || rechargeAmount.value === 0) {
      createMessage.warning('请输入有效的数量！');
      return;
    }
    
    if (!currentRechargeRecord.value) {
      createMessage.error('用户信息不存在！');
      return;
    }
    
    try {
      // 根据输入值的正负自动判断操作类型
      const currentTotalCarNum = currentRechargeRecord.value.totalCarNum || 0;
      const amount = rechargeAmount.value;
      const newTotalCarNum = currentTotalCarNum + amount; // 直接相加，正数增加，负数扣减
      
      // 检查是否会导致负数
      if (newTotalCarNum < 0) {
        createMessage.warning(`操作失败！当前车数为 ${currentTotalCarNum}，无法扣减 ${Math.abs(amount)} 个车数！`);
        return;
      }
      
      // 更新用户数据
      await saveOrUpdateUser({
        ...currentRechargeRecord.value,
        totalCarNum: newTotalCarNum
      }, true);
      
      const operationText = amount > 0 ? '增加' : '扣减';
      const operationAmount = Math.abs(amount);
      rechargeModalVisible.value = false;
      reload();
    } catch (error) {
      const operationText = rechargeAmount.value > 0 ? '增加' : '扣减';
      createMessage.error(`${operationText}失败，请重试！`);
    }
  }

  /**
   * 取消充值
   */
  function handleRechargeCancel() {
    rechargeModalVisible.value = false;
    rechargeAmount.value = 1;
    currentRechargeRecord.value = null;
  }

  /**
   * 打开充值余额弹窗
   */
  function handleBalanceRecharge(record) {
    currentBalanceRechargeUser.value = record;
    balanceRechargeAmount.value = null;
    balanceRechargeRemark.value = '后台充值';
    balanceRechargeModalVisible.value = true;
  }

  /**
   * 确认充值余额
   */
  async function handleBalanceRechargeConfirm() {
    if (!currentBalanceRechargeUser.value) {
      createMessage.error('用户信息不存在！');
      return;
    }
    if (!balanceRechargeAmount.value || balanceRechargeAmount.value <= 0) {
      createMessage.warning('请输入大于 0 的金额！');
      return;
    }
    try {
      await rechargeUserBalance({
        userId: currentBalanceRechargeUser.value.id,
        amount: balanceRechargeAmount.value,
        remark: balanceRechargeRemark.value?.trim() || '',
      });
      createMessage.success('充值成功！');
      balanceRechargeModalVisible.value = false;
      balanceRechargeAmount.value = null;
      balanceRechargeRemark.value = '后台充值';
      currentBalanceRechargeUser.value = null;
      reload();
    } catch (error) {
      console.error('充值余额失败', error);
      createMessage.error('充值失败，请稍后重试！');
    }
  }

  /**
   * 取消充值余额
   */
  function handleBalanceRechargeCancel() {
    balanceRechargeModalVisible.value = false;
    balanceRechargeAmount.value = null;
    balanceRechargeRemark.value = '后台充值';
    currentBalanceRechargeUser.value = null;
  }

  /**
   * 打开钱包日志弹窗
   */
  function handleViewWalletLogs(record) {
    currentWalletUser.value = record;
    walletLogsModalVisible.value = true;
  }

  /**
   * 取消查看钱包日志
   */
  function handleWalletLogsCancel() {
    walletLogsModalVisible.value = false;
    currentWalletUser.value = {};
  }

  /**
   * 打开充值免手续费券弹窗
   */
  function handleFeeVouchers(record) {
    currentFeeVouchersUser.value = record;
    feeVouchersAmount.value = null;
    feeVouchersModalVisible.value = true;
  }

  /**
   * 确认充值免手续费券
   */
  async function handleFeeVouchersConfirm() {
    if (!currentFeeVouchersUser.value) {
      createMessage.error('用户信息不存在！');
      return;
    }
    if (feeVouchersAmount.value === null || feeVouchersAmount.value === 0) {
      createMessage.warning('请输入有效的数量！');
      return;
    }
    try {
      await rechargeFeeVouchers({
        userId: currentFeeVouchersUser.value.id,
        amount: feeVouchersAmount.value,
      });
      const operationText = feeVouchersAmount.value > 0 ? '充值' : '扣减';
      createMessage.success(`${operationText}成功！`);
      feeVouchersModalVisible.value = false;
      feeVouchersAmount.value = null;
      currentFeeVouchersUser.value = null;
      reload();
    } catch (error) {
      console.error('充值免手续费券失败', error);
      createMessage.error('操作失败，请稍后重试！');
    }
  }

  /**
   * 取消充值免手续费券
   */
  function handleFeeVouchersCancel() {
    feeVouchersModalVisible.value = false;
    feeVouchersAmount.value = null;
    currentFeeVouchersUser.value = null;
  }

  /**
   * 打开充值积分弹窗
   */
  function handlePoints(record) {
    currentPointsUser.value = record;
    pointsAmount.value = null;
    pointsModalVisible.value = true;
  }

  /**
   * 确认充值积分
   */
  async function handlePointsConfirm() {
    if (!currentPointsUser.value) {
      createMessage.error('用户信息不存在！');
      return;
    }
    if (pointsAmount.value === null || pointsAmount.value === 0) {
      createMessage.warning('请输入有效的数量！');
      return;
    }
    try {
      await rechargePoints({
        userId: currentPointsUser.value.id,
        amount: pointsAmount.value,
      });
      const operationText = pointsAmount.value > 0 ? '充值' : '扣减';
      createMessage.success(`${operationText}成功！`);
      pointsModalVisible.value = false;
      pointsAmount.value = null;
      currentPointsUser.value = null;
      reload();
    } catch (error) {
      console.error('充值积分失败', error);
      createMessage.error('操作失败，请稍后重试！');
    }
  }

  /**
   * 取消充值积分
   */
  function handlePointsCancel() {
    pointsModalVisible.value = false;
    pointsAmount.value = null;
    currentPointsUser.value = null;
  }

  /**
   * 为指定用户结算直推奖励（按考核期结算当前考核期）
   */
  async function handleCalculateRewardForUser(record) {
    createConfirm({
      iconType: 'warning',
      title: '确认结算',
      content: `确定要为用户「${record.realname}」结算当前考核期的直推奖励吗？\n将结算该用户当前正在进行的考核期，历史考核期由后台自动结算。`,
      onOk: async () => {
        try {
          const loadingMsg = createMessage.loading({ content: '正在结算直推奖励，请稍候...', duration: 0 });
          // 不传 cycleNumber 参数，结算当前考核期
          const res = await calculateDirectRewardByCycle(record.id);
          loadingMsg();
          if (res.success !== false) {
            createMessage.success(res.message || res || '直推奖励结算完成');
            reload();
          } else {
            createMessage.error(res.message || '结算失败');
          }
        } catch (error) {
          console.error('结算直推奖励失败:', error);
          createMessage.error('结算失败: ' + (error.message || '未知错误'));
        }
      },
    });
  }

  /**
   *同步钉钉和微信回调
   */
  function onSyncFinally({ isToLocal }) {
    // 同步到本地时刷新下数据
    if (isToLocal) {
      reload();
    }
  }

  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '充值车数',
        onClick: handleRecharge.bind(null, record),
        color: 'success',
      },
      {
        label: '充值余额',
        onClick: handleBalanceRecharge.bind(null, record),
        color: 'warning',
      },
      {
        label: '充值手续费券',
        onClick: handleFeeVouchers.bind(null, record),
        color: 'success',
      },
      {
        label: '充值积分',
        onClick: handlePoints.bind(null, record),
        color: 'success',
      },
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        // ifShow: () => hasPermission('system:user:edit'),
      },
    ];
  }
  /**
   * 下拉操作栏
   */
  function getDropDownAction(record): ActionItem[] {
    return [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '密码',
        //auth: 'user:changepwd',
        onClick: handleChangePassword.bind(null, record.username),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
      {
        label: '冻结',
        ifShow: record.status == 1,
        popConfirm: {
          title: '确定冻结吗?',
          confirm: handleFrozen.bind(null, record, 2),
        },
      },
      {
        label: '解冻',
        ifShow: record.status == 2,
        popConfirm: {
          title: '确定解冻吗?',
          confirm: handleFrozen.bind(null, record, 1),
        },
      },
      {
        label: '结算直推奖励',
        onClick: handleCalculateRewardForUser.bind(null, record),
        color: 'success',
      },
      // {
      //   label: '代理人',
      //   onClick: handleAgentSettings.bind(null, record.username),
      // },
    ];
  }

  /**
   * 离职
   * @param userName
   */
  function handleQuit(userName) {
    //打开离职代理人弹窗
    openQuitAgentModal(true, { userName });
  }
</script>

<style scoped></style>
