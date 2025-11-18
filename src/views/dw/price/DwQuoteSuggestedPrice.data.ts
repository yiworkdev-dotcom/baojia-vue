import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '创建人',
    align:"center",
    dataIndex: 'createBy_dictText'
   },
   {
    title: '创建日期',
    align:"center",
    dataIndex: 'createTime'
   },
   {
    title: '更新人',
    align:"center",
    dataIndex: 'updateBy_dictText'
   },
   {
    title: '更新日期',
    align:"center",
    dataIndex: 'updateTime'
   },
   {
    title: '产品名称',
    align:"center",
    dataIndex: 'productName'
   },
   {
    title: '期货名称',
    align:"center",
    dataIndex: 'quoteName'
   },
   {
    title: '期货合约',
    align:"center",
    dataIndex: 'quoteCode'
   },
   {
    title: '建议价格',
    align:"center",
    dataIndex: 'suggestedPrice'
   },
   {
    title: '建议基差',
    align:"center",
    dataIndex: 'suggestedBasis'
   },
   {
    title: '自定义显示文字',
    align:"center",
    dataIndex: 'showText'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
	{
      label: "创建人",
      field: 'createBy',
      component: 'JSelectMultiple',
      componentProps:{
          dictCode:"sys_user,realname,id"
      },
      //colProps: {span: 6},
 	},
	{
      label: "产品名称",
      field: 'productName',
      component: 'Select',
      componentProps: {
        options: [
          { label: '355带钢', value: '355带钢' }
        ]
      },
      //colProps: {span: 6},
 	},
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '产品名称',
    field: 'productName',
    component: 'Select',
    componentProps: {
      options: [
        { label: '355带钢', value: '355带钢' }
      ]
    },
  },
  {
    label: '期货名称',
    field: 'quoteName',
    component: 'ApiSelect',
    componentProps: {
      api: async (params: any) => {
        console.log('期货名称API被调用', params);
        try {
          const { defHttp } = await import('/@/utils/http/axios');
          const res = await defHttp.get({
            url: '/dw/product/info/dwFutureProduct/list/',
            params: {
              pageNo: 1,
              pageSize: 999,
              ...params
            }
          });
          console.log('期货名称API响应:', res);
          if (res.records) {
            console.log('期货名称原始数据:', res.records);
            // 去重处理
            const uniqueNames = [...new Set(res.records.map((item: any) => item.name))];
            console.log('去重后的名称:', uniqueNames);
            const options = uniqueNames.map(name => ({
              label: name,
              value: name
            }));
            console.log('期货名称选项:', options);
            return options;
          }
          return [];
        } catch (error) {
          console.error('期货名称API错误:', error);
          return [];
        }
      },
      showSearch: true,
      placeholder: '请选择期货名称'
    },
  },
  {
    label: '期货合约',
    field: 'quoteCode',
    component: 'ApiSelect',
    componentProps: {
      api: async (params: any) => {
        console.log('期货合约API被调用', params);
        try {
          const { defHttp } = await import('/@/utils/http/axios');
          const res = await defHttp.get({
            url: '/dw/product/info/dwFutureProduct/list/',
            params: {
              pageNo: 1,
              pageSize: 999,
              ...params
            }
          });
          console.log('期货合约API响应:', res);
          if (res.records) {
            console.log('期货合约原始数据:', res.records);
            const options = res.records.map((item: any) => ({
              label: item.varietyCode,
              value: item.varietyCode
            }));
            console.log('期货合约选项:', options);
            return options;
          }
          return [];
        } catch (error) {
          console.error('期货合约API错误:', error);
          return [];
        }
      },
      showSearch: true,
      placeholder: '请选择期货合约'
    },
  },
  {
    label: '建议价格',
    field: 'suggestedPrice',
    component: 'InputNumber',
  },
  {
    label: '建议基差',
    field: 'suggestedBasis',
    component: 'InputNumber',
  },
  {
    label: '自定义显示文字',
    field: 'showText',
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
  createBy: {title: '创建人',order: 0,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  createTime: {title: '创建日期',order: 1,view: 'datetime', type: 'string',},
  updateBy: {title: '更新人',order: 2,view: 'list', type: 'string',dictTable: "sys_user", dictCode: 'id', dictText: 'realname',},
  updateTime: {title: '更新日期',order: 3,view: 'datetime', type: 'string',},
  productName: {title: '产品名称',order: 4,view: 'text', type: 'string',},
  quoteName: {title: '期货名称',order: 5,view: 'text', type: 'string',},
  quoteCode: {title: '期货合约',order: 6,view: 'text', type: 'string',},
  suggestedPrice: {title: '建议价格',order: 7,view: 'number', type: 'number',},
  suggestedBasis: {title: '建议基差',order: 8,view: 'number', type: 'number',},
  showText: {title: '自定义显示文字',order: 9,view: 'text', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}