import { defHttp } from '/@/utils/http/axios';

enum Api {
  // 统计数据接口
  getOverviewStats = '/dw/dashboard/overview',
  getQuoteStats = '/dw/dashboard/quoteStats',
  getOrderStats = '/dw/dashboard/orderStats',
  getCloseStats = '/dw/dashboard/closeStats',
  getUserStats = '/dw/dashboard/userStats',
  getRevenueStats = '/dw/dashboard/revenueStats',
  getProductStats = '/dw/dashboard/productStats',
  getTrendData = '/dw/dashboard/trendData',

  // 现有接口
  getMainProductPrice = '/dw/product/xian/dwMainProduct/one',
  quoteList = '/dw/quote/dwUserQuote/list',
  closeList = '/dw/close/dwUserClose/list',
  orderList = '/dw/order/dwProductOrder/list',
  monthlyStatsList = '/dw/settlement/dwUserMonthlyStats/list',
  walletsList = '/dw/settlement/dwWallets/list',
}

/**
 * 获取总览统计数据
 */
export const getOverviewStats = () =>
  defHttp.get({ url: Api.getOverviewStats }, { errorMessageMode: 'none' });

/**
 * 获取报价统计数据
 */
export const getQuoteStats = (params?) =>
  defHttp.get({ url: Api.quoteList, params }, { errorMessageMode: 'none' });

/**
 * 获取订单统计数据
 */
export const getOrderStats = (params?) =>
  defHttp.get({ url: Api.orderList, params }, { errorMessageMode: 'none' });

/**
 * 获取平仓统计数据
 */
export const getCloseStats = (params?) =>
  defHttp.get({ url: Api.closeList, params }, { errorMessageMode: 'none' });

/**
 * 获取用户统计数据
 */
export const getUserStats = () =>
  defHttp.get({ url: Api.getUserStats }, { errorMessageMode: 'none' });

/**
 * 获取收益统计数据
 */
export const getRevenueStats = (params?) =>
  defHttp.get({ url: Api.monthlyStatsList, params }, { errorMessageMode: 'none' });

/**
 * 获取产品统计数据
 */
export const getProductStats = () =>
  defHttp.get({ url: Api.getProductStats }, { errorMessageMode: 'none' });

/**
 * 获取带钢实时价格
 */
export const getMainProductPrice = () =>
  defHttp.get({ url: Api.getMainProductPrice }, { errorMessageMode: 'none' });

/**
 * 获取趋势数据（用于图表）
 */
export const getTrendData = (params?) =>
  defHttp.get({ url: Api.getTrendData, params }, { errorMessageMode: 'none' });

/**
 * 获取钱包统计
 */
export const getWalletsStats = (params?) =>
  defHttp.get({ url: Api.walletsList, params }, { errorMessageMode: 'none' });
