<template>
  <div class="app-container">
    <!-- 355带钢价格变动曲线 -->
    <section>
      <h1 class="header-title">355带钢价格变动曲线</h1>
      <v-chart class="chart steel-chart" :option="steelChartOption" :autoresize="true" />
    </section>

    <!-- 产品实时行情面板 -->
    <header class="header">
      <h1 class="header-title">产品实时行情面板</h1>
      <div class="header-controls">
        <!-- 下拉菜单 -->
        <div class="select-container">
          <select v-model="currentIns" class="select-dropdown">
            <option v-for="s in instruments" :key="s" :value="s">
              {{ formatInstrumentName(s) }}
            </option>
          </select>
          <div class="select-arrow"></div>
        </div>
      </div>
    </header>

    <!-- 主图和信息面板的左右布局容器 -->
    <div class="main-content">
            <!-- 信息面板 -->
            <section class="info-panel">
        <div class="card">
          <h3>合约 {{ formatInstrumentName(currentIns) }}（Tick）</h3>
          <div class="grid2">
            <div><b>最新</b>：{{ tick?.last ?? "-" }}</div>
            <div><b>基差</b>：{{ tick?.basis ?? "-" }}</div>
            <div><b>开盘</b>：{{ tick?.open ?? "-" }}</div>
            <div><b>最高</b>：{{ tick?.high ?? "-" }}</div>
            <div><b>最低</b>：{{ tick?.low ?? "-" }}</div>
            <div><b>昨收</b>：{{ tick?.preClose ?? "-" }}</div>
            <div><b>涨停</b>：{{ tick?.upperLimit ?? "-" }}</div>
            <div><b>跌停</b>：{{ tick?.lowerLimit ?? "-" }}</div>
            <div><b>成交量</b>：{{ tick?.vol ?? "-" }}</div>
            <div><b>成交额</b>：{{ formatTurnover(tick?.turnover) }}</div>
            <div><b>持仓量</b>：{{ tick?.openInterest ?? "-" }}</div>
            <div><b>买入价</b>：{{ tick?.bid1 ?? "-" }}</div>
            <div><b>买入量</b>：{{ tick?.bidVol1 ?? "-" }}</div>
            <div><b>卖出价</b>：{{ tick?.ask1 ?? "-" }}</div>
            <div><b>卖出量</b>：{{ tick?.askVol1 ?? "-" }}</div>
            <div>
              <b>交易所时刻</b>：{{ tick?.time ?? "-" }}{{ tick ? "." + tick.ms===undefined ? "000" : tick.ms : "" }}
            </div>
          </div>
        </div>
      </section>
      <!-- 主图：合约K线 -->
      <div class="chart-container">
        <v-chart class="chart" :option="chartOption" :autoresize="true" />
      </div>


    </div>
  </div>
</template>
  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from "vue";
  import { use } from "echarts/core";
  import VChart from "vue-echarts";
  import {
    GridComponent,
    TooltipComponent,
    DataZoomComponent,
    LegendComponent,
  } from "echarts/components";
  import { useGlobSetting } from "@/hooks/setting";
  import { LineChart, CandlestickChart, BarChart } from "echarts/charts";
  import { CanvasRenderer } from "echarts/renderers";
  import { listKline1M, listTicks, getLatestTick, type TickRowDto } from "./ticks";
  import { listAll } from "./xian";
  import axios from "axios";
  use([
    GridComponent,
    TooltipComponent,
    DataZoomComponent,
    LegendComponent,
    LineChart,
    CandlestickChart,
    BarChart,
    CanvasRenderer,
  ]);
  
  // ==== 类型定义 ====
  interface KlineRowDto {
    id: number;
    tOpen: string; // LocalDateTime 在 JSON 中通常是字符串格式
    ins: string;
    open: number;
    high: number;
    low: number;
    close: number;
    vol: number;
    turnover: number;
  }

  // 355带钢价格数据类型
  interface SteelPriceData {
    buyPrice: number;
    sellPrice: number;
    updateTime: string;
  }
  
  // ==== 状态 ====
  const instruments = ref<string[]>([]); // 动态填充
  const currentIns = ref<string>(""); // 第一次收到谁就选谁
  
  // 初始化合约列表
  const defaultInstruments = ref<string[]>([]);
  
  // 355带钢价格数据
  const steelPriceData = ref<Array<[number, number]>>([]);
  const steelBuyPriceData = ref<Array<[number, number]>>([]);
  const steelSellPriceData = ref<Array<[number, number]>>([]);

  // 355带钢轮询定时器
  let steelPriceTimer: number | null = null;

  // 从后端获取355带钢价格数据
  async function loadSteelPriceData() {
    try {
      const response = await listAll();
      const data = response as SteelPriceData[];
      if (Array.isArray(data) && data.length > 0) {
        // 处理数据，转换为图表需要的格式
        const buyData: Array<[number, number]> = [];
        const sellData: Array<[number, number]> = [];
        const avgData: Array<[number, number]> = [];
        
        data.forEach(item => {
          const timestamp = new Date(item.updateTime).getTime();
          const buyPrice = Number(item.buyPrice) || 0;
          const sellPrice = Number(item.sellPrice) || 0;
          const avgPrice = (buyPrice + sellPrice) / 2;
          
          if (timestamp && buyPrice > 0) {
            buyData.push([timestamp, buyPrice]);
          }
          if (timestamp && sellPrice > 0) {
            sellData.push([timestamp, sellPrice]);
          }
          if (timestamp && avgPrice > 0) {
            avgData.push([timestamp, avgPrice]);
          }
        });
        
        // 按时间排序
        buyData.sort((a, b) => a[0] - b[0]);
        sellData.sort((a, b) => a[0] - b[0]);
        avgData.sort((a, b) => a[0] - b[0]);
        
        steelBuyPriceData.value = buyData;
        steelSellPriceData.value = sellData;
        steelPriceData.value = avgData; // 使用平均价格作为主曲线
      }
    } catch (e) {
      console.error('加载355带钢价格数据失败:', e);
      // 如果加载失败，使用假数据
    }
  }

  // 启动355带钢价格轮询
  function startSteelPricePolling() {
    // 立即执行一次
    loadSteelPriceData();
    
    // 设置1秒轮询
    steelPriceTimer = window.setInterval(() => {
      loadSteelPriceData();
    }, 1000);
  }

  // 停止355带钢价格轮询
  function stopSteelPricePolling() {
    if (steelPriceTimer) {
      clearInterval(steelPriceTimer);
      steelPriceTimer = null;
    }
  }
  
  
// 355带钢图表配置
const steelChartOption = computed(() => {
    // 计算数据范围
    const allData = [...steelBuyPriceData.value, ...steelSellPriceData.value];
    const prices = allData.map(item => item[1]).filter(price => price > 0);
    
    let minPrice = 0;
    let maxPrice = 0;
    
    if (prices.length > 0) {
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
      // 添加一些边距，让图表看起来更舒适
      const range = maxPrice - minPrice;
      const padding = range * 0.1; // 10%的边距
      minPrice = Math.max(0, minPrice - padding);
      maxPrice = maxPrice + padding;
    } else {
      // 如果没有数据，使用默认范围
      minPrice = 3000;
      maxPrice = 4000;
    }

    return {
      title: {
        text: '355带钢价格变化曲线', // 这里可以修改为你想要的标题
        left: 'center',
        top: 10,
        textAlign: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937'
        }
      },
      tooltip: {
        trigger: "axis",
        formatter: function (params: any) {
          let result = "";
          if (params && params.length > 0) {
            // 获取当前数据点的索引
            const dataIndex = params[0].dataIndex;
            // 使用数据索引来获取对应的时间
            const timeStr = steelBuyPriceData.value[dataIndex] ? 
              new Date(steelBuyPriceData.value[dataIndex][0]).toLocaleString("zh-CN", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              }) : "";
            
            result = timeStr + "<br/>";
            
            // 显示所有系列的数据
            params.forEach((param: any) => {
              result += `${param.seriesName}: ${param.value}元/吨<br/>`;
            });
          }
          return result;
        },
        textStyle: {
          fontSize: 14
        }
      },
      legend: {
        data: ["买入价", "卖出价"],
        top: 40,
        textStyle: {
          fontSize: 14
        }
      },
      grid: {
        left: 80,
        right: 30,
        top: 90,
        bottom: 60,
        containLabel: true
      },

xAxis: {
  type: "category",
  data: steelBuyPriceData.value.map(item => {
    const date = new Date(item[0]);
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }),
  axisLabel: {
    fontSize: 12,
    color: "#666",
    rotate: 30 // 如果点多，可以斜着显示
  },
  axisLine: { lineStyle: { color: "#ddd" } },
  axisTick: { alignWithLabel: true }
}
,
      yAxis: {
        type: "value",
        min: minPrice,
        max: maxPrice,
        axisLabel: {
          formatter: '{value} 元/吨',
          fontSize: 12,
          color: '#666'
        },
        axisLine: {
          lineStyle: {
            color: '#ddd'
          }
        },
        axisTick: {
          lineStyle: {
            color: '#ddd'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: "买入价",
          type: "line",
          data: steelBuyPriceData.value.map(item => item[1]), // 只传价格数据，不传时间戳
          smooth: true,
          lineStyle: {
            color: '#ef4444',
            width: 3
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(239, 68, 68, 0.3)'
              }, {
                offset: 1, color: 'rgba(239, 68, 68, 0.05)'
              }]
            }
          },
          showSymbol: false,
          sampling: "lttb",
        },
        {
          name: "卖出价",
          type: "line",
          data: steelSellPriceData.value.map(item => item[1]), // 只传价格数据，不传时间戳
          smooth: true,
          lineStyle: {
            color: '#10b981',
            width: 3
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(16, 185, 129, 0.3)'
              }, {
                offset: 1, color: 'rgba(16, 185, 129, 0.05)'
              }]
            }
          },
          showSymbol: false,
          sampling: "lttb",
        },
      ],
    };
  });
  
  // 从后端获取合约列表
  async function loadInstrumentsList() {
    try {
      const result = await axios.get(`${import.meta.env.VITE_GLOB_WS}/dw-future-product/list`);
      if (Array.isArray(result.data.result)) {
        defaultInstruments.value = result.data.result;
        instruments.value = [...result.data.result];
      }
    } catch (e) {
      console.error('加载合约列表失败:', e);
    }
  }
  
  // 实时数据缓存（内存）
  type Tick = any;
  const latestTicks = ref<Record<string, Tick>>({});
  const klineSeries = ref<
    Record<string, Array<[number, number, number, number, number]>>
  >({}); // [ts, open, close, low, high]
  const klineVol = ref<Record<string, Array<[number, number]>>>({}); // [ts, vol]
  
  // WS 活跃监控
  let wsLastMessageAt = 0;
  let wsActive = false; // 最近一次心跳判定
  let wsMonitorTimer: number | null = null;
  
  // 新增：最新价格查询定时器
  let latestPriceTimer: number | null = null;

  // 新增：K线数据监控
  let klineLastMessageAt = 0;
  let klineActive = false;
  let klineMonitorTimer: number | null = null;

  // 新增：查询最新价格的函数
  async function fetchLatestPrice(ins: string) {
    if (!ins) return;
    try {
      const latestTick = await getLatestTick(ins);
      if (latestTick) {
        // 更新最新tick信息
        latestTicks.value[ins] = {
          ins: latestTick.ins,
          ts: typeof latestTick.ts === "string" ? Date.parse(latestTick.ts) : latestTick.ts,
          last: latestTick.last,
          open: latestTick.open,
          high: latestTick.high,
          low: latestTick.low,
          preClose: latestTick.preClose,
          upperLimit: latestTick.upperLimit,
          lowerLimit: latestTick.lowerLimit,
          bid1: latestTick.bid1,
          ask1: latestTick.ask1,
          vol: latestTick.vol,
          turnover: latestTick.turnover,
          openInterest: latestTick.oi,
          ms: latestTick.ms,
          time: latestTick.time,
          bidVol1: latestTick.bidVol1,
          askVol1: latestTick.askVol1,
          basis: latestTick.basis,
        } as any;
      }
    } catch (error) {
      console.error('获取最新价格失败:', error);
    }
  }

  // 新增：查询最新K线数据的函数
  async function fetchLatestKlineData(ins: string) {
    if (!ins) return;
    try {
      await loadKlineData(ins);
    } catch (error) {
      console.error('获取最新K线数据失败:', error);
    }
  }

  // 新增：启动K线数据查询定时器
  function startKlineDataPolling() {
    // 每30秒检查一次K线数据状态
    klineMonitorTimer = window.setInterval(async () => {
      const now = Date.now();
      const timeSinceLastKlineMessage = now - klineLastMessageAt;
      
      // 如果2分钟内没有K线数据推送，则查询最新K线数据
      if (timeSinceLastKlineMessage > 120000) { // 120000ms = 2分钟
        if (currentIns.value) {
          await fetchLatestKlineData(currentIns.value);
        }
      }
    }, 30000); // 每30秒检查一次
  }

  // 新增：停止K线数据查询定时器
  function stopKlineDataPolling() {
    if (klineMonitorTimer) {
      clearInterval(klineMonitorTimer);
      klineMonitorTimer = null;
    }
  }

  // 新增：启动最新价格查询定时器
  function startLatestPricePolling() {
    // 每30秒检查一次WebSocket状态
    latestPriceTimer = window.setInterval(async () => {
      const now = Date.now();
      const timeSinceLastMessage = now - wsLastMessageAt;
      
      // 如果1分钟内没有WebSocket消息，则查询最新价格
      if (timeSinceLastMessage > 60000) { // 60000ms = 1分钟
        if (currentIns.value) {
          await fetchLatestPrice(currentIns.value);
        }
      }
    }, 30000); // 每30秒检查一次
  }

  // 新增：停止最新价格查询定时器
  function stopLatestPricePolling() {
    if (latestPriceTimer) {
      clearInterval(latestPriceTimer);
      latestPriceTimer = null;
    }
  }

  // ==== WebSocket ====
  const wsUrl = "ws://localhost:8080ws/quotes";
  let ws: WebSocket | null = null;
  
  // ==== K线数据查询 ====
  async function loadKlineData(ins: string) {
    if (!ins) return;
    try {
      const rows = await listKline1M(ins);
      // 确保rows是数组
      const dataArray = Array.isArray(rows) ? rows : [rows];
      if (dataArray.length > 0) {
        // 将TickRowDto转换为KlineRowDto格式，兼容不同字段名
        const klineRows: KlineRowDto[] = dataArray.map(row => {
          // 兼容不同的时间字段
          let tOpen = row.ts || (row as any).topen || (row as any).tOpen || (row as any).t_open || (row as any).openTime || (row as any).time || (row as any).timestamp;
          
          // 兼容不同的收盘价字段
          let close = (row as any).close || row.last || 0;
          
          return {
            id: row.id,
            tOpen: tOpen,
            ins: row.ins,
            open: row.open || 0,
            high: row.high || 0,
            low: row.low || 0,
            close: close,
            vol: row.vol || 0,
            turnover: row.turnover || 0,
          };
        });
        console.log('转换后的K线数据:', klineRows);
        applyKlineRows(ins, klineRows);
      } else {
        console.log('K线数据为空');
      }
    } catch (e) {
      console.error('加载K线数据失败:', e);
    }
  }
  
  function applyKlineRows(ins: string, rows: KlineRowDto[]) {
    console.log('应用K线数据:', ins, rows.length, '条');
    console.log('原始K线数据:', rows);
    
    // 确保数据结构被初始化
    if (!klineSeries.value[ins]) klineSeries.value[ins] = [];
    if (!klineVol.value[ins]) klineVol.value[ins] = [];
    
    // 清空现有数据，重新加载历史数据
    klineSeries.value[ins] = [];
    klineVol.value[ins] = [];
    
    // 解析K线数据
    const parsed = rows
      .map((r, index) => {
        console.log(`处理第${index}条数据:`, r);
        
        // 检查所有可能的时间字段，包括后端返回的topen
        let tOpen: number = 0;
        const timeFields = ['tOpen', 't_open', 'openTime', 'time', 'timestamp', 'ts', 'topen'];
        
        for (const field of timeFields) {
          if (r[field] !== undefined && r[field] !== null) {
            if (typeof r[field] === "string") {
              const date = new Date(r[field]);
              if (!isNaN(date.getTime())) {
                tOpen = date.getTime();
                console.log(`使用字段${field}作为时间:`, r[field], '->', tOpen);
                break;
              }
            } else if (typeof r[field] === "number") {
              tOpen = r[field];
              console.log(`使用字段${field}作为时间:`, r[field]);
              break;
            }
          }
        }
        
        // 如果还是0，尝试使用当前时间加上索引（作为临时解决方案）
        if (tOpen === 0) {
          tOpen = Date.now() + index * 60000; // 每分钟一个数据点
          console.log(`使用默认时间:`, tOpen);
        }
        
        const result = {
          tOpen,
          ins: r.ins || ins,
          open: Number(r.open) || 0,
          high: Number(r.high) || 0,
          low: Number(r.low) || 0,
          close: Number(r.close) || 0,
          vol: Number(r.vol) || 0,
          turnover: Number(r.turnover) || 0,
        };
        
        console.log(`解析结果:`, result);
        return result;
      })
      .filter((x) => {
        const isValid = x.tOpen > 0 && !Number.isNaN(x.open) && !Number.isNaN(x.close) && x.open > 0 && x.close > 0;
        if (!isValid) {
          console.log('过滤掉无效数据:', x);
        }
        return isValid;
      })
      .sort((a, b) => a.tOpen - b.tOpen);
    
    console.log('解析后的有效K线数据:', parsed.length, '条');
    console.log('解析后的数据详情:', parsed);
    
    // 维护合约列表
    if (!instruments.value.includes(ins)) instruments.value.push(ins);
    if (!currentIns.value) currentIns.value = ins;
    
    if (parsed.length === 0) {
      console.log('没有有效的K线数据');
      return;
    }
    
    // 添加K线数据
    for (const p of parsed) {
      const klineData: [number, number, number, number, number] = [p.tOpen, p.open, p.close, p.low, p.high];
      const volData: [number, number] = [p.tOpen, p.vol];
      
      console.log('添加K线数据:', klineData);
      console.log('添加成交量数据:', volData);
      
      klineSeries.value[ins].push(klineData);
      klineVol.value[ins].push(volData);
    }
    
    console.log('最终K线数据:', klineSeries.value[ins].length, '条');
    console.log('最终成交量数据:', klineVol.value[ins].length, '条');
    console.log('最终K线数据详情:', klineSeries.value[ins]);
    console.log('最终成交量数据详情:', klineVol.value[ins]);
    
    // 不要在这里更新latestTicks，让applyTickRows来处理
    // 这样可以保留完整的tick信息
  }
  
  onMounted(async () => {
    // 启动355带钢价格轮询
    startSteelPricePolling();
    
    // 启动最新价格查询定时器
    startLatestPricePolling();
    
    // 启动K线数据查询定时器
    startKlineDataPolling();
    
    // 先加载合约列表
    await loadInstrumentsList();
    
    // 加载默认合约的K线数据
    if (instruments.value.length > 0) {
      currentIns.value = instruments.value[0];
      
      // 延迟1秒加载K线数据，让tick数据先渲染
      setTimeout(async () => {
        await loadKlineData(currentIns.value);
      }, 1000);
      
      // 页面加载时立即获取一次最新tick数据
      await fetchLatestPrice(currentIns.value);
    }

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket连接已建立');
      };
      ws.onerror = (e) => {
        console.error('WebSocket连接错误:', e);
      };
      ws.onclose = () => {
        console.log('WebSocket连接已关闭');
      };
    } catch (error) {
      console.error('创建WebSocket失败:', error);
    }

    // 1s 后若仍无推送，则主动回填数据库
    window.setTimeout(() => {
      if (!wsActive && !wsLastMessageAt) {
        hydrateFromDb(currentIns.value, /*merge*/ true).catch(() => {});
      }
    }, 1000);

    // 同时查询所有合约的历史数据
    window.setTimeout(() => {
      hydrateAllInstrumentsFromDb().catch(() => {});
    }, 2000);

    // 监控 WS 活跃度：每 3s 判定一次，从不活跃 -> 活跃 时再补打一遍库，避免断流期间的缺口
    wsMonitorTimer = window.setInterval(() => {
      const now = Date.now();
      const curActive = now - wsLastMessageAt < 5000; // 5s 内有消息视为活跃
      if (curActive && !wsActive) {
        // 从不活跃 -> 活跃，回补数据库
        hydrateFromDb(currentIns.value, /*merge*/ true).catch(() => {});
      }
      wsActive = curActive;
    }, 3000) as unknown as number;

    if (!ws) return;

    ws.onmessage = (e) => {
      let msg: any = e.data;
      try {
        if (typeof msg === "string") msg = JSON.parse(msg);
      } catch (err) {
        // WS bad json
        return;
      }

      wsLastMessageAt = Date.now();

      // 统一要求有 type
      if (msg?.type === "tick") {
        const t = msg as Tick;

        // 数据验证
        if (!t.ins || t.ts == null || t.last == null) {
          return;
        }
        
        // 保留现有的完整数据，只更新必要的字段
        const existingTick = latestTicks.value[t.ins] || {};
        latestTicks.value[t.ins] = {
          ...existingTick, // 保留现有数据
          ins: t.ins,
          ts: t.ts,
          last: t.last,
          // 只更新WebSocket消息中存在的字段
          ...(t.bid1 !== undefined && { bid1: t.bid1 }),
          ...(t.ask1 !== undefined && { ask1: t.ask1 }),
          ...(t.vol !== undefined && { vol: t.vol }),
          ...(t.turnover !== undefined && { turnover: t.turnover }),
          ...(t.oi !== undefined && { openInterest: t.oi }),
          ...(t.ms !== undefined && { ms: t.ms }),
          ...(t.basis !== undefined && { basis: t.basis }),
          ...(t.open !== undefined && { open: t.open }),
          ...(t.high !== undefined && { high: t.high }),
          ...(t.low !== undefined && { low: t.low }),
          ...(t.preClose !== undefined && { preClose: t.preClose }),
          ...(t.upperLimit !== undefined && { upperLimit: t.upperLimit }),
          ...(t.lowerLimit !== undefined && { lowerLimit: t.lowerLimit }),
          ...(t.time !== undefined && { time: t.time }),
          ...(t.bidVol1 !== undefined && { bidVol1: t.bidVol1 }),
          ...(t.askVol1 !== undefined && { askVol1: t.askVol1 }),
        };

        // 动态维护合约列表 & 默认选中
        if (!instruments.value.includes(t.ins)) {
          instruments.value.push(t.ins);
        }
        if (!currentIns.value) currentIns.value = t.ins;

        // 移除折线数据相关代码，只保留K线数据
      } else if (msg?.type === "kline") {
        const k = msg;

        // 数据验证
        if (
          !k.ins ||
          k.tOpen == null ||
          k.open == null ||
          k.close == null ||
          k.low == null ||
          k.high == null
        ) {
          return;
        }

        // 更新K线数据最后接收时间
        klineLastMessageAt = Date.now();

        (klineSeries.value[k.ins] ||= []).push([
          k.tOpen,
          k.open,
          k.close,
          k.low,
          k.high,
        ]);
        (klineVol.value[k.ins] ||= []).push([k.tOpen, k.vol || 0]);
        // 移除K线实时数据量限制，保留所有历史数据

        if (!instruments.value.includes(k.ins)) {
          instruments.value.push(k.ins);
        }
        if (!currentIns.value) currentIns.value = k.ins;
      } else {
        // 允许心跳等
      }
    };
  });
  
  // 组件卸载时清理WebSocket连接和定时器
  onUnmounted(() => {
    // 停止355带钢价格轮询
    stopSteelPricePolling();
    
    // 停止最新价格查询定时器
    stopLatestPricePolling();
    
    // 停止K线数据查询定时器
    stopKlineDataPolling();
    
    if (ws) {
      ws.close();
      ws = null;
    }
    if (wsMonitorTimer) {
      clearInterval(wsMonitorTimer as unknown as number);
      wsMonitorTimer = null;
    }
  });
  
  // 切换合约时，立刻加载K线数据
  watch(currentIns, async (ins) => {
    if (ins) {
      // 延迟500ms加载K线数据，避免与tick数据冲突
      setTimeout(async () => {
        await loadKlineData(ins);
      }, 500);
      
      // 同时加载tick数据用于实时显示
      hydrateFromDb(ins, /*merge*/ false).catch((e) => {
        // 切换合约加载数据失败
      });
    }
  });
  
  // 选中的 tick
  const tick = computed(() => latestTicks.value[currentIns.value]);
  
  // 图表配置：只保留K线图
  const chartOption = computed(() => {
    const k = klineSeries.value[currentIns.value] ?? [];
    const v = klineVol.value[currentIns.value] ?? [];

    // 将K线数据转换为收盘价折线数据，并过滤无效数据
    const closeData = k
      .filter(
        (item) => item && item.length >= 5 && item[0] != null && item[2] != null
      )
      .map((item) => [item[0], item[2]]); // [ts, close]

    // 成交量数据
    const volumeData = v.filter(
      (item) =>
        item && item.length >= 2 && item[0] != null && item[1] != null
    );

    return {
      tooltip: {
        trigger: "axis",
        formatter: function (params: any) {
          let result = "";
          params.forEach((param: any) => {
            const time = new Date(param.value[0]);
            const timeStr = time.toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            });
            if (result === "") {
              result = timeStr + "<br/>";
            }
            result += `${param.seriesName}: ${param.value[1]}<br/>`;
          });
          return result;
        },
      },
      legend: { data: ["收盘价", "成交量"] },
      grid: [
        { left: 50, right: 20, top: 20, height: "60%" },
        { left: 50, right: 20, top: "72%", height: "18%" },
      ],
      dataZoom: [
        { type: "inside", xAxisIndex: [0, 1] },
        { type: "slider", xAxisIndex: [0, 1] },
      ],
      xAxis: [
        {
          type: "time",
          gridIndex: 0,
          axisLabel: {
            formatter: function (value: number) {
              const date = new Date(value);
              return date.toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              });
            },
          },
        },
        {
          type: "time",
          gridIndex: 1,
          axisLabel: {
            formatter: function (value: number) {
              const date = new Date(value);
              return date.toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              });
            },
          },
        },
      ],
      yAxis: [{ scale: true, gridIndex: 0 }, { gridIndex: 1 }],
      series: [
        {
          name: "收盘价",
          type: "line",
          xAxisIndex: 0,
          yAxisIndex: 0,
          showSymbol: false,
          sampling: "lttb",
          data: closeData,
        },
        {
          name: "成交量",
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          encode: { x: 0, y: 1 },
          data: volumeData,
        },
      ],
    };
  });
  
  // ==== DB 回填与合并逻辑 ====
  async function hydrateFromDb(ins: string, merge = true) {
    if (!ins) return;
    try {
      const rows = await listTicks(ins);
      if (!Array.isArray(rows) || rows.length === 0) {
        // 即使没有数据，也要初始化数据结构
        applyTickRows(ins, []);
        return;
      }
      applyTickRows(ins, rows);
    } catch (e) {
      // 即使出错，也要初始化数据结构
      applyTickRows(ins, []);
    }
  }
  
  // 查询所有合约的历史数据
  async function hydrateAllInstrumentsFromDb() {
    try {
      // 使用从后端获取的合约列表
      const allInstruments = defaultInstruments.value;
      if (allInstruments.length === 0) {
        return;
      }
  
      // 并行执行所有合约的查询，而不是串行
      const promises = allInstruments.map((ins) => hydrateFromDb(ins, false));
      await Promise.all(promises);
    } catch (e) {
      // 静默处理错误
    }
  }
  
  function applyTickRows(ins: string, rows: TickRowDto[]) {
    console.log('应用tick数据:', ins, rows.length, '条');
    console.log('原始tick数据:', rows);
    
    // 解析时间并排序
    const parsed = rows
      .map((r) => {
        console.log('处理tick数据:', r);
        return {
          ts: typeof r.ts === "string" ? Date.parse(r.ts) : (r as any).ts || 0,
          ins: r.ins || ins,
          last: Number(r.last),
          bid1: r.bid1 ?? null,
          ask1: r.ask1 ?? null,
          vol: r.vol ?? null,
          turnover: r.turnover ?? null,
          oi: r.oi ?? null,
          ms: r.ms ?? null,
          basis: r.basis ?? null,
          // 添加缺失的字段
          open: r.open ?? null,
          high: r.high ?? null,
          low: r.low ?? null,
          preClose: r.preClose ?? null,
          upperLimit: r.upperLimit ?? null,
          lowerLimit: r.lowerLimit ?? null,
          time: r.time ?? null,
          bidVol1: r.bidVol1 ?? null,
          askVol1: r.askVol1 ?? null,
        };
      })
      .filter((x) => x.ts && !Number.isNaN(x.last))
      .sort((a, b) => a.ts - b.ts);

    console.log('解析后的tick数据:', parsed);

    // 维护合约
    if (!instruments.value.includes(ins)) instruments.value.push(ins);
    if (!currentIns.value) currentIns.value = ins;

    // 确保数据结构被初始化，即使没有数据
    if (!klineSeries.value[ins]) klineSeries.value[ins] = [];
    if (!klineVol.value[ins]) klineVol.value[ins] = [];

    if (parsed.length === 0) {
      console.log('没有有效的tick数据');
      return;
    }

    // 最新 Tick 信息
    const last = parsed[parsed.length - 1];
    latestTicks.value[ins] = {
      ins,
      ts: last.ts,
      last: last.last,
      bid1: last.bid1,
      ask1: last.ask1,
      vol: last.vol,
      turnover: last.turnover,
      openInterest: last.oi,
      ms: last.ms,
      basis: last.basis,
      // 添加缺失的字段
      open: last.open,
      high: last.high,
      low: last.low,
      preClose: last.preClose,
      upperLimit: last.upperLimit,
      lowerLimit: last.lowerLimit,
      time: last.time,
      bidVol1: last.bidVol1,
      askVol1: last.askVol1,
    } as any;
    
    console.log('最终tick数据:', latestTicks.value[ins]);
  }
  
  // 工具函数（展示）
  function formatTurnover(t?: number) {
    if (t == null) return "-";
    if (t >= 1e8) return (t / 1e8).toFixed(2) + "亿";
    if (t >= 1e4) return (t / 1e4).toFixed(2) + "万";
    return t.toFixed(0);
  }
  
  // 格式化合约显示名称
  function formatInstrumentName(ins: string): string {
    if (!ins) return "";
    if (ins.startsWith("rb")) {
      return `螺纹钢${ins}`;
    } else if (ins.startsWith("hc")) {
      return `热卷${ins}`;
    }
    return ins;
  }
  
  function showPx(v: number | null | undefined) {
    return v == null ? "-" : v;
  }
  function showVol(v: number | null | undefined) {
    return v && v > 0 ? v : "-";
  }
  </script>
  

  
  <script lang="ts">
  export default {
    components: { "v-chart": VChart },
  };
  </script>
  <style scoped>
  @import './index.css';
  </style>
  