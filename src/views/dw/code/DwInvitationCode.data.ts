import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '邀请人',
    align:"center",
    dataIndex: 'inviterUserName'
   },
   {
    title: '被邀请人',
    align:"center",
    dataIndex: 'invitedUserName'
   },
   {
    title: '填写的推荐码',
    align:"center",
    dataIndex: 'recommendCode'
   },
   {
    title: '状态',
    align:"center",
    dataIndex: 'status_dictText'
   },
   {
    title: '审核备注',
    align:"center",
    dataIndex: 'remark'
   },
   {
    title: '创建时间',
    align:"center",
    dataIndex: 'createTime',
    width: 180
   },
   {
    title: '审核时间',
    align:"center",
    dataIndex: 'auditTime',
    width: 180
   },
   {
    title: '审核人',
    align:"center",
    dataIndex: 'auditBy_dictText'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '邀请人',
    field: 'inviterUserId',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"sys_user,realname,id",
        getPopupContainer: () => document.body
     },
  },
  {
    label: '被邀请人',
    field: 'invitedUserId',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"sys_user,realname,id",
        getPopupContainer: () => document.body
     },
  },
  {
    label: '填写的推荐码',
    field: 'recommendCode',
    component: 'Input',
  },
  {
    label: '状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"invite_status",
        getPopupContainer: () => document.body
     },
  },
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '邀请人',
    field: 'inviterUserId',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"sys_user,realname,id",
        getPopupContainer: () => document.body
     },
  },
  {
    label: '被邀请人',
    field: 'invitedUserId',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"sys_user,realname,id",
        getPopupContainer: () => document.body
     },
  },
  {
    label: '填写的推荐码',
    field: 'recommendCode',
    component: 'Input',
    componentProps: {
      placeholder: '请输入填写的推荐码',
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"invite_status",
        getPopupContainer: () => document.body
     },
  },
  {
    label: '审核备注',
    field: 'remark',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入审核备注',
      rows: 4,
    },
  },
  {
    label: '创建时间',
    field: 'createTime',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择创建时间',
    },
    show: false,
  },
  {
    label: '审核时间',
    field: 'auditTime',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择审核时间',
    },
    show: false,
  },
  {
    label: '审核人',
    field: 'auditBy',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"sys_user,realname,username",
        getPopupContainer: () => document.body
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
  inviterUserId: {title: '邀请人',order: 0,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  invitedUserId: {title: '被邀请人',order: 1,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  recommendCode: {title: '填写的推荐码',order: 2,view: 'text', type: 'string',},
  status: {title: '状态',order: 3,view: 'list', type: 'string',dictCode: 'invite_status',},
  remark: {title: '审核备注',order: 4,view: 'text', type: 'string',},
  createTime: {title: '创建时间',order: 5,view: 'datetime', type: 'string',},
  auditTime: {title: '审核时间',order: 6,view: 'datetime', type: 'string',},
  auditBy: {title: '审核人',order: 7,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'username', dictText: 'realname',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}