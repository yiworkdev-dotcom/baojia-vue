<template>
  <div class="big-screen" :class="{ fullscreen: isFullscreen }">
    <!-- 粒子背景 -->
    <div class="particles-bg">
      <div class="particle" v-for="i in 50" :key="i"></div>
    </div>

    <!-- 顶部标题栏 -->
    <div class="screen-header">
      <div class="header-left">
        <div class="logo">
          <Icon icon="ant-design:dashboard-filled" :size="32" />
        </div>
        <div class="title-group">
          <h1 class="main-title">期货报价系统 - 数据大屏</h1>
          <div class="subtitle">FUTURES QUOTATION SYSTEM - DATA SCREEN</div>
        </div>
      </div>
      <div class="header-right">
        <div class="current-time">
          <Icon icon="ant-design:clock-circle-outlined" />
          <span>{{ currentTime }}</span>
        </div>
        <a-button
          v-if="isFullscreen"
          class="fullscreen-btn"
          type="text"
          @click="exitFullscreen"
        >
          <Icon icon="ant-design:fullscreen-exit-outlined" :size="20" />
          <span>退出全屏</span>
        </a-button>
        <a-button
          v-else
          class="fullscreen-btn"
          type="text"
          @click="enterFullscreen"
        >
          <Icon icon="ant-design:fullscreen-outlined" :size="20" />
          <span>全屏显示</span>
        </a-button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="screen-content">
      <!-- 数据卡片区域 -->
      <div class="data-cards-section">
        <DataCard
          title="总用户数"
          :value="overviewData.totalUsers"
          icon="ant-design:user-outlined"
          color="blue"
          :trend="5.2"
          trend-label="较上月"
          subtitle="Total Users"
        />
        <DataCard
          title="活跃用户"
          :value="overviewData.activeUsers"
          icon="ant-design:usergroup-add-outlined"
          color="green"
          :trend="12.8"
          trend-label="较上月"
          subtitle="Active Users"
        />
        <DataCard
          title="在线用户"
          :value="overviewData.onlineUsers"
          icon="ant-design:wifi-outlined"
          color="cyan"
          subtitle="Online Users"
        />
        <DataCard
          title="今日订单"
          :value="overviewData.todayOrders"
          icon="ant-design:transaction-outlined"
          color="purple"
          :trend="8.5"
          trend-label="较昨日"
          subtitle="Today Orders"
        />
        <DataCard
          title="今日交易额"
          :value="overviewData.todayTradeAmount"
          prefix="¥"
          icon="ant-design:rise-outlined"
          color="orange"
          :decimals="2"
          :trend="15.3"
          trend-label="较昨日"
          subtitle="Today Trade Amount"
        />
        <DataCard
          title="累计奖励"
          :value="rewardsData.totalRewards"
          prefix="¥"
          icon="ant-design:gift-outlined"
          color="red"
          :decimals="2"
          subtitle="Total Rewards"
        />
        <DataCard
          title="累计手续费"
          :value="feesData.totalFees"
          prefix="¥"
          icon="ant-design:account-book-outlined"
          color="green"
          :decimals="2"
          subtitle="Total Fees"
        />
        <DataCard
          title="累计交易额"
          :value="overviewData.totalTradeAmount"
          prefix="¥"
          icon="ant-design:fund-outlined"
          color="purple"
          :decimals="2"
          subtitle="Total Trade Amount"
        />
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <!-- 第一行：四个方向订单趋势 + 奖励趋势 -->
        <div class="chart-row">
          <div class="chart-card large">
            <div class="chart-header">
              <h3 class="chart-title">订单方向趋势分析</h3>
              <div class="chart-subtitle">DIRECTION TREND ANALYSIS</div>
            </div>
            <div class="chart-body">
              <v-chart
                :option="directionTrendOption"
                :autoresize="true"
                style="height: 100%"
              />
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">奖励发放趋势</h3>
              <div class="chart-subtitle">REWARDS TREND</div>
            </div>
            <div class="chart-body">
              <v-chart
                :option="rewardsTrendOption"
                :autoresize="true"
                style="height: 100%"
              />
            </div>
          </div>
        </div>

        <!-- 第二行：手续费趋势 + 交易排行榜 + 下单排行榜 -->
        <div class="chart-row">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">手续费收取趋势</h3>
              <div class="chart-subtitle">FEES TREND</div>
            </div>
            <div class="chart-body">
              <v-chart
                :option="feesTrendOption"
                :autoresize="true"
                style="height: 100%"
              />
            </div>
          </div>
          <div class="chart-card">
            <RankingList
              title="交易金额排行榜"
              subtitle="TOP 10 交易用户"
              :data="tradeRanking"
              value-label="交易金额"
            />
          </div>
          <div class="chart-card">
            <RankingList
              title="下单数量排行榜"
              subtitle="TOP 10 活跃用户"
              :data="orderRanking"
              value-label="下单次数"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Button as AButton } from 'ant-design-vue';
import { Icon } from '/@/components/Icon';
import VChart from 'vue-echarts';
import DataCard from './components/DataCard.vue';
import RankingList from './components/RankingList.vue';
import {
  getScreenOverview,
  getRewardsStats,
  getFeesStats,
  getTradeRanking,
  getOrderRanking,
  getDirectionTrend,
  type BigScreenOverview,
  type RewardsStats,
  type FeesStats,
  type UserRanking,
  type DirectionTrend,
} from './BigScreen.api';

// 当前时间
const currentTime = ref('');

// 全屏状态
const isFullscreen = ref(false);

// 总览数据
const overviewData = reactive<BigScreenOverview>({
  totalUsers: 0,
  activeUsers: 0,
  onlineUsers: 0,
  todayOrders: 0,
  todayTradeAmount: 0,
  totalRewards: 0,
  totalFees: 0,
  totalTradeAmount: 0,
});

// 奖励数据
const rewardsData = reactive<RewardsStats>({
  totalRewards: 0,
  todayRewards: 0,
  rewardCount: 0,
  trendData: [],
});

// 手续费数据
const feesData = reactive<FeesStats>({
  totalFees: 0,
  todayFees: 0,
  feeCount: 0,
  trendData: [],
});

// 排行榜数据
const tradeRanking = ref<UserRanking[]>([]);
const orderRanking = ref<UserRanking[]>([]);

// 方向趋势数据
const directionTrendData = ref<DirectionTrend[]>([]);

// 订单方向趋势图表配置
const directionTrendOption = reactive({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    borderColor: 'rgba(100, 200, 255, 0.5)',
    textStyle: {
      color: '#fff',
    },
  },
  legend: {
    data: ['买入开仓', '卖出开仓', '买入平仓', '卖出平仓'],
    textStyle: {
      color: '#fff',
    },
    top: 10,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: 60,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [],
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)',
      },
    },
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
    },
  },
  yAxis: {
    type: 'value',
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)',
      },
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
    },
  },
  series: [
    {
      name: '买入开仓',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: {
        color: '#52c41a',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
            { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
          ],
        },
      },
    },
    {
      name: '卖出开仓',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: {
        color: '#ff4d4f',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
            { offset: 1, color: 'rgba(255, 77, 79, 0.05)' },
          ],
        },
      },
    },
    {
      name: '买入平仓',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: {
        color: '#1890ff',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
          ],
        },
      },
    },
    {
      name: '卖出平仓',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: {
        color: '#faad14',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(250, 173, 20, 0.3)' },
            { offset: 1, color: 'rgba(250, 173, 20, 0.05)' },
          ],
        },
      },
    },
  ],
});

// 奖励趋势图表配置
const rewardsTrendOption = reactive({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    borderColor: 'rgba(100, 200, 255, 0.5)',
    textStyle: {
      color: '#fff',
    },
    formatter: (params) => {
      const param = params[0];
      return `${param.name}<br/>奖励金额: ¥${param.value.toLocaleString()}`;
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: 30,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)',
      },
    },
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
    },
  },
  yAxis: {
    type: 'value',
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)',
      },
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
      formatter: '¥{value}',
    },
  },
  series: [
    {
      type: 'bar',
      data: [],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#ff4d4f' },
            { offset: 1, color: '#ff7875' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '60%',
    },
  ],
});

// 手续费趋势图表配置
const feesTrendOption = reactive({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    borderColor: 'rgba(100, 200, 255, 0.5)',
    textStyle: {
      color: '#fff',
    },
    formatter: (params) => {
      const param = params[0];
      return `${param.name}<br/>手续费: ¥${param.value.toLocaleString()}`;
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: 30,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)',
      },
    },
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
    },
  },
  yAxis: {
    type: 'value',
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)',
      },
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
      formatter: '¥{value}',
    },
  },
  series: [
    {
      type: 'bar',
      data: [],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#52c41a' },
            { offset: 1, color: '#73d13d' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '60%',
    },
  ],
});

// 更新时间
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

// 进入全屏
const enterFullscreen = () => {
  const element = document.documentElement;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  }
  isFullscreen.value = true;
};

// 退出全屏
const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
  isFullscreen.value = false;
};

// 加载总览数据
const loadOverviewData = async () => {
  try {
    const result = await getScreenOverview();
    if (result) {
      Object.assign(overviewData, result);
    }
  } catch (error) {
    console.error('加载总览数据失败:', error);
  }
};

// 加载奖励数据
const loadRewardsData = async () => {
  try {
    const result = await getRewardsStats({ days: 30 });
    if (result) {
      Object.assign(rewardsData, result);

      // 更新图表
      rewardsTrendOption.xAxis.data = result.trendData.map((item) => item.date);
      rewardsTrendOption.series[0].data = result.trendData.map((item) => item.amount);
    }
  } catch (error) {
    console.error('加载奖励数据失败:', error);
  }
};

// 加载手续费数据
const loadFeesData = async () => {
  try {
    const result = await getFeesStats({ days: 30 });
    if (result) {
      Object.assign(feesData, result);

      // 更新图表
      feesTrendOption.xAxis.data = result.trendData.map((item) => item.date);
      feesTrendOption.series[0].data = result.trendData.map((item) => item.amount);
    }
  } catch (error) {
    console.error('加载手续费数据失败:', error);
  }
};

// 加载排行榜数据
const loadRankingData = async () => {
  try {
    const [tradeResult, orderResult] = await Promise.all([
      getTradeRanking({ limit: 10, days: 30 }),
      getOrderRanking({ limit: 10, days: 30 }),
    ]);

    if (tradeResult) {
      tradeRanking.value = tradeResult;
    }

    if (orderResult) {
      orderRanking.value = orderResult;
    }
  } catch (error) {
    console.error('加载排行榜数据失败:', error);
  }
};

// 加载方向趋势数据
const loadDirectionTrend = async () => {
  try {
    const result = await getDirectionTrend({ days: 30 });
    if (result && result.length > 0) {
      directionTrendData.value = result;

      // 更新图表
      directionTrendOption.xAxis.data = result.map((item) => item.date);
      directionTrendOption.series[0].data = result.map((item) => item.buyOpen);
      directionTrendOption.series[1].data = result.map((item) => item.sellOpen);
      directionTrendOption.series[2].data = result.map((item) => item.buyClose);
      directionTrendOption.series[3].data = result.map((item) => item.sellClose);
    }
  } catch (error) {
    console.error('加载方向趋势数据失败:', error);
  }
};

// 加载所有数据
const loadAllData = async () => {
  await Promise.all([
    loadOverviewData(),
    loadRewardsData(),
    loadFeesData(),
    loadRankingData(),
    loadDirectionTrend(),
  ]);
};

// 生命周期
let timeInterval: any = null;
let refreshInterval: any = null;

onMounted(() => {
  updateTime();
  loadAllData();

  // 定时更新时间（每秒）
  timeInterval = setInterval(updateTime, 1000);

  // 定时刷新数据（每30秒）
  refreshInterval = setInterval(loadAllData, 30000);

  // 监听全屏变化
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style lang="less" scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
}

@keyframes glow {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.big-screen {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%);
  overflow-x: hidden;
  padding: 20px;

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    padding: 20px;
  }

  // 粒子背景
  .particles-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;

    .particle {
      position: absolute;
      width: 2px;
      height: 2px;
      background: rgba(100, 200, 255, 0.6);
      border-radius: 50%;
      animation: float 6s infinite ease-in-out;
      box-shadow: 0 0 10px rgba(100, 200, 255, 0.8);

      @for $i from 1 through 50 {
        &:nth-child(@{i}) {
          left: random(100) * 1%;
          top: random(100) * 1%;
          animation-delay: random(6000) * 1ms;
          animation-duration: (random(4000) + 4000) * 1ms;
        }
      }
    }
  }

  // 顶部标题栏
  .screen-header {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    margin-bottom: 24px;
    background: linear-gradient(135deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 40, 0.9) 100%);
    border-radius: 12px;
    border: 1px solid rgba(100, 200, 255, 0.3);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;

      .logo {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #64c8ff 0%, #0088ff 100%);
        border-radius: 12px;
        color: #fff;
        box-shadow: 0 0 30px rgba(100, 200, 255, 0.6);
      }

      .title-group {
        .main-title {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 4px 0;
          text-shadow: 0 0 20px rgba(100, 200, 255, 0.8);
          letter-spacing: 2px;
        }

        .subtitle {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 2px;
          font-family: 'Arial', sans-serif;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;

      .current-time {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(100, 200, 255, 0.3);
        color: #64c8ff;
        font-size: 16px;
        font-family: 'Consolas', monospace;
        font-weight: 600;
      }

      .fullscreen-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: rgba(100, 200, 255, 0.1);
        border: 1px solid rgba(100, 200, 255, 0.3);
        border-radius: 8px;
        color: #64c8ff;
        font-size: 14px;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(100, 200, 255, 0.2);
          border-color: rgba(100, 200, 255, 0.5);
          transform: translateY(-2px);
        }
      }
    }
  }

  // 主内容区域
  .screen-content {
    position: relative;
    z-index: 10;

    // 数据卡片区域
    .data-cards-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    // 图表区域
    .charts-section {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .chart-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;

        &:first-child {
          .chart-card.large {
            grid-column: 1 / 3;
          }
        }

        .chart-card {
          background: linear-gradient(135deg, rgba(30, 30, 50, 0.9) 0%, rgba(20, 20, 40, 0.95) 100%);
          border-radius: 12px;
          border: 1px solid rgba(100, 200, 255, 0.3);
          overflow: hidden;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          min-height: 400px;
          display: flex;
          flex-direction: column;

          &:hover {
            border-color: rgba(100, 200, 255, 0.6);
            box-shadow: 0 8px 32px rgba(100, 200, 255, 0.2);
          }

          .chart-header {
            padding: 20px 24px;
            background: linear-gradient(90deg, rgba(100, 200, 255, 0.2) 0%, rgba(100, 200, 255, 0.05) 100%);
            border-bottom: 1px solid rgba(100, 200, 255, 0.3);

            .chart-title {
              font-size: 16px;
              font-weight: 600;
              color: #fff;
              margin: 0 0 4px 0;
              letter-spacing: 1px;
            }

            .chart-subtitle {
              font-size: 11px;
              color: rgba(255, 255, 255, 0.4);
              letter-spacing: 1px;
            }
          }

          .chart-body {
            flex: 1;
            padding: 20px;
            min-height: 0;
          }
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 1600px) {
  .big-screen {
    .screen-content {
      .data-cards-section {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  }
}

@media (max-width: 1200px) {
  .big-screen {
    .screen-content {
      .data-cards-section {
        grid-template-columns: repeat(3, 1fr);
      }

      .charts-section {
        .chart-row {
          grid-template-columns: repeat(2, 1fr);

          &:first-child {
            .chart-card.large {
              grid-column: 1 / 3;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .big-screen {
    padding: 10px;

    .screen-header {
      flex-direction: column;
      gap: 16px;
      padding: 16px;

      .header-left {
        width: 100%;
      }

      .header-right {
        width: 100%;
        justify-content: space-between;
      }
    }

    .screen-content {
      .data-cards-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .charts-section {
        .chart-row {
          grid-template-columns: 1fr;

          &:first-child {
            .chart-card.large {
              grid-column: 1;
            }
          }
        }
      }
    }
  }
}
</style>
