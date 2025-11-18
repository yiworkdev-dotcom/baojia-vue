<template>
  <a-modal
    v-model:open="visible"
    title="钱包变更记录"
    width="1000px"
    :footer="null"
    @cancel="handleCancel"
  >
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <span style="font-weight: bold;">用户: {{ userName }} - 当前余额: ¥{{ currentBalance }}</span>
      </template>
    </BasicTable>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, unref, watch } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { list as getDwWalletLogsList } from '/@/views/dw/settlement/wallets-log/DwWalletLogs.api';
  import { BasicColumn } from '/@/components/Table';

  const emit = defineEmits(['cancel']);
  const props = defineProps({
    open: {
      type: Boolean,
      default: false,
    },
    userInfo: {
      type: Object,
      default: () => ({}),
    },
  });

  const visible = ref(false);
  const userName = ref('');
  const currentBalance = ref('0.00');

  // 定义钱包日志列
  const columns: BasicColumn[] = [
    {
      title: '变动时间',
      dataIndex: 'createdAt',
      width: 150,
    },
    {
      title: '余额变化',
      dataIndex: 'amount',
      width: 130,
      customRender: ({ text }) => {
        if (!text || text === 0) return '¥0.00';
        const prefix = text > 0 ? '+' : '';
        const color = text > 0 ? 'green' : 'red';
        return `<span style="color: ${color}; font-weight: bold;">${prefix}¥${Number(text).toFixed(2)}</span>`;
      },
    },
    {
      title: '手数变化',
      dataIndex: 'handsChange',
      width: 100,
      customRender: ({ text }) => {
        if (!text || text === 0) return '0手';
        const prefix = text > 0 ? '+' : '';
        const color = text > 0 ? 'green' : 'red';
        return `<span style="color: ${color}; font-weight: bold;">${prefix}${text}手</span>`;
      },
    },
    {
      title: '变动类型',
      dataIndex: 'type',
      width: 110,
      customRender: ({ text }) => {
        const typeMap = {
          1: '直推奖励',
          2: '级差奖励',
          3: '后台充值',
          4: '提现',
          5: '手续费扣除',
        };
        return typeMap[text] || text;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 200,
    },
  ];

  const [registerTable, { reload, setProps }] = useTable({
    columns,
    api: getDwWalletLogsList,
    canResize: true,
    showIndexColumn: false,
    pagination: {
      pageSize: 10,
    },
    beforeFetch: (params) => {
      // 添加用户ID过滤条件
      return {
        ...params,
        userId: props.userInfo.id,
      };
    },
  });

  // 监听props变化
  watch(
    () => props.open,
    (val) => {
      visible.value = val;
      if (val && props.userInfo) {
        userName.value = props.userInfo.realname || props.userInfo.username || '';
        currentBalance.value =
          props.userInfo.walletBalance !== null && props.userInfo.walletBalance !== undefined
            ? Number(props.userInfo.walletBalance).toFixed(2)
            : '0.00';
        reload();
      }
    },
    { immediate: true }
  );

  const handleCancel = () => {
    emit('cancel');
  };
</script>

<style scoped>
  :deep(.ant-modal-body) {
    padding: 16px;
  }
</style>
