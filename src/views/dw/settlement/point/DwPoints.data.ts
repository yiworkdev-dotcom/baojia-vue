import { h } from 'vue';
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
    dataIndex: 'userId_dictText',
    width: 120
   },
   {
    title: '积分变化',
    align:"center",
    dataIndex: 'changeAmount',
    width: 120,
    customRender: ({ text }) => {
      if (!text) return '0';
      const prefix = text > 0 ? '+' : '';
      const color = text > 0 ? 'green' : 'red';
      return h(
        'span',
        { style: { color, fontWeight: 'bold' } },
        `${prefix}${text}`
      );
    }
   },
   {
    title: '变动类型',
    align:"center",
    dataIndex: 'type',
    width: 120,
    customRender: ({ text }) => {
      const typeMap = { 1: '交易获得', 2: '兑换消耗' };
      return typeMap[text] || text;
    }
   },
   {
    title: '变动时间',
    align:"center",
    dataIndex: 'createdAt',
    width: 160
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '用户',
    field: 'userId',
    component: 'JSelectUserByDep',
    componentProps:{},
  },
  {
    label: '变动类型',
    field: 'type',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: '',
      placeholder: '请选择变动类型',
      options: [
        { label: '交易获得', value: 1 },
        { label: '兑换消耗', value: 2 }
      ]
    },
  },
  {
    label: '变动时间',
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
    label: '用户',
    field: 'userId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入用户!'},
          ];
     },
  },
  {
    label: '积分变化（+1 或 -30）',
    field: 'changeAmount',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入积分变化（+1 或 -30）!'},
          ];
     },
  },
  {
    label: '来源：交易或兑换',
    field: 'type',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入来源：交易或兑换!'},
          ];
     },
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
  userId: {title: '用户',order: 0,view: 'text', type: 'string',},
  changeAmount: {title: '积分变化（+1 或 -30）',order: 1,view: 'number', type: 'number',},
  type: {title: '来源：交易或兑换',order: 2,view: 'number', type: 'number',},
  createdAt: {title: 'createdAt',order: 3,view: 'datetime', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}