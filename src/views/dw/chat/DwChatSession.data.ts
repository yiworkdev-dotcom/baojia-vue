import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '用户姓名',
    align:"center",
    dataIndex: 'userId'
   },
   {
    title: '客服姓名',
    align:"center",
    dataIndex: 'agentId'
   },
   {
    title: '会话状态',
    align:"center",
    dataIndex: 'status_dictText'
   },
   {
    title: '开始时间',
    align:"center",
    dataIndex: 'startedAt'
   },
   {
    title: '结束时间',
    align:"center",
    dataIndex: 'endedAt'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '用户姓名',
    field: 'userId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入用户姓名!'},
          ];
     },
  },
  {
    label: '客服姓名',
    field: 'agentId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入客服姓名!'},
          ];
     },
  },
  {
    label: '会话状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"session_status"
     },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入会话状态!'},
          ];
     },
  },
  {
    label: '开始时间',
    field: 'startedAt',
    component: 'DatePicker',
    componentProps: {
       showTime: true,
       valueFormat: 'YYYY-MM-DD HH:mm:ss'
     },
  },
  {
    label: '结束时间',
    field: 'endedAt',
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
  userId: {title: '用户姓名',order: 0,view: 'text', type: 'string',},
  agentId: {title: '客服姓名',order: 1,view: 'text', type: 'string',},
  status: {title: '会话状态',order: 2,view: 'number', type: 'number',dictCode: 'session_status',},
  startedAt: {title: '开始时间',order: 3,view: 'datetime', type: 'string',},
  endedAt: {title: '结束时间',order: 4,view: 'datetime', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}