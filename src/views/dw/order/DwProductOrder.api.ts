import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";

const { createConfirm } = useMessage();

enum Api {
  list = '/dw/order/dwProductOrder/list',
  save='/dw/order/dwProductOrder/add',
  edit='/dw/order/dwProductOrder/edit',
  deleteOne = '/dw/order/dwProductOrder/delete',
  deleteBatch = '/dw/order/dwProductOrder/deleteBatch',
  importExcel = '/dw/order/dwProductOrder/importExcel',
  exportXls = '/dw/order/dwProductOrder/exportXls',
  stats = '/dw/order/dwProductOrder/stats',
  getUserRoles = '/sys/role/getUserRoles',
  getFrozenQtyByUserId = '/dw/order/dwProductOrder/frozen/qty/byUserId',
  getPositionCarNumByUserId = '/dw/order/dwProductOrder/positionCarNum/qty/byUserId',
}
/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 列表接口
 * @param params
 */
export const list = (params) =>
  defHttp.get({url: Api.list, params});

/**
 * 获取统计数据
 * @param params
 */
export const getStats = (params) =>
  defHttp.get({url: Api.stats, params});

/**
 * 删除单个
 */
export const deleteOne = (params,handleSuccess) => {
  return defHttp.delete({url: Api.deleteOne, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
}
/**
 * 批量删除
 * @param params
 */
export const batchDelete = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({url: Api.deleteBatch, data: params}, {joinParamsToUrl: true}).then(() => {
        handleSuccess();
      });
    }
  });
}
/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({url: url, params});
}

/**
 * 获取用户角色
 * @param params
 */
export const getUserRoles = () =>
  defHttp.get({url: Api.getUserRoles}, { errorMessageMode: 'none' });

/**
 * 根据用户ID获取冻结数量
 * @param userId 用户ID
 */
export const getFrozenQtyByUserId = (userId: string) =>
  defHttp.get({url: Api.getFrozenQtyByUserId, params: { userId }});

/**
 * 根据用户ID获取持仓车数
 * @param userId 用户ID
 */
export const getPositionCarNumByUserId = (userId: string) =>
  defHttp.get({url: Api.getPositionCarNumByUserId, params: { userId }});
