import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetCurrentUserTradeGoal = '/dw/close/dwUserClose/tradeGoal/current',
  GetAllUsersTradeGoals = '/dw/close/dwUserClose/tradeGoal/all',
}

/**
 * 获取当前用户的交易目标完成度
 */
export const getCurrentUserTradeGoal = () =>
  defHttp.get({ url: Api.GetCurrentUserTradeGoal });

/**
 * 获取所有用户的交易目标完成度列表
 */
export const getAllUsersTradeGoals = () =>
  defHttp.get({ url: Api.GetAllUsersTradeGoals });

/**
 * 获取指定用户的交易目标完成度
 * 注意:这个方法会调用"所有用户"接口,然后从结果中筛选指定用户
 * 如果后端需要单独的接口,可以添加
 */
export const getUserTradeGoalById = async (userId: string) => {
  const result = await getAllUsersTradeGoals();
  if (result && Array.isArray(result)) {
    return result.find(item => item.userId === userId);
  }
  return null;
};
