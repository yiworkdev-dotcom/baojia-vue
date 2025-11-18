import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '合伙人关系列',
    align: 'center',
    dataIndex: 'userId_dictText'
   },
   {
    title: '合伙人级别',
    align: 'center',
    dataIndex: 'level_dictText'
   },
   {
    title: '成为合伙人时间',
    align: 'center',
    dataIndex: 'createTime'
   },
   {
    title: '是否有代理权限',
    align: 'center',
    dataIndex: 'isAgent_dictText'
   },
   {
    title: '直接推荐人',
    align: 'center',
    dataIndex: 'parent_dictText'
   },
   {
    title: '启用状态',
    align: 'center',
    dataIndex: 'status_dictText'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '合伙人关系列',
    field: 'userId',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"sys_user,realname,id"
     },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入合伙人关系列!'},
          ];
     },
  },
  {
    label: '合伙人级别',
    field: 'level',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"partnership_level"
     },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入合伙人级别!'},
          ];
     },
  },
  {
    label: '是否有代理权限',
    field: 'isAgent',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"yes_no"
     },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入是否有代理权限!'},
          ];
     },
  },
  {
    label: '直接推荐人',
    field: 'parent',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"sys_user,realname,id"
     },
  },
  {
    label: '启用状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"yes_no"
     },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入启用状态!'},
          ];
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
  userId: {title: '合伙人关系列',order: 0,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  level: {title: '合伙人级别',order: 1,view: 'list', type: 'string',dictCode: 'partnership_level',},
  createTime: {title: '成为合伙人时间',order: 2,view: 'datetime', type: 'string',},
  isAgent: {title: '是否有代理权限',order: 3,view: 'list', type: 'string',dictCode: 'yes_no',},
  parent: {title: '直接推荐人',order: 4,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  status: {title: '启用状态',order: 5,view: 'list', type: 'string',dictCode: 'yes_no',},
};


/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
