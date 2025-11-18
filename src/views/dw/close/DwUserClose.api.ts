import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";

const { createConfirm } = useMessage();

enum Api {
  list = '/dw/close/dwUserClose/list',
  save='/dw/close/dwUserClose/add',
  edit='/dw/close/dwUserClose/edit',
  deleteOne = '/dw/close/dwUserClose/delete',
  deleteBatch = '/dw/close/dwUserClose/deleteBatch',
  importExcel = '/dw/close/dwUserClose/importExcel',
  exportXls = '/dw/close/dwUserClose/exportXls',
  review = '/dw/close/dwUserClose/review',
  getUserRoles = '/sys/role/getUserRoles',
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
 * 审核提交
 * @param params
 */
export const review = (params) =>
  defHttp.put({url: Api.review, params});