import { FormSchema } from '/@/components/Form';

// 部门基础表单
export function useBasicFormSchema() {
  const basicFormSchema: FormSchema[] = [
    {
      field: 'departName',
      label: '部门名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入部门/部门名称',
      },
      rules: [{ required: true, message: '部门名称不能为空' }],
    },
    {
      field: 'parentId',
      label: '上级部门',
      component: 'TreeSelect',
      componentProps: {
        treeData: [],
        placeholder: '无',
        dropdownStyle: { maxHeight: '200px', overflow: 'auto' },
      },
    },
    {
      field: 'orgCode',
      label: '部门编码',
      component: 'Input',
      componentProps: {
        placeholder: '请输入部门编码',
      },
    },
    {
      field: 'departOrder',
      label: '排序',
      component: 'InputNumber',
      componentProps: {},
    },
    {
      field: 'id',
      label: 'ID',
      component: 'Input',
      show: false,
    },
  ];
  return { basicFormSchema };
}

// 部门类型选项
export const orgCategoryOptions = {
  // 一级部门
  root: [{ value: '1', label: '公司' }],
  // 子级部门
  child: [
    { value: '2', label: '部门' },
    { value: '3', label: '岗位' },
  ],
};
