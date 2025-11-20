<template>
  <div class="dashboard-container">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h2 class="title">期货报价系统 - 数据大屏</h2>
        <div class="subtitle">实时监控系统运营数据</div>
      </div>
      <div class="header-right">
        <div class="price-display">
          <div class="price-item">
            <span class="price-label">带钢买入价:</span>
            <span class="price-value buy">{{ mainProductPrice }}</span>
          </div>
          <div class="price-item">
            <span class="price-label">带钢卖出价:</span>
            <span class="price-value sell">{{ mainProductSellPrice }}</span>
          </div>
        </div>
        <div class="update-time">
          <Icon icon="ant-design:clock-circle-outlined" />
          {{ currentTime }}
        </div>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <StatCard v-for="(card, index) in statsCards" :key="index" :data="card" />
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 第一行：报价趋势 + 订单分布 -->
      <div class="chart-row">
        <Card class="chart-card" title="报价趋势" :bordered="false">
          <Pie :chartData="quoteTrendData" :option="quoteTrendOption" height="350px" />
        </Card>
        <Card class="chart-card" title="订单状态分布" :bordered="false">
          <Pie :chartData="orderDistributionData" :option="orderDistributionOption" height="350px" />
        </Card>
      </div>

      <!-- 第二行：收益趋势 + 平仓盈亏 -->
      <div class="chart-row">
        <Card class="chart-card" title="收益趋势" :bordered="false">
          <LineMulti :chartData="revenueTrendData" :option="revenueTrendOption" height="350px" />
        </Card>
        <Card class="chart-card" title="平仓盈亏分析" :bordered="false">
          <Bar :chartData="closeProfitData" :option="closeProfitOption" height="350px" />
        </Card>
      </div>

      <!-- 第三行：用户增长 + 产品排行 -->
      <div class="chart-row">
        <Card class="chart-card" title="用户增长趋势" :bordered="false">
          <LineMulti :chartData="userGrowthData" :option="userGrowthOption" height="350px" />
        </Card>
        <Card class="chart-card" title="产品报价排行" :bordered="false">
          <Bar :chartData="productRankData" :option="productRankOption" height="350px" />
        </Card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { Card } from 'ant-design-vue';
import { Icon } from '/@/components/Icon';
import Pie from '/@/components/chart/Pie.vue';
import Bar from '/@/components/chart/Bar.vue';
import LineMulti from '/@/components/chart/LineMulti.vue';
import StatCard from './components/StatCard.vue';
import {
  statCards,
  quoteTrendChartOption,
  orderDistributionChartOption,
  revenueTrendChartOption,
  closeProfitChartOption,
  userGrowthChartOption,
  productRankChartOption,
  type StatCardData,
} from './Dashboard.data';
import {
  getQuoteStats,
  getOrderStats,
  getCloseStats,
  getMainProductPrice,
  getRevenueStats,
} from './Dashboard.api';

// 实时价格数据
const mainProductPrice = ref(0);
const mainProductSellPrice = ref(0);

// 当前时间
const currentTime = ref('');

// 统计卡片数据
const statsCards = reactive<StatCardData[]>([...statCards]);

// 图表数据
const quoteTrendData = ref([]);
const quoteTrendOption = reactive({ ...quoteTrendChartOption });

const orderDistributionData = ref([]);
const orderDistributionOption = reactive({ ...orderDistributionChartOption });

const revenueTrendData = ref([]);
const revenueTrendOption = reactive({ ...revenueTrendChartOption });

const closeProfitData = ref([]);
const closeProfitOption = reactive({ ...closeProfitChartOption });

const userGrowthData = ref([]);
const userGrowthOption = reactive({ ...userGrowthChartOption });

const productRankData = ref([]);
const productRankOption = reactive({ ...productRankChartOption });

// WebSocket 连接
let ws: WebSocket | null = null;
let refreshTimer: any = null;

/**
 * 更新当前时间
 */
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * 获取带钢价格
 */
const fetchMainProductPrice = async () => {
  try {
    const result = await getMainProductPrice();
    if (result && result.buyPrice) {
      mainProductPrice.value = result.buyPrice;
      mainProductSellPrice.value = result.sellPrice || 0;
    }
  } catch (error) {
    console.error('获取带钢价格失败:', error);
  }
};

/**
 * 启动 WebSocket 连接
 */
const startWebSocket = () => {
  try {
    fetchMainProductPrice();

    ws = new WebSocket('ws://localhost:8080/jeecg-boot/ws/mains');

    ws.onopen = () => {
      console.log('WebSocket 连接成功');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && typeof data === 'object') {
          if (data.buyPrice !== undefined) {
            mainProductPrice.value = data.buyPrice;
          }
          if (data.sellPrice !== undefined) {
            mainProductSellPrice.value = data.sellPrice;
          }
        }
      } catch (error) {
        console.error('解析 WebSocket 数据失败:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket 连接关闭，5秒后重连...');
      setTimeout(startWebSocket, 5000);
    };
  } catch (error) {
    console.error('启动 WebSocket 失败:', error);
  }
};

/**
 * 加载报价统计数据
 */
const loadQuoteStats = async () => {
  try {
    const result = await getQuoteStats({ pageNo: 1, pageSize: 1000 });
    if (result && result.records) {
      const records = result.records;
      const total = records.length;
      const completed = records.filter((item) => item.closeStatus === 5).length;
      const pending = records.filter((item) => item.closeStatus === 1).length;
      const cancelled = records.filter((item) => item.cancelTime).length;

      // 更新统计卡片
      statsCards[0].value = total;
      statsCards[1].value = completed;
      statsCards[4].value = pending;

      // 更新报价趋势图表（这里使用饼图展示当前状态分布）
      orderDistributionOption.series[0].data = [
        { value: completed, name: '已成交', itemStyle: { color: '#52c41a' } },
        { value: pending, name: '待成交', itemStyle: { color: '#faad14' } },
        { value: cancelled, name: '已撤单', itemStyle: { color: '#ff4d4f' } },
      ];
    }
  } catch (error) {
    console.error('加载报价统计失败:', error);
  }
};

/**
 * 加载订单统计数据
 */
const loadOrderStats = async () => {
  try {
    const result = await getOrderStats({ pageNo: 1, pageSize: 1000 });
    if (result && result.records) {
      const records = result.records;
      const total = records.length;

      statsCards[1].value = total;
    }
  } catch (error) {
    console.error('加载订单统计失败:', error);
  }
};

/**
 * 加载平仓统计数据
 */
const loadCloseStats = async () => {
  try {
    const result = await getCloseStats({ pageNo: 1, pageSize: 1000 });
    if (result && result.records) {
      const records = result.records;
      const totalProfit = records.reduce((sum, item) => {
        const profit = parseFloat(item.profitLoss || 0);
        return sum + (profit > 0 ? profit : 0);
      }, 0);

      const totalLoss = records.reduce((sum, item) => {
        const profit = parseFloat(item.profitLoss || 0);
        return sum + (profit < 0 ? Math.abs(profit) : 0);
      }, 0);

      statsCards[5].value = totalProfit.toFixed(0);

      // 更新平仓盈亏图表（模拟最近7天数据）
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      closeProfitOption.xAxis.data = days;
      closeProfitOption.series[0].data = Array(7)
        .fill(0)
        .map(() => Math.random() * 10000 + 5000);
      closeProfitOption.series[1].data = Array(7)
        .fill(0)
        .map(() => Math.random() * 8000 + 3000);
    }
  } catch (error) {
    console.error('加载平仓统计失败:', error);
  }
};

/**
 * 加载收益统计数据
 */
const loadRevenueStats = async () => {
  try {
    const result = await getRevenueStats({ pageNo: 1, pageSize: 12 });
    if (result && result.records) {
      const records = result.records.slice(0, 6);

      // 更新收益趋势图表
      revenueTrendOption.xAxis.data = records.map((item) => {
        const month = item.month || item.statMonth || '';
        return month.substring(4, 6) + '月';
      });

      revenueTrendOption.series[0].data = records.map((item) => item.totalRevenue || 0);
      revenueTrendOption.series[1].data = records.map((item) => item.totalCost || 0);
      revenueTrendOption.series[2].data = records.map(
        (item) => (item.totalRevenue || 0) - (item.totalCost || 0)
      );

      // 更新总收益卡片
      const totalRevenue = records.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
      statsCards[2].value = totalRevenue.toFixed(0);
    }
  } catch (error) {
    console.error('加载收益统计失败:', error);
  }
};

/**
 * 生成模拟数据（用户增长、产品排行）
 */
const generateMockData = () => {
  // 用户增长趋势（最近7天）
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  userGrowthOption.xAxis.data = days;
  userGrowthOption.series[0].data = [12, 18, 25, 31, 28, 35, 42];
  userGrowthOption.series[1].data = [120, 138, 163, 194, 222, 257, 299];

  statsCards[3].value = 299;

  // 产品报价排行
  const products = ['螺纹钢', '热卷', '线材', '盘螺', '中厚板'];
  productRankOption.yAxis.data = products;
  productRankOption.series[0].data = [235, 189, 167, 143, 128];

  // 报价趋势（最近7天）
  quoteTrendOption.xAxis.data = days;
  quoteTrendOption.series[0].data = [45, 52, 61, 55, 68, 72, 80];
  quoteTrendOption.series[1].data = [32, 38, 45, 40, 52, 58, 65];
  quoteTrendOption.series[2].data = [10, 11, 12, 11, 12, 10, 11];
  quoteTrendOption.series[3].data = [3, 3, 4, 4, 4, 4, 4];
};

/**
 * 加载所有数据
 */
const loadAllData = async () => {
  await Promise.all([
    loadQuoteStats(),
    loadOrderStats(),
    loadCloseStats(),
    loadRevenueStats(),
  ]);

  generateMockData();
};

/**
 * 初始化
 */
onMounted(() => {
  updateTime();
  startWebSocket();
  loadAllData();

  // 定时更新时间
  const timeInterval = setInterval(updateTime, 1000);

  // 定时刷新数据（每30秒）
  refreshTimer = setInterval(loadAllData, 30000);

  onUnmounted(() => {
    clearInterval(timeInterval);
    clearInterval(refreshTimer);
    if (ws) {
      ws.close();
      ws = null;
    }
  });
});
</script>

<style lang="less" scoped>
.dashboard-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .header-left {
    .title {
      font-size: 28px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
    }
  }

  .header-right {
    text-align: right;

    .price-display {
      display: flex;
      gap: 24px;
      margin-bottom: 8px;

      .price-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .price-label {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.65);
        }

        .price-value {
          font-size: 24px;
          font-weight: 600;

          &.buy {
            color: #52c41a;
          }

          &.sell {
            color: #ff4d4f;
          }
        }
      }
    }

    .update-time {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.chart-card {
  height: 450px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  :deep(.ant-card-head) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    .ant-card-head-title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  :deep(.ant-card-body) {
    height: calc(100% - 57px);
    padding: 24px;
  }
}

@media (max-width: 1400px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    .header-right {
      width: 100%;
      text-align: left;

      .price-display {
        flex-direction: column;
        gap: 12px;
      }

      .update-time {
        justify-content: flex-start;
      }
    }
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
