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
    dataIndex: 'side_dictText'
   },
      {
    title: '原报价价格',
    align:"center",
    dataIndex: 'oldPrice'
   },
   {
    title: '调整后报价价格',
    align:"center",
    dataIndex: 'quotePrice'
   },
   {
    title: '基差',
    align:"center",
    dataIndex: 'basis'
   },
   {
    title: '交易车数',
    align:"center",
    dataIndex: 'qty'
   },
   {
    title: '提交时间',
    align:"center",
    dataIndex: 'createTime'
   },
   {
    title: '报价状态',
    align:"center",
    dataIndex: 'status_dictText'
   },
   {
    title: '更新日期',
    align:"center",
    dataIndex: 'updateTime'
   },
   {
    title: '审核备注',
    align:"center",
    dataIndex: 'remark'
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
    title: '成交价格',
    align:"center",
    dataIndex: 'transactionPrice'
   },
   {
    title: '成交时间',
    align:"center",
    dataIndex: 'quotationTime'
   },
   {
    title: '撤单时间',
    align:"center",
    dataIndex: 'cancellationTime'
   },
   {
    title: '关联报价记录',
    align:"center",
    dataIndex: 'quoteId_dictText'
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
        dictCode:"order_side"
     },
    dynamicRules: () => {
          return [
                 { required: true, message: '请输入买卖方向!'},
          ];
     },
  },
  {
    label: '调整后报价价格',
    field: 'quotePrice',
    component: 'InputNumber',
  },
  {
    label: '基差',
    field: 'basis',
    component: 'InputNumber',
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
    label: '提交时间',
    field: 'createTime',
    component: 'DatePicker',
    componentProps: {
       showTime: true,
       valueFormat: 'YYYY-MM-DD HH:mm:ss'
     },
    dynamicRules: () => {
          return [
                 { required: true, message: '请输入提交时间!'},
          ];
     },
  },
  {
    label: '报价状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"quote_status"
     },
    dynamicRules: () => {
          return [
                 { required: true, message: '请输入报价状态!'},
          ];
     },
  },
  {
    label: '更新日期',
    field: 'updateTime',
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
    label: '成交价格',
    field: 'transactionPrice',
    component: 'InputNumber',
  },
  {
    label: '成交时间',
    field: 'quotationTime',
    component: 'DatePicker',
    componentProps: {
       showTime: true,
       valueFormat: 'YYYY-MM-DD HH:mm:ss'
     },
  },
  {
    label: '撤单时间',
    field: 'cancellationTime',
    component: 'DatePicker',
    componentProps: {
       showTime: true,
       valueFormat: 'YYYY-MM-DD HH:mm:ss'
     },
  },
  {
    label: '关联报价记录',
    field: 'quoteId',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"dw_user_quote,id,id"
     },
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
  side: {title: '买卖方向',order: 4,view: 'list', type: 'string',dictCode: 'order_side',},
  oldPrice: {title: '原报价价格',order: 5,view: 'number', type: 'number',},
  quotePrice: {title: '调整后报价价格',order: 6,view: 'number', type: 'number',},
  basis: {title: '基差',order: 7,view: 'number', type: 'number',},
  qty: {title: '交易车数',order: 8,view: 'number', type: 'number',},
  createTime: {title: '提交时间',order: 9,view: 'datetime', type: 'string',},
  status: {title: '报价状态',order: 10,view: 'number', type: 'number',dictCode: 'quote_status',},
  updateTime: {title: '更新日期',order: 11,view: 'datetime', type: 'string',},
  remark: {title: '审核备注',order: 12,view: 'text', type: 'string',},
  reviewUser: {title: '审核人',order: 13,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  reviewTime: {title: '审核时间',order: 14,view: 'datetime', type: 'string',},
  transactionPrice: {title: '成交价格',order: 15,view: 'number', type: 'number',},
  quotationTime: {title: '成交时间',order: 16,view: 'datetime', type: 'string',},
  cancellationTime: {title: '撤单时间',order: 17,view: 'datetime', type: 'string',},
  quoteId: {title: '关联报价记录',order: 18,view: 'list', type: 'string',dictTable: "dw_user_quote", dictCode: 'id', dictText: 'id',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}