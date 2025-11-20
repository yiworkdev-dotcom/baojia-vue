import { h } from 'vue';

/**
 * 统计卡片数据类型
 */
export interface StatCardData {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  trend?: number; // 趋势百分比，正数表示上升，负数表示下降
  trendLabel?: string;
  icon?: string;
  color?: string;
  footer?: string;
}

/**
 * 图表数据类型
 */
export interface ChartData {
  xAxis: string[];
  series: {
    name: string;
    data: number[];
    type?: string;
  }[];
}

/**
 * 总览统计数据
 */
export interface OverviewStats {
  totalUsers: number;
  totalQuotes: number;
  totalOrders: number;
  totalRevenue: number;
  todayQuotes: number;
  todayOrders: number;
  todayRevenue: number;
  todayNewUsers: number;
}

/**
 * 报价统计数据
 */
export interface QuoteStats {
  total: number;
  completed: number; // 已成交
  pending: number; // 待成交
  cancelled: number; // 已撤单
  completionRate: number; // 成交率
}

/**
 * 订单统计数据
 */
export interface OrderStats {
  total: number;
  processing: number; // 处理中
  completed: number; // 已完成
  cancelled: number; // 已取消
}

/**
 * 平仓统计数据
 */
export interface CloseStats {
  total: number;
  profit: number; // 盈利笔数
  loss: number; // 亏损笔数
  totalProfit: number; // 总盈利
  totalLoss: number; // 总亏损
  netProfit: number; // 净盈利
}

/**
 * 用户统计数据
 */
export interface UserStats {
  total: number;
  active: number; // 活跃用户
  newToday: number; // 今日新增
  newWeek: number; // 本周新增
  newMonth: number; // 本月新增
}

/**
 * 产品统计数据
 */
export interface ProductStats {
  mainPrice: number; // 带钢价格
  mainSellPrice: number; // 带钢卖出价格
  priceChange: number; // 价格变化
  updateTime: string; // 更新时间
}

/**
 * 统计卡片配置数据
 */
export const statCards: StatCardData[] = [
  {
    title: '总报价数',
    value: 0,
    icon: 'ant-design:file-text-outlined',
    color: '#1890ff',
    trend: 0,
    trendLabel: '较昨日',
    footer: '今日新增报价',
  },
  {
    title: '成交订单',
    value: 0,
    icon: 'ant-design:transaction-outlined',
    color: '#52c41a',
    trend: 0,
    trendLabel: '较昨日',
    footer: '今日成交订单',
  },
  {
    title: '总收益',
    value: 0,
    prefix: '¥',
    icon: 'ant-design:dollar-circle-outlined',
    color: '#faad14',
    trend: 0,
    trendLabel: '较上月',
    footer: '本月累计收益',
  },
  {
    title: '活跃用户',
    value: 0,
    icon: 'ant-design:user-outlined',
    color: '#722ed1',
    trend: 0,
    trendLabel: '较昨日',
    footer: '今日活跃用户',
  },
  {
    title: '待处理报价',
    value: 0,
    icon: 'ant-design:clock-circle-outlined',
    color: '#fa8c16',
    trend: 0,
    trendLabel: '较昨日',
    footer: '需要审核的报价',
  },
  {
    title: '平仓盈利',
    value: 0,
    prefix: '¥',
    icon: 'ant-design:rise-outlined',
    color: '#13c2c2',
    trend: 0,
    trendLabel: '较昨日',
    footer: '今日平仓盈利',
  },
];

/**
 * 报价趋势图表配置
 */
export const quoteTrendChartOption = {
  title: {
    text: '报价趋势',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'normal',
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  legend: {
    data: ['总报价', '成交', '待成交', '撤单'],
    bottom: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '总报价',
      type: 'line',
      smooth: true,
      data: [],
    },
    {
      name: '成交',
      type: 'line',
      smooth: true,
      data: [],
    },
    {
      name: '待成交',
      type: 'line',
      smooth: true,
      data: [],
    },
    {
      name: '撤单',
      type: 'line',
      smooth: true,
      data: [],
    },
  ],
};

/**
 * 订单分布饼图配置
 */
export const orderDistributionChartOption = {
  title: {
    text: '订单状态分布',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'normal',
    },
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
  },
  series: [
    {
      name: '订单状态',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '55%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: [],
    },
  ],
};

/**
 * 收益趋势图表配置
 */
export const revenueTrendChartOption = {
  title: {
    text: '收益趋势',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'normal',
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    },
  },
  legend: {
    data: ['收益', '成本', '利润'],
    bottom: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '¥{value}',
    },
  },
  series: [
    {
      name: '收益',
      type: 'bar',
      data: [],
    },
    {
      name: '成本',
      type: 'bar',
      data: [],
    },
    {
      name: '利润',
      type: 'line',
      smooth: true,
      data: [],
    },
  ],
};

/**
 * 平仓盈亏分析图表配置
 */
export const closeProfitChartOption = {
  title: {
    text: '平仓盈亏分析',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'normal',
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  legend: {
    data: ['盈利', '亏损'],
    bottom: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '¥{value}',
    },
  },
  series: [
    {
      name: '盈利',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: '#52c41a',
      },
      data: [],
    },
    {
      name: '亏损',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: '#ff4d4f',
      },
      data: [],
    },
  ],
};

/**
 * 用户增长趋势图表配置
 */
export const userGrowthChartOption = {
  title: {
    text: '用户增长趋势',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'normal',
    },
  },
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: ['新增用户', '累计用户'],
    bottom: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.3,
      },
      data: [],
    },
    {
      name: '累计用户',
      type: 'line',
      smooth: true,
      data: [],
    },
  ],
};

/**
 * 产品报价排行配置
 */
export const productRankChartOption = {
  title: {
    text: '产品报价排行',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'normal',
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'value',
  },
  yAxis: {
    type: 'category',
    data: [],
  },
  series: [
    {
      name: '报价次数',
      type: 'bar',
      data: [],
      itemStyle: {
        borderRadius: [0, 5, 5, 0],
      },
    },
  ],
};
