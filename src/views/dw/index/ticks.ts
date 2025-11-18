import axios from "axios";

export interface TickRowDto {
  id: number;
  ts: string; // LocalDateTime -> ISO 字符串
  ins: string;
  last: number;
  bid1?: number | null;
  ask1?: number | null;
  vol?: number | null;
  turnover?: number | null;
  oi?: number | null;
  ms?: number | null;
  basis?: number | null;
  // 新增字段
  open?: number | null;
  high?: number | null;
  low?: number | null;
  preClose?: number | null;
  upperLimit?: number | null;
  lowerLimit?: number | null;
  time?: string | null;
  bidVol1?: number | null;
  askVol1?: number | null;
}

// API响应类型定义
interface ApiResponse<T> {
  data: {
    result: T;
  };
}

export async function listTicks(ins: string): Promise<TickRowDto[]> {
  const response = await axios.get<ApiResponse<TickRowDto[]>>(`${import.meta.env.VITE_GLOB_WS}/dw-ticks/list/${ins}`);
  return response.data.result;
} 

export async function listKline1M(ins: string): Promise<TickRowDto[]> {
  const response = await axios.get<ApiResponse<TickRowDto[]>>(`${import.meta.env.VITE_GLOB_WS}/dw-kline1-m/list/${ins}`);
  return response.data.result;
} 

// 新增：获取最新价格接口
export async function getLatestTick(ins: string): Promise<TickRowDto | null> {
  try {
    const response = await axios.get<ApiResponse<TickRowDto>>(`${import.meta.env.VITE_GLOB_WS}/dw-ticks/latest/${ins}`);
    return response.data.result;
  } catch (error) {
    console.error('获取最新价格失败:', error);
    return null;
  }
} 