import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { h } from 'vue';

// 带钢价格，用于价格对比
let mainProductPrice = 0;

// 设置带钢价格的函数
export const setMainProductPrice = (price: number) => {
  mainProductPrice = price;
};

// 获取带钢价格的函数
export const getMainProductPrice = () => {
  return mainProductPrice;
};

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
    dataIndex: 'quoteName',
    width: 120
   },
   {
    title: '期货产品合约号',
    align:"center",
    dataIndex: 'quoteCode',
    width: 120
   },
   {
    title: '买卖方向',
    align:"center",
    dataIndex: 'side_dictText'
   },
   {
    title: '下单价格',
    align:"center",
    dataIndex: 'quotePrice',
    width: 160,
    customRender: ({ text }) => {
      // 检查价格是否为空或无效
      if (!text || text === '' || text === null || text === undefined) {
        return h('span', {}, text || '');
      }
      
      const quotePrice = Number(text);
      if (isNaN(quotePrice)) {
        return h('span', {}, text);
      }
      
      const difference = quotePrice - mainProductPrice;
      const isHigher = difference > 0;
      const absDifference = Math.abs(difference);
      
      return h('div', { style: 'display: flex; align-items: center; justify-content: center;' }, [
        h('span', { style: 'margin-right: 4px;' }, text),
        h('span', {
          style: `color: ${isHigher ? '#ff4d4f' : '#52c41a'}; font-weight: bold; font-size: 16px;`,
        }, isHigher ? `+${absDifference}` : `-${absDifference}`)
      ]);
    }
   },
   {
    title: '成交价格',
    align:"center",
    dataIndex: 'transactionPrice',
    width: 160,
    customRender: ({ text }) => {
      // 检查价格是否为空或无效
      if (!text || text === '' || text === null || text === undefined) {
        return h('span', {}, text || '');
      }
      
      const transactionPrice = Number(text);
      if (isNaN(transactionPrice)) {
        return h('span', {}, text);
      }
      
      const difference = transactionPrice - mainProductPrice;
      const isHigher = difference > 0;
      const absDifference = Math.abs(difference);
      
      return h('div', { style: 'display: flex; align-items: center; justify-content: center;' }, [
        h('span', { style: 'margin-right: 4px;' }, text),
        h('span', {
          style: `color: ${isHigher ? '#ff4d4f' : '#52c41a'}; font-weight: bold; font-size: 16px;`,
        }, isHigher ? `+${absDifference}` : `-${absDifference}`)
      ]);
    }
   },
   {
    title: '下单基差',
    align:"center",
    dataIndex: 'basis'
   },
      {
    title: '成交基差',
    align:"center",
    dataIndex: 'transactionBasis'
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
    title: '下单状态',
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
    title: '成交时间',
    align:"center",
    dataIndex: 'quotationTime'
   },
   {
    title: '撤单时间',
    align:"center",
    dataIndex: 'cancellationTime'
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
    label: '下单状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"quote_status"
     },
    dynamicRules: () => {
          return [
                 { required: true, message: '请输入下单状态!'},
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
  quotePrice: {title: '下单价格',order: 5,view: 'number', type: 'number',},
  basis: {title: '基差',order: 6,view: 'number', type: 'number',},
  qty: {title: '交易车数',order: 6,view: 'number', type: 'number',},
  createTime: {title: '提交时间',order: 8,view: 'datetime', type: 'string',},
  status: {title: '下单状态',order: 9,view: 'number', type: 'number',dictCode: 'quote_status',},
  updateTime: {title: '更新日期',order: 10,view: 'datetime', type: 'string',},
  remark: {title: '审核备注',order: 11,view: 'text', type: 'string',},
  reviewUser: {title: '审核人',order: 12,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  reviewTime: {title: '审核时间',order: 13,view: 'datetime', type: 'string',},
  transactionPrice: {title: '成交价格',order: 14,view: 'number', type: 'number',},
  quotationTime: {title: '成交时间',order: 15,view: 'datetime', type: 'string',},
  cancellationTime: {title: '撤单时间',order: 16,view: 'datetime', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}