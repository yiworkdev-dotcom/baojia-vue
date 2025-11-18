
import {defHttp} from '/@/utils/http/axios';

enum Api {
  listAll = '/dw/product/xian/dwMainProduct/listAll',
}

/**
 * 获取所有产品列表（用于价格曲线）
 * @param params
 */
export const listAll = () =>
  defHttp.get({url: Api.listAll});