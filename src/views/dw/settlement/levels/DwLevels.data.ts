import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '等级',
    align:"center",
    dataIndex: 'level_dictText',
    width: 80
   },
   {
    title: '直推人数',
    align:"center",
    dataIndex: 'minDirectUsers',
    width: 100,
    customRender: ({ text }) => {
      return text ? `≥${text}人` : '-';
    }
   },
   {
    title: '团队有效会员',
    align:"center",
    dataIndex: 'minTeamValidUsers',
    width: 120,
    customRender: ({ text }) => {
      return text ? `≥${text}人` : '-';
    }
   },
   {
    title: '团队月成交手数',
    align:"center",
    dataIndex: 'minTeamMonthHands',
    width: 130,
    customRender: ({ text }) => {
      return text ? `≥${text}手` : '-';
    }
   },
   {
    title: '直推首单奖励',
    align:"center",
    dataIndex: 'directReward',
    width: 120,
    customRender: ({ text }) => {
      return text ? `¥${Number(text).toFixed(2)}` : '¥0.00';
    }
   },
   {
    title: '团队每手奖励',
    align:"center",
    dataIndex: 'teamFeePerHand',
    width: 120,
    customRender: ({ text }) => {
      return text ? `¥${text}/手` : '¥0/手';
    }
   },
   {
    title: '奖励百分比',
    align:"center",
    dataIndex: 'rewardPercent',
    width: 110,
    customRender: ({ text }) => {
      return text ? `${Number(text).toFixed(2)}%` : '0%';
    }
   },
   {
    title: '创建时间',
    align:"center",
    dataIndex: 'createdAt',
    width: 160
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '等级',
    field: 'level',
    component: 'JDictSelectTag',
    componentProps: {
    dictCode: 'vip_level',
      placeholder: '请输入等级'
    },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入团队会员等级!'},
          ];
     },
  },
  {
    label: '直推人数要求',
    field: 'minDirectUsers',
    component: 'InputNumber',
    helpMessage: '直推会员数量要求',
    componentProps: {
      min: 0,
      placeholder: '请输入直推人数要求'
    },
  },
  {
    label: '团队有效会员数量',
    field: 'minTeamValidUsers',
    component: 'InputNumber',
    helpMessage: '30天内≥3手的团队会员数量',
    componentProps: {
      min: 0,
      placeholder: '请输入团队有效会员数量要求'
    },
  },
  {
    label: '团队月成交手数',
    field: 'minTeamMonthHands',
    component: 'InputNumber',
    helpMessage: '团队每月成交手数要求',
    componentProps: {
      min: 0,
      placeholder: '请输入团队月成交手数要求'
    },
  },
  {
    label: '直推首单奖励',
    field: 'directReward',
    component: 'InputNumber',
    helpMessage: '直推会员首笔交易的奖励金额',
    componentProps: {
      min: 0,
      step: 0.01,
      precision: 2,
      placeholder: '请输入直推首单奖励金额'
    },
  },
  {
    label: '团队每手奖励',
    field: 'teamFeePerHand',
    component: 'InputNumber',
    helpMessage: '级差奖励，团队交易每手获得的奖励（20/30/40/50）',
    componentProps: {
      min: 0,
      placeholder: '请输入团队每手奖励金额'
    },
  },
  {
    label: '奖励百分比',
    field: 'rewardPercent',
    component: 'InputNumber',
    helpMessage: '奖励比例（5、7.5、10、12.5）',
    componentProps: {
      min: 0,
      max: 100,
      step: 0.1,
      precision: 2,
      placeholder: '请输入奖励百分比'
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
  level: {title: '团队会员等级',order: 0,view: 'number', type: 'number',},
  minDirectUsers: {title: '直推人数要求',order: 1,view: 'number', type: 'number',},
  minTeamValidUsers: {title: '团队有效会员数量要求',order: 2,view: 'number', type: 'number',},
  minTeamMonthHands: {title: '团队月成交手数要求',order: 3,view: 'number', type: 'number',},
  directReward: {title: '直推首单奖励',order: 4,view: 'number', type: 'number',},
  teamFeePerHand: {title: '团队每手奖励金额（20/30/40/50）',order: 5,view: 'number', type: 'number',},
  rewardPercent: {title: '奖励百分比（5、7.5、10、12.5）',order: 6,view: 'number', type: 'number',},
  createdAt: {title: 'createdAt',order: 7,view: 'datetime', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}