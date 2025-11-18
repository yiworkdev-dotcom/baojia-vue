import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';

// 产品代码前缀颜色映射
const prefixColorMap = {
  'hc': { bg: '#e6f7ff', border: '#91d5ff', text: '#1890ff' }, // 热卷 - 蓝色系
  'rb': { bg: '#f6ffed', border: '#b7eb8f', text: '#52c41a' }, // 螺纹钢 - 绿色系
  'cu': { bg: '#fff7e6', border: '#ffd591', text: '#fa8c16' }, // 铜 - 橙色系
  'al': { bg: '#f9f0ff', border: '#d3adf7', text: '#722ed1' }, // 铝 - 紫色系
  'zn': { bg: '#fff1f0', border: '#ffccc7', text: '#f5222d' }, // 锌 - 红色系
  'pb': { bg: '#f0f5ff', border: '#adc6ff', text: '#1890ff' }, // 铅 - 青色系
  'ni': { bg: '#f6ffed', border: '#b7eb8f', text: '#52c41a' }, // 镍 - 绿色系
  'sn': { bg: '#fff7e6', border: '#ffd591', text: '#fa8c16' }, // 锡 - 橙色系
  'ag': { bg: '#f0f5ff', border: '#adc6ff', text: '#1890ff' }, // 银 - 青色系
  'au': { bg: '#fff7e6', border: '#ffd591', text: '#fa8c16' }, // 金 - 金色系
};

// 获取产品代码前缀
function getProductPrefix(varietyCode: string): string {
  if (!varietyCode || varietyCode.length < 2) return '';
  return varietyCode.substring(0, 2).toLowerCase();
}

// 获取前缀对应的颜色
function getPrefixColor(prefix: string) {
  return prefixColorMap[prefix] || { bg: '#fafafa', border: '#d9d9d9', text: '#595959' };
}

//列表数据
export const columns: BasicColumn[] = [
   {
    title: '产品代码',
    align: "center",
    dataIndex: 'varietyCode',
    width: 120,
    fixed: 'left',
    customRender: ({ text, record }) => {
      const prefix = getProductPrefix(text);
      const colors = getPrefixColor(prefix);
      
      return h('div', { 
        class: 'product-code-with-prefix',
        style: { 
          backgroundColor: colors.bg,
          borderLeft: `4px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '8px 12px',
          margin: '4px 0'
        }
      }, [
        h('div', { class: 'product-code' }, [
          h('span', { 
            class: 'code-text',
            style: { color: colors.text }
          }, text),
          h('div', { 
            class: 'code-badge',
            style: { 
              backgroundColor: colors.bg,
              borderColor: colors.border,
              color: colors.text
            }
          }, '期货')
        ])
      ]);
    }
   },
   {
    title: '产品名称',
    align: "left",
    dataIndex: 'name',
    width: 180,
    fixed: 'left',
    customRender: ({ text, record }) => {
      const prefix = getProductPrefix(record.varietyCode);
      const colors = getPrefixColor(prefix);
      
      return h('div', { 
        class: 'product-name-with-prefix',
        style: { 
          backgroundColor: colors.bg,
          borderLeft: `4px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '8px 12px',
          margin: '4px 0'
        }
      }, [
        h('div', { 
          class: 'name-main',
          style: { color: colors.text }
        }, text),
        h('div', { 
          class: 'name-sub',
          style: { color: colors.text, opacity: 0.7 }
        }, record.exchange || '未知交易所')
      ]);
    }
   },
   {
    title: '交易所',
    align: "center",
    dataIndex: 'exchange',
    width: 100,
    customRender: ({ text }) => {
      const exchangeMap = {
        'SHFE': '上期所',
        'DCE': '大商所',
        'CZCE': '郑商所',
        'CFFEX': '中金所',
        'INE': '上能源'
      };
      const displayName = exchangeMap[text] || text;
      return h('span', { class: 'exchange-tag' }, displayName);
    }
   },
   {
    title: '状态',
    align: "center",
    dataIndex: 'isEnable_dictText',
    width: 100,
    customRender: ({ text, record }) => {
      const isEnable = record.isEnable === 1;
      return h('span', { 
        class: ['status-tag', { 'active': isEnable, 'inactive': !isEnable }]
      }, isEnable ? '启用' : '停用');
    }
   },
   {
    title: '更新时间',
    align: "center",
    dataIndex: 'updateTime',
    width: 160,
    customRender: ({ text }) => {
      if (!text) return '--';
      return h('span', { class: 'time-text' }, text);
    }
   },
   {
    title: '备注',
    align: "left",
    dataIndex: 'remark',
    width: 150,
    ellipsis: true,
    customRender: ({ text }) => {
      if (!text) return '--';
      return h('span', { class: 'remark-text', title: text }, text);
    }
   },
];

//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '产品代码',
    field: 'varietyCode',
    component: 'Input',
    colProps: { span: 6 },
    componentProps: {
      placeholder: '请输入产品代码',
      allowClear: true,
    }
  },
  {
    label: '产品名称',
    field: 'name',
    component: 'Input',
    colProps: { span: 6 },
    componentProps: {
      placeholder: '请输入产品名称',
      allowClear: true,
    }
  },
  {
    label: '交易所',
    field: 'exchange',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      placeholder: '请选择交易所',
      allowClear: true,
      options: [
        { label: '上期所', value: 'SHFE' },
        { label: '大商所', value: 'DCE' },
        { label: '郑商所', value: 'CZCE' },
        { label: '中金所', value: 'CFFEX' },
        { label: '上能源', value: 'INE' },
      ]
    }
  },
  {
    label: '启用状态',
    field: 'isEnable',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      placeholder: '请选择状态',
      allowClear: true,
      options: [
        { label: '启用', value: 1 },
        { label: '停用', value: 0 },
      ]
    }
  }
];

//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '产品名',
    field: 'name',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入产品名!'},
          ];
     },
  },
  {
    label: '产品代码',
    field: 'varietyCode',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入产品代码!'},
          ];
     },
  },
  {
    label: '交易所',
    field: 'exchange',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入交易所!'},
          ];
     },
  },
  {
    label: '启用状态',
    field: 'isEnable',
    component: 'JDictSelectTag',
    componentProps:{
        dictCode:"on_off"
     },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入启用状态!'},
          ];
     },
  },
  {
    label: '备注',
    field: 'remark',
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
  name: {title: '产品名',order: 0,view: 'text', type: 'string',},
  varietyCode: {title: '产品代码',order: 1,view: 'text', type: 'string',},
  exchange: {title: '交易所',order: 2,view: 'text', type: 'string',},
  isEnable: {title: '启用状态',order: 3,view: 'number', type: 'number',dictCode: 'on_off',},
  remark: {title: '备注',order: 4,view: 'text', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}