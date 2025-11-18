import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '发送人',
    align:"center",
    dataIndex: 'senderId'
   },
   {
    title: '接收人',
    align:"center",
    dataIndex: 'receiverId'
   },
   {
    title: '消息内容',
    align:"center",
    dataIndex: 'content'
   },
   {
    title: '发送时间',
    align:"center",
    dataIndex: 'createdAt'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '发送人',
    field: 'senderId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入发送人!'},
          ];
     },
  },
  {
    label: '接收人',
    field: 'receiverId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入接收人!'},
          ];
     },
  },
  {
    label: '消息内容',
    field: 'content',
    component: 'InputTextArea',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入消息内容!'},
          ];
     },
  },
  {
    label: '发送时间',
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
  senderId: {title: '发送人',order: 0,view: 'text', type: 'string',},
  receiverId: {title: '接收人',order: 1,view: 'text', type: 'string',},
  content: {title: '消息内容',order: 2,view: 'textarea', type: 'string',},
  createdAt: {title: '发送时间',order: 3,view: 'datetime', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}