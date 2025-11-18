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
    title: '余额变化',
    align:"center",
    dataIndex: 'amount',
    width: 130,
    customRender: ({ text }) => {
      if (!text) return '0.00';
      const prefix = text > 0 ? '+' : '';
      const color = text > 0 ? 'green' : 'red';
      return h(
        'span',
        { style: { color, fontWeight: 'bold' } },
        `${prefix}${Number(text).toFixed(2)}`
      );
    }
   },
   {
    title: '手数变化',
    align:"center",
    dataIndex: 'handsChange',
    width: 110,
    customRender: ({ text }) => {
      if (!text) return '-';
      const prefix = text > 0 ? '+' : '';
      const color = text > 0 ? 'green' : 'red';
      return h(
        'span',
        { style: { color } },
        `${prefix}${text}手`
      );
    }
   },
   {
    title: '变动类型',
    align:"center",
    dataIndex: 'type',
    width: 110,
   },
   {
    title: '备注',
    align:"center",
    dataIndex: 'remark',
    width: 200
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
      dictCode: 'type',   
      placeholder: '请选择变动类型'
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
    label: 'userId',
    field: 'userId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入userId!'},
          ];
     },
  },
  {
    label: '余额变化金额（正数增加，负数减少）',
    field: 'amount',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入余额变化金额（正数增加，负数减少）!'},
          ];
     },
  },
  {
    label: '手数变化（正负）',
    field: 'handsChange',
    component: 'InputNumber',
  },
  {
    label: '变动类型字典ID，如 1=直推奖励 2=级差 3=后台充值',
    field: 'type',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入变动类型字典ID，如 1=直推奖励 2=级差 3=后台充值!'},
          ];
     },
  },
  {
    label: '备注',
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
  userId: {title: 'userId',order: 0,view: 'text', type: 'string',},
  amount: {title: '余额变化金额（正数增加，负数减少）',order: 1,view: 'number', type: 'number',},
  handsChange: {title: '手数变化（正负）',order: 2,view: 'number', type: 'number',},
  type: {title: '变动类型字典ID，如 1=直推奖励 2=级差 3=后台充值',order: 3,view: 'number', type: 'number',},
  remark: {title: '备注',order: 4,view: 'text', type: 'string',},
  createdAt: {title: 'createdAt',order: 5,view: 'datetime', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}