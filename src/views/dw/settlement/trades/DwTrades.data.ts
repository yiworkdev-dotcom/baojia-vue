import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '交易用户',
    align:"center",
    dataIndex: 'userId_dictText',
    width: 120
   },
   {
    title: '订单号',
    align:"center",
    dataIndex: 'orderNo',
    width: 180
   },
   {
    title: '买卖方向',
    align:"center",
    dataIndex: 'side_dictText',
    width: 100,
    customRender: ({ text }) => {
      const sideMap = { 1: '买入', 2: '卖出', 3: '反套', 4: '正套' };
      return sideMap[text] || text;
    }
   },
   {
    title: '审核用户',
    align:"center",
    dataIndex: 'reviewUser_dictText',
    width: 120
   },
   {
    title: '交易手数',
    align:"center",
    dataIndex: 'hands',
    width: 100,
    customRender: ({ text }) => {
      return text ? `${text}手` : '0手';
    }
   },
   {
    title: '免手续费',
    align:"center",
    dataIndex: 'isFree',
    width: 100,
    customRender: ({ text }) => {
      return text === 1 ? '是' : '否';
    }
   },
   {
    title: '手续费',
    align:"center",
    dataIndex: 'fee',
    width: 100,
    customRender: ({ text }) => {
      return text ? `¥${text}` : '¥0';
    }
   },
   {
    title: '交易时间',
    align:"center",
    dataIndex: 'createdAt',
    width: 160
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '交易用户',
    field: 'userId',
    component: 'JSelectUserByDep',
    componentProps:{},
  },
  {
    label: '交易时间',
    field: 'createdAt',
    component: 'RangePicker',
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    },
  },
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '交易用户',
    field: 'userId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入交易用户!'},
          ];
     },
  },
  {
    label: '订单id',
    field: 'orderId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入订单id!'},
          ];
     },
  },
  {
    label: '订单号',
    field: 'orderNo',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入订单号!'},
          ];
     },
  },
  {
    label: '买卖方向',
    field: 'side',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入买卖方向!'},
          ];
     },
  },
  {
    label: '审核用户',
    field: 'reviewUser',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入审核用户!'},
          ];
     },
  },
  {
    label: '手数（一般为1手）',
    field: 'hands',
    component: 'InputNumber',
  },
  {
    label: '是否使用免手续费券',
    field: 'isFree',
    component: 'InputNumber',
  },
  {
    label: '实际手续费',
    field: 'fee',
    component: 'InputNumber',
  },
  {
    label: '时间',
    field: 'createdAt',
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
  userId: {title: '交易用户',order: 0,view: 'text', type: 'string',},
  orderId: {title: '订单id',order: 1,view: 'text', type: 'string',},
  orderNo: {title: '订单号',order: 2,view: 'text', type: 'string',},
  side: {title: '买卖方向',order: 3,view: 'number', type: 'number',},
  reviewUser: {title: '审核用户',order: 4,view: 'text', type: 'string',},
  hands: {title: '手数（一般为1手）',order: 5,view: 'number', type: 'number',},
  isFree: {title: '是否使用免手续费券',order: 6,view: 'number', type: 'number',},
  fee: {title: '实际手续费',order: 7,view: 'number', type: 'number',},
  createdAt: {title: '时间',order: 8,view: 'datetime', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}