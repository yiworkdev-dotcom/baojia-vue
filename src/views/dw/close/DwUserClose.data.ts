import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '用户',
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
    dataIndex: 'side',
    key: 'side',
    customRender: ({ record }) => {
      const getSideText = (side: string) => {
        switch(side) {
          case '1': return '多单平仓';
          case '2': return '空单平仓';
          case '3': return '正套平仓';
          case '4': return '反套平仓';
          default: return '-';
        }
      };
      return getSideText(record.side);
    }
   },
   {
    title: '平仓数量',
    align:"center",
    dataIndex: 'closeQty'
   },
   {
    title: '平仓申请价格',
    align:"center",
    dataIndex: 'closePrice'
   },
   {
    title: '实际平仓价格',
    align:"center",
    dataIndex: 'transactionPrice'
   },
   {
    title: '持仓时价格',
    align:"center",
    dataIndex: 'PositionHoldingPrice'
   },
   {
    title: '实际平仓基差',
    align:"center",
    dataIndex: 'transactionBasis'
   },
   {
    title: '持仓时基差',
    align:"center",
    dataIndex: 'PositionHoldingBasis'
   },
   {
    title: '基差',
    align:"center",
    dataIndex: 'basis'
   },
   {
    title: '平仓时间',
    align:"center",
    dataIndex: 'closeTime'
   },
   {
    title: '盈亏估值',
    align:"center",
    dataIndex: 'profitLoss'
   },
   {
    title: '平仓状态',
    align:"center",
    dataIndex: 'status_dictText'
   },
   {
    title: '审核人',
    align:"center",
    dataIndex: 'reviewUser_dictText'
   },
   {
    title: '审核时间',
    align:"center",
    dataIndex: 'reviewTime'
   },
   {
    title: '审核备注',
    align:"center",
    dataIndex: 'remark'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '用户',
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
    label: '对应的开仓',
    field: 'quoteId',
    component: 'Input',
  },
  {
    label: '产品名称',
    field: 'productName',
    component: 'Input',
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
        dictCode:"trade_side"
     },
    dynamicRules: () => {
          return [
                 { required: true, message: '请选择买卖方向!'},
          ];
     },
  },
  {
    label: '平仓数量',
    field: 'closeQty',
    component: 'InputNumber',
    dynamicRules: () => {
          return [
                 { required: true, message: '请输入平仓数量!'},
          ];
     },
  },
  {
    label: '平仓申请价格',
    field: 'closePrice',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      min: 0,
    },
  },
  {
    label: '实际平仓价格',
    field: 'transactionPrice',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      min: 0,
    },
  },
  {
    label: '实际平仓基差',
    field: 'transactionBasis',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      min: 0,
    },
  },
  {
    label: '基差',
    field: 'basis',
    component: 'InputNumber',
  },
  {
    label: '平仓时间',
    field: 'closeTime',
    component: 'DatePicker',
    componentProps: {
       showTime: true,
       valueFormat: 'YYYY-MM-DD HH:mm:ss'
     },
  },
  {
    label: '盈亏估值',
    field: 'profitLoss',
    component: 'InputNumber',
  },
  {
    label: '平仓状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"close_status"
     },
  },
  {
    label: '审核人',
    field: 'reviewUser',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"sys_user,realname,id"
     },
  },
  {
    label: '审核时间',
    field: 'reviewTime',
    component: 'DatePicker',
    componentProps: {
       showTime: true,
       valueFormat: 'YYYY-MM-DD HH:mm:ss'
     },
  },
  {
    label: '审核备注',
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
  userId: {title: '用户',order: 0,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  productName: {title: '产品名称',order: 1,view: 'text', type: 'string',},
  quoteName: {title: '期货产品名称',order: 2,view: 'text', type: 'string',},
  quoteCode: {title: '期货产品合约号',order: 3,view: 'text', type: 'string',},
  side: {title: '买卖方向',order: 4,view: 'list', type: 'string',dictCode: 'trade_side',},
  closeQty: {title: '平仓数量',order: 5,view: 'number', type: 'number',},
  closePrice: {title: '平仓申请价格',order: 6,view: 'number', type: 'number',},
  transactionPrice: {title: '实际平仓价格',order: 7,view: 'number', type: 'number',},
  basis: {title: '基差',order: 8,view: 'number', type: 'number',},
  closeTime: {title: '平仓时间',order: 9,view: 'datetime', type: 'string',},
  profitLoss: {title: '盈亏估值',order: 10,view: 'number', type: 'number',},
  status: {title: '平仓状态',order: 11,view: 'number', type: 'number',dictCode: 'close_status',},
  reviewUser: {title: '审核人',order: 12,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  reviewTime: {title: '审核时间',order: 13,view: 'datetime', type: 'string',},
  remark: {title: '审核备注',order: 14,view: 'text', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}