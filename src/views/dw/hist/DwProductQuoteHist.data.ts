import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '数据时间',
    align:"center",
    dataIndex: 'updateTime'
   },
   {
    title: '产品名称',
    align:"center",
    dataIndex: 'productId_dictText'
   },
   {
    title: '买入价',
    align:"center",
    dataIndex: 'bidPrice'
   },
   {
    title: '卖出价',
    align:"center",
    dataIndex: 'askPrice'
   },
   {
    title: '最终成交价',
    align:"center",
    dataIndex: 'lastPrice'
   },
   {
    title: '来源',
    align:"center",
    dataIndex: 'provider'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '数据时间',
    field: 'updateTime',
    component: 'DatePicker',
    componentProps: {
       showTime: true,
       valueFormat: 'YYYY-MM-DD HH:mm:ss'
     },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入数据时间!'},
          ];
     },
  },
  {
    label: '产品名称',
    field: 'productId',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"dw_future_product,name,id"
     },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入产品名称!'},
          ];
     },
  },
  {
    label: '买入价',
    field: 'bidPrice',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入买入价!'},
          ];
     },
  },
  {
    label: '卖出价',
    field: 'askPrice',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入卖出价!'},
          ];
     },
  },
  {
    label: '最终成交价',
    field: 'lastPrice',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入最终成交价!'},
          ];
     },
  },
  {
    label: '来源',
    field: 'provider',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入来源!'},
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
  updateTime: {title: '数据时间',order: 0,view: 'datetime', type: 'string',},
  productId: {title: '产品名称',order: 1,view: 'list', type: 'string',dictTable: "dw_future_product", dictCode: 'id', dictText: 'name',},
  bidPrice: {title: '买入价',order: 2,view: 'number', type: 'number',},
  askPrice: {title: '卖出价',order: 3,view: 'number', type: 'number',},
  lastPrice: {title: '最终成交价',order: 4,view: 'number', type: 'number',},
  provider: {title: '来源',order: 5,view: 'text', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}