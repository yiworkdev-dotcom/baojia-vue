import { defHttp } from '/@/utils/http/axios';

enum Api {
  CalculateDirectReward = '/dw/reward/calculate-direct-reward',
  MonthlySettlement = '/dw/reward/monthly-settlement',
  CalculateDirectRewardForUser = '/dw/reward/calculate-direct-reward-for-user',
  SettlementByAssessmentCycle = '/dw/reward/settlement-by-assessment-cycle',
  CalculateDirectRewardByCycle = '/dw/reward/calculate-direct-reward-by-cycle',
}

/**
 * 手动计算直推奖励（所有用户，上个月）
 * @deprecated 已废弃，改用按考核期结算
 */
export const calculateDirectReward = () =>
  defHttp.post({ url: Api.CalculateDirectReward });

/**
 * 手动触发月度清算
 */
export const monthlySettlement = () =>
  defHttp.post({ url: Api.MonthlySettlement });

/**
 * 为指定用户结算直推奖励（按月份）
 * @param userId 用户ID（上级推荐人ID）
 * @param settlementMonth 结算月份，格式：yyyy-MM，可选，默认当前月份
 * @deprecated 已废弃，改用按考核期结算
 */
export const calculateDirectRewardForUser = (userId: string, settlementMonth?: string) =>
  defHttp.post({
    url: Api.CalculateDirectRewardForUser,
    params: { userId, settlementMonth },
  });

/**
 * 按考核期结算所有用户的直推奖励
 * 遍历所有用户，检查是否有刚结束的考核期需要结算
 */
export const settlementByAssessmentCycle = () =>
  defHttp.post({ url: Api.SettlementByAssessmentCycle });

/**
 * 为指定用户按考核期结算直推奖励
 * @param userId 用户ID（上级推荐人ID）
 * @param cycleNumber 考核期编号（第几个周期，从1开始），可选，不传则结算当前考核期
 */
export const calculateDirectRewardByCycle = (userId: string, cycleNumber?: number) =>
  defHttp.post({
    url: Api.CalculateDirectRewardByCycle,
    params: { userId, cycleNumber },
  });
