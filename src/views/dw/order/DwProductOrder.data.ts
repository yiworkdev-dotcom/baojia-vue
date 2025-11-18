import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
import { h } from 'vue';

//列表数据
export const columns: BasicColumn[] = [
  {
    title:"订单号",
    align:"center",
    dataIndex: 'orderNo'
  },
   {
    title: '审核员',
    align:"center",
    dataIndex: 'createBy_dictText'
   },
   {
    title: '下单用户',
    align:"center",
    dataIndex: 'userId_dictText'
   },
   {
    title: '产品名称',
    align:"center",
    dataIndex: 'productName'
   },
   {
    title: '期货产品名称',
    align:"center",
    dataIndex: 'quoteName'
   },
   {
    title: '期货产品合约号',
    align:"center",
    dataIndex: 'quoteCode'
   },
   {
    title: '买卖方向',
    align:"center",
    dataIndex: 'side_dictText',
    customRender: ({ text }) => {
      return h('span', { 
        class: `side-tag ${text === '买入' ? 'side-buy' : 'side-sell'}` 
      }, text);
    }
   },
   {
    title: '交易车数',
    align:"center",
    dataIndex: 'qty',
    customRender: ({ text }) => {
      return h('span', { class: 'quantity' }, text);
    }
   },
   {
    title: '冻结车数',
    align:"center",
    dataIndex: 'frozenQty',
    customRender: ({ text }) => {
      return h('span', { class: 'quantity' }, text);
    }
   },
   {
    title: '持仓',
    align:"center",
    dataIndex: 'positionHoldingQty',
    customRender: ({ text }) => {
      return h('span', { class: 'quantity' }, text);
    }
   },
   {
    title: '报价价格',
    align:"center",
    dataIndex: 'price',
    customRender: ({ text }) => {
      return h('span', { class: 'price' }, text);
    }
   },
   {
    title: '成交价格',
    align:"center",
    dataIndex: 'transactionPrice',
    customRender: ({ text }) => {
      return h('span', { class: 'price' }, text);
    }
   },
   {
    title: '成交基差',
    align:"center",
    dataIndex: 'transactionBasis',
    customRender: ({ text }) => {
      return h('span', { class: 'price' }, text);
    }
   },
   {
    title: '基差',
    align:"center",
    dataIndex: 'basis',
    customRender: ({ text }) => {
      return h('span', { class: 'price' }, text);
    }
   },
   {
    title: '订单状态',
    align:"center",
    dataIndex: 'status_dictText',
    customRender: ({ text }) => {
      let statusClass = 'status-pending';
      if (text === '已成交') statusClass = 'status-completed';
      else if (text === '已取消') statusClass = 'status-cancelled';
      else if (text === '部分成交') statusClass = 'status-partial';
      
      return h('span', { 
        class: `status-tag ${statusClass}` 
      }, text);
    }
   },
   {
    title: '盈利估值',
    align:"center",
    dataIndex: 'profitValuation',
    customRender: ({ text }) => {
      return h('span', { class: 'price' }, text);
    }
   },
   {
    title: '成交时间',
    align:"center",
    dataIndex: 'createTime',
    width: 150
   },
   {
    title: '备注',
    align:"center",
    dataIndex: 'remark'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
	{
      label: "买卖方向",
      field: 'side',
      component: 'JDictSelectTag',
      componentProps:{
          dictCode:"order_side"
      },
      //colProps: {span: 6},
 	},
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '下单用户',
    field: 'userId',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"sys_user,realname,id"
     },
    dynamicRules: () => {
          return [
                 { required: true, message: '请输入用户!'},
          ];
     },
  },
  {
    label: '产品名称',
    field: 'productName',
    component: 'Input',
    dynamicRules: () => {
          return [
                 { required: true, message: '请输入产品名称!'},
          ];
     },
  },
  {
    label: '期货产品名称',
    field: 'quoteName',
    component: 'Input',
  },
  {
    label: '期货产品合约号',
    field: 'quoteCode',
    component: 'Input',
  },
  {
    label: '买卖方向',
    field: 'side',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"order_side"
     },
    dynamicRules: () => {
          return [
                 { required: true, message: '请输入买卖方向!'},
          ];
     },
  },
  {
    label: '交易车数',
    field: 'qty',
    component: 'InputNumber',
    dynamicRules: () => {
          return [
                 { required: true, message: '请输入交易车数!'},
          ];
     },
  },
  {
    label: '冻结车数',
    field: 'frozenQty',
    component: 'InputNumber',
  },
  {
    label: '持仓',
    field: 'positionHoldingQty',
    component: 'InputNumber',
  },
  {
    label: '基差',
    field: 'basis',
    component: 'InputNumber',
  },
  {
    label: '订单状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"quote_status"
     },
    dynamicRules: () => {
          return [
                 { required: true, message: '请输入订单状态!'},
          ];
     },
  },

  {
    label: '盈利估值',
    field: 'profitValuation',
    component: 'Input',
  },
  {
    label: '成交价格',
    field: 'transactionPrice',
    component: 'InputNumber',
  },
  {
    label: '成交基差',
    field: 'transactionBasis',
    component: 'InputNumber',
  },
  {
    label: '成交时间',
    field: 'createTime',
    component: 'DatePicker',
    dynamicRules: () => {
          return [
                 { required: true, message: '请输入成交时间!'},
          ];
     },
  },

  {
    label: '备注',
    field: 'remark',
    component: 'Input',
  },
	// TODO 主键隐藏字段，目前写死为ID
	{
	  label: '',
	  field: 'id',
	  component: 'Input',
	  show: false
	},
];

// 高级查询数据
export const superQuerySchema = {
  createBy: {title: '操作员',order: 0,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  userId: {title: '下单用户',order: 1,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  productName: {title: '产品名称',order: 2,view: 'text', type: 'string',},
  quoteName: {title: '期货产品名称',order: 3,view: 'text', type: 'string',},
  quoteCode: {title: '期货产品合约号',order: 4,view: 'text', type: 'string',},
  side: {title: '买卖方向',order: 5,view: 'list', type: 'string',dictCode: 'order_side',},
  qty: {title: '交易车数',order: 6,view: 'number', type: 'number',},
  frozenQty: {title: '冻结车数',order: 7,view: 'number', type: 'number',},
  positionHoldingQty: {title: '持仓',order: 8,view: 'number', type: 'number',},
  price: {title: '报价价格',order: 9,view: 'number', type: 'number',},
  transactionPrice: {title: '成交价格',order: 10,view: 'number', type: 'number',},
  transactionBasis: {title: '成交基差',order: 11,view: 'number', type: 'number',},
  basis: {title: '基差',order: 12,view: 'number', type: 'number',},
  status: {title: '订单状态',order: 13,view: 'list', type: 'string',dictCode: 'product_status',},
  profitValuation: {title: '盈利估值',order: 14,view: 'text', type: 'string',},
  createTime: {title: '成交时间',order: 15,view: 'date', type: 'string',},
  remark: {title: '备注',order: 16,view: 'text', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}