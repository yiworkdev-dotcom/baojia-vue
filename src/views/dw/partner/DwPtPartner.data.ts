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
    dataIndex: 'userId_dictText',
    width: 200, // 增加列宽
    fixed: 'left' // 固定在左侧
   },
   {
    title: '合伙人级别',
    align: 'center',
    dataIndex: 'level_dictText',
    width: 120
   },
   {
    title: '是否有代理权限',
    align: 'center',
    dataIndex: 'isAgent_dictText',
    width: 120
   },
   {
    title: '直接推荐人',
    align: 'center',
    dataIndex: 'parent_dictText',
    width: 150
   },
   {
    title: '启用状态',
    align: 'center',
    dataIndex: 'status_dictText',
    width: 100
   },
   {
    title: '是否有子节点',
    align: 'center',
    dataIndex: 'hasChild',
    width: 120
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '合伙人姓名',
    field: 'userId',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"sys_user,realname,id"
     },
  },
  {
    label: '合伙人级别',
    field: 'level',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"partnership_level"
     },
  },
  {
    label: '是否有代理权限',
    field: 'isAgent',
    component: 'JDictSelectTag',
    show: false,
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
    label: '父级ID',
    field: 'pid',
    component: 'Input',
    show: false, // 隐藏此字段，由系统自动设置
  },
];

// 高级查询数据
export const superQuerySchema = {
  userId: {title: '合伙人关系列',order: 0,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  level: {title: '合伙人级别',order: 1,view: 'list', type: 'string',dictCode: 'partnership_level',},
  isAgent: {title: '是否有代理权限',order: 2,view: 'list', type: 'string',dictCode: 'yes_no',},
  parent: {title: '直接推荐人',order: 3,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  status: {title: '启用状态',order: 4,view: 'list', type: 'string',dictCode: 'yes_no',},
  hasChild: {title: '是否有子节点（字典：yn）',order: 5,view: 'text', type: 'string',},
};


/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
