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
    title: '账户余额',
    align:"center",
    dataIndex: 'balance',
    width: 150,
    customRender: ({ text }) => {
      return text !== null && text !== undefined ? `¥${Number(text).toFixed(2)}` : '¥0.00';
    }
   },
   {
    title: '免费手数余额',
    align:"center",
    dataIndex: 'handsBalance',
    width: 120,
    customRender: ({ text }) => {
      return text ? `${text}手` : '0手';
    }
   },
   {
    title: '更新时间',
    align:"center",
    dataIndex: 'updatedAt',
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
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '用户',
    field: 'userId',
    component: 'JSelectUserByDep',
    componentProps:{},
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请选择用户!'},
          ];
     },
  },
  {
    label: '账户余额',
    field: 'balance',
    component: 'InputNumber',
    componentProps: {
      min: 0,
      step: 0.01,
      precision: 2,
      placeholder: '请输入账户余额'
    },
    dynamicDisabled: true,
  },
  {
    label: '免费手数余额',
    field: 'handsBalance',
    component: 'InputNumber',
    componentProps: {
      min: 0,
      placeholder: '请输入免费手数余额'
    },
    dynamicDisabled: true,
  },
  {
    label: '更新时间',
    field: 'updatedAt',
    component: 'DatePicker',
    componentProps: {
       showTime: true,
       valueFormat: 'YYYY-MM-DD HH:mm:ss',
       disabled: true
     },
    show: false,
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
  userId: {title: '用户ID',order: 0,view: 'text', type: 'string',},
  balance: {title: '账户余额',order: 1,view: 'number', type: 'number',},
  handsBalance: {title: '免费手数余额',order: 2,view: 'number', type: 'number',},
  updatedAt: {title: 'updatedAt',order: 3,view: 'datetime', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}