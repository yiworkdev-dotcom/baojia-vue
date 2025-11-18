import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

// 列表数据
export const columns: BasicColumn[] = [
  {
    title: '产品名称',
    align: 'center',
    dataIndex: 'name',
  },
  {
    title: '产品代码',
    align: 'center',
    dataIndex: 'code',
  },

  {
    title: '买入价',
    align: 'center',
    dataIndex: 'buyPrice',
  },
  {
    title: '卖出价',
    align: 'center',
    dataIndex: 'sellPrice',
  },
  {
    title: '更新日期',
    align: 'center',
    dataIndex: 'updateTime',
  },
];

// 查询数据
export const searchFormSchema: FormSchema[] = [];

// 表单数据
export const formSchema: FormSchema[] = [
  {
    label: '产品名称',
    field: 'name',
    component: 'Input',
  },
  {
    label: '产品代码',
    field: 'code',
    component: 'Input',
  },
  {
    label: '卖出价',
    field: 'sellPrice',
    component: 'InputNumber',
  },
  {
    label: '买入价',
    field: 'buyPrice',
    component: 'InputNumber',
  },
  {
    label: '更新日期',
    field: 'updateTime',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
];

// 高级查询数据
export const superQuerySchema = {
  name: { title: '产品名称', order: 0, view: 'text', type: 'string' },
  code: { title: '产品代码', order: 1, view: 'text', type: 'string' },
  price: { title: '现货价格', order: 2, view: 'number', type: 'number' },
  sellPrice: { title: '卖出价', order: 3, view: 'number', type: 'number' },
  buyPrice: { title: '买入价', order: 4, view: 'number', type: 'number' },
  updateTime: { title: '更新日期', order: 5, view: 'datetime', type: 'string' },
};

/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}