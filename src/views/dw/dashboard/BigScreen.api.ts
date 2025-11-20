import { defHttp } from '/@/utils/http/axios';

enum Api {
  // 大屏统计接口
  getScreenOverview = '/dw/bigscreen/overview',
  getRewardsStats = '/dw/bigscreen/rewardsStats',
  getFeesStats = '/dw/bigscreen/feesStats',
  getTradeRanking = '/dw/bigscreen/tradeRanking',
  getOrderRanking = '/dw/bigscreen/orderRanking',
  getDirectionTrend = '/dw/bigscreen/directionTrend',
  getRealTimeData = '/dw/bigscreen/realtime',
}

/**
 * 大屏总览数据
 */
export interface BigScreenOverview {
  totalUsers: number; // 总用户数
  activeUsers: number; // 活跃用户数
  onlineUsers: number; // 实时在线用户数
  todayOrders: number; // 今日订单数
  todayTradeAmount: number; // 今日交易总额
  totalRewards: number; // 累计奖励发放
  totalFees: number; // 累计手续费
  totalTradeAmount: number; // 累计交易总额
}

/**
 * 奖励统计数据
 */
export interface RewardsStats {
  totalRewards: number; // 总奖励金额
  todayRewards: number; // 今日奖励
  rewardCount: number; // 奖励发放次数
  trendData: {
    date: string;
    amount: number;
  }[];
}

/**
 * 手续费统计数据
 */
export interface FeesStats {
  totalFees: number; // 总手续费
  todayFees: number; // 今日手续费
  feeCount: number; // 手续费扣除次数
  trendData: {
    date: string;
    amount: number;
  }[];
}

/**
 * 用户排行数据
 */
export interface UserRanking {
  userId: string;
  userName: string;
  realName: string;
  value: number; // 交易金额或订单数
  rank: number;
}

/**
 * 方向趋势数据
 */
export interface DirectionTrend {
  date: string;
  buyOpen: number; // 买入开仓
  sellOpen: number; // 卖出开仓
  buyClose: number; // 买入平仓
  sellClose: number; // 卖出平仓
}

/**
 * 获取大屏总览数据
 */
export const getScreenOverview = () =>
  defHttp.get<BigScreenOverview>({ url: Api.getScreenOverview }, { errorMessageMode: 'none' });

/**
 * 获取奖励统计数据
 * @param params.days 查询天数，默认30天
 */
export const getRewardsStats = (params?: { days?: number }) =>
  defHttp.get<RewardsStats>({ url: Api.getRewardsStats, params }, { errorMessageMode: 'none' });

/**
 * 获取手续费统计数据
 * @param params.days 查询天数，默认30天
 */
export const getFeesStats = (params?: { days?: number }) =>
  defHttp.get<FeesStats>({ url: Api.getFeesStats, params }, { errorMessageMode: 'none' });

/**
 * 获取用户交易排行
 * @param params.limit 查询数量，默认10
 * @param params.days 统计天数，默认30天
 */
export const getTradeRanking = (params?: { limit?: number; days?: number }) =>
  defHttp.get<UserRanking[]>({ url: Api.getTradeRanking, params }, { errorMessageMode: 'none' });

/**
 * 获取用户下单排行
 * @param params.limit 查询数量，默认10
 * @param params.days 统计天数，默认30天
 */
export const getOrderRanking = (params?: { limit?: number; days?: number }) =>
  defHttp.get<UserRanking[]>({ url: Api.getOrderRanking, params }, { errorMessageMode: 'none' });

/**
 * 获取四个方向订单趋势
 * @param params.days 查询天数，默认30天
 */
export const getDirectionTrend = (params?: { days?: number }) =>
  defHttp.get<DirectionTrend[]>({ url: Api.getDirectionTrend, params }, { errorMessageMode: 'none' });

/**
 * 获取实时数据（WebSocket备用接口）
 */
export const getRealTimeData = () =>
  defHttp.get({ url: Api.getRealTimeData }, { errorMessageMode: 'none' });
