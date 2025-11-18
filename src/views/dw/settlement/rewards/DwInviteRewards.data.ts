import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '获奖人',
    align:"center",
    dataIndex: 'inviterId_dictText',
    width: 120
   },
   {
    title: '交易用户',
    align:"center",
    dataIndex: 'userId_dictText',
    width: 120
   },
   {
    title: '交易ID',
    align:"center",
    dataIndex: 'tradeId',
    width: 180
   },
   {
    title: '奖励类型',
    align:"center",
    dataIndex: 'rewardType',
    width: 100,
    customRender: ({ text }) => {
      const typeMap = { 1: '直推奖励', 2: '级差奖励', 3: '后台充值' };
      return typeMap[text] || text;
    }
   },
   {
    title: '奖励金额',
    align:"center",
    dataIndex: 'amount',
    width: 120,
    customRender: ({ text }) => {
      return text ? `¥${Number(text).toFixed(2)}` : '¥0.00';
    }
   },
   {
    title: '备注',
    align:"center",
    dataIndex: 'remark',
    width: 200
   },
   {
    title: '发放时间',
    align:"center",
    dataIndex: 'createdAt',
    width: 160
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '获奖人',
    field: 'inviterId',
    component: 'JSelectUserByDep',
    componentProps:{},
  },
  {
    label: '奖励类型',
    field: 'rewardType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: '',
      placeholder: '请选择奖励类型',
      options: [
        { label: '直推奖励', value: 1 },
        { label: '级差奖励', value: 2 },
        { label: '后台充值', value: 3 }
      ]
    },
  },
  {
    label: '发放时间',
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
    label: '上级推荐人ID',
    field: 'inviterId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入上级推荐人ID!'},
          ];
     },
  },
  {
    label: '产生交易的用户ID',
    field: 'userId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入产生交易的用户ID!'},
          ];
     },
  },
  {
    label: '交易ID或订单号',
    field: 'tradeId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入交易ID或订单号!'},
          ];
     },
  },
  {
    label: '奖励类型字典，如1直推，2级差',
    field: 'rewardType',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入奖励类型字典，如1直推，2级差!'},
          ];
     },
  },
  {
    label: '奖励金额',
    field: 'amount',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入奖励金额!'},
          ];
     },
  },
  {
    label: '说明，例如首单350奖励',
    field: 'remark',
    component: 'Input',
  },
  {
    label: 'createdAt',
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
  inviterId: {title: '上级推荐人ID',order: 0,view: 'text', type: 'string',},
  userId: {title: '产生交易的用户ID',order: 1,view: 'text', type: 'string',},
  tradeId: {title: '交易ID或订单号',order: 2,view: 'text', type: 'string',},
  rewardType: {title: '奖励类型字典，如1直推，2级差',order: 3,view: 'number', type: 'number',},
  amount: {title: '奖励金额',order: 4,view: 'number', type: 'number',},
  remark: {title: '说明，例如首单350奖励',order: 5,view: 'text', type: 'string',},
  createdAt: {title: 'createdAt',order: 6,view: 'datetime', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}