// src/hooks/business/usePendingQuoteTicker.ts
import { onUnmounted } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { h } from 'vue';

interface QuoteItem {
  id: string;
  userName: string;      // 用户名
  productName: string;   // 产品名
  varietyCode: string;   // 产品编码
  quotePrice?: number;   // 报价
  updateTime?: string;   // 更新时间
}

export function usePendingQuoteTicker() {
  const { notification } = useMessage();
  let timer: number | null = null;

  // 获取当前用户角色
  async function getCurrentUserRoles(): Promise<string[]> {
    try {
      const res = await defHttp.get<any>({
        url: '/sys/role/getUserRoles',
      });
      return res[0]
    } catch (error) {
      console.log('获取用户角色失败:', error);
      return [];
    }
  }

  // 检查是否为普通用户
  async function isNormalUser(): Promise<boolean> {
    const roles = await getCurrentUserRoles();
    // 判断是否只有普通用户角色
    return roles.includes('普通用户');
  }

  /** 1) 查询"报价待审核"数据（status=1）并补齐人名 & 产品名 */
  async function fetchPendingQuotes(): Promise<QuoteItem[]> {
    return defHttp
      .get<any>({
        url: '/dw/quote/dwUserQuote/list',
        params: {
          pageNo: 1,
          pageSize: 9999, // 只查询待审核状态的报价
        }
      })
      .then(async (res) => {
        
        const rows: any[] = res?.records || [];
        // 过滤出待审核状态的报价
        const filtered = rows.filter((r: any) => String(r.status) === '1');
        return enrichNames(filtered);
      }).catch((err) => {
        console.log('查询报价失败:', err);
        return [];
      });
  }

  /** 用字典字段翻译成可读文字 */
  async function enrichNames(rows: any[]): Promise<QuoteItem[]> {
    
    return rows.map((r: any) => ({
      id: r.id,
      userName: r.userId_dictText || r.realname || r.userName || '未知用户',
      productName: r.productId_dictText || r.productName || r.quoteName_dictText || '355带钢',
      quotePrice: r.quotePrice,
      updateTime: r.updateTime,
    })) as QuoteItem[];
  }

  function notify(items: QuoteItem[]) {
    if (!items?.length) return;
    
    const MAX_SHOW = 3;
    const lines = items
      .slice(0, MAX_SHOW)
      .map(i => `【${i.userName}】提交【${i.productName}】报价待审核`);

    const tail = items.length > MAX_SHOW ? `等 ${items.length - MAX_SHOW} 条待审核` : '';
    const text = tail ? `${lines.join('\n')}\n${tail}` : lines.join('\n');

    notification.warning({
      message: '报价待审核',
      description: () =>
        h('div', { style: 'white-space: pre-line; line-height: 1.5;' }, text),
      duration: 5,
      placement: 'topRight',
    });
  }

  /** 3) 每次执行 */
  async function tick() {
    try {
      // 先检查用户角色，如果是普通用户则不显示提示
      const isNormal = await isNormalUser();
      if (isNormal) {
        return; // 普通用户不显示提示
      }

      const items = await fetchPendingQuotes();
      if (items.length) notify(items);
    } catch (error) {
      console.log('tick执行失败:', error);
    }
  }

  /** 4) 启停控制 */
  function start(intervalMs = 5 * 60 * 1000) {
    stop();
    timer = window.setInterval(() => tick(), intervalMs) as unknown as number;
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  onUnmounted(stop);
  return { start, stop, tick };
}
