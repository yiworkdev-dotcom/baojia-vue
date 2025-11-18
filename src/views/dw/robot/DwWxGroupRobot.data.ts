import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '机器人名称',
    align:"center",
    dataIndex: 'robotName'
   },
   {
    title: '群名称',
    align:"center",
    dataIndex: 'groupName'
   },
   {
    title: '关键词',
    align:"center",
    dataIndex: 'keywords'
   },
   {
    title: '默认机器人',
    align:"center",
    dataIndex: 'isDefault_dictText'
   },
   {
    title: '启用状态',
    align:"center",
    dataIndex: 'status_dictText'
   },
   {
    title: '备注',
    align:"center",
    dataIndex: 'remark'
   },
   {
    title: '最近推送时间',
    align:"center",
    dataIndex: 'lastPushTime'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '机器人名称',
    field: 'robotName',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入机器人名称!'},
          ];
     },
  },
  {
    label: '群名称',
    field: 'groupName',
    component: 'Input',
  },
  {
    label: '关键词',
    field: 'keywords',
    component: 'Input',
  },
  {
    label: '默认机器人',
    field: 'isDefault',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"yes_no"
     },
  },
  {
    label: '启用状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"on_off"
     },
  },
  {
    label: '备注',
    field: 'remark',
    component: 'Input',
  },
  {
    label: '最近推送时间',
    field: 'lastPushTime',
    component: 'DatePicker',
    componentProps: {
       showTime: true,
       valueFormat: 'YYYY-MM-DD HH:mm:ss'
     },
  },
  {
    label: 'Webhook',
    field: 'webhook',
    component: 'Input',
  },
  {
    label: '加签secret',
    field: 'secret',
    component: 'Input',
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
  robotName: {title: '机器人名称',order: 0,view: 'text', type: 'string',},
  groupName: {title: '群名称',order: 1,view: 'text', type: 'string',},
  keywords: {title: '关键词',order: 2,view: 'text', type: 'string',},
  isDefault: {title: '默认机器人',order: 3,view: 'number', type: 'number',dictCode: 'yes_no',},
  status: {title: '启用状态',order: 4,view: 'number', type: 'number',dictCode: 'on_off',},
  remark: {title: '备注',order: 5,view: 'text', type: 'string',},
  lastPushTime: {title: '最近推送时间',order: 6,view: 'datetime', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}