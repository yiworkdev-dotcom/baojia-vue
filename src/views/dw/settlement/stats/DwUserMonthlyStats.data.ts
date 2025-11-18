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
    title: '统计月份',
    align:"center",
    dataIndex: 'month',
    width: 120,
    customRender:({text}) =>{
      if (!text) return '-';
      // 格式化为 YYYY-MM
      const date = new Date(text);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    },
   },
   {
    title: '直推人数',
    align:"center",
    dataIndex: 'referCount',
    width: 100,
    customRender: ({ text }) => {
      return text !== null && text !== undefined ? `${text}人` : '0人';
    }
   },
   {
    title: '本人手数',
    align:"center",
    dataIndex: 'selfHands',
    width: 100,
    customRender: ({ text }) => {
      return text !== null && text !== undefined ? `${text}手` : '0手';
    }
   },
   {
    title: '团队手数',
    align:"center",
    dataIndex: 'teamHands',
    width: 100,
    customRender: ({ text }) => {
      return text !== null && text !== undefined ? `${text}手` : '0手';
    }
   },
   {
    title: '有效会员',
    align:"center",
    dataIndex: 'teamValidUsers',
    width: 100,
    customRender: ({ text }) => {
      return text !== null && text !== undefined ? `${text}人` : '0人';
    }
   },
   {
    title: '创建时间',
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
    label: '统计月份',
    field: 'month',
    component: 'MonthPicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择统计月份'
    },
  },
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '团队队长',
    field: 'userId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入团队队长!'},
          ];
     },
  },
  {
    label: '统计月份',
    field: 'month',
    component: 'DatePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD'
    },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入统计月份!'},
          ];
     },
  },
  {
    label: '直推人数',
    field: 'referCount',
    component: 'InputNumber',
  },
  {
    label: '本月自行交易手数',
    field: 'selfHands',
    component: 'InputNumber',
  },
  {
    label: '团队总手数',
    field: 'teamHands',
    component: 'InputNumber',
  },
  {
    label: '团队有效会员数（30天≥3手）',
    field: 'teamValidUsers',
    component: 'InputNumber',
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
  userId: {title: '团队队长',order: 0,view: 'text', type: 'string',},
  month: {title: '统计月份',order: 1,view: 'date', type: 'string',},
  referCount: {title: '直推人数',order: 2,view: 'number', type: 'number',},
  selfHands: {title: '本月自行交易手数',order: 3,view: 'number', type: 'number',},
  teamHands: {title: '团队总手数',order: 4,view: 'number', type: 'number',},
  teamValidUsers: {title: '团队有效会员数（30天≥3手）',order: 5,view: 'number', type: 'number',},
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