import {defHttp} from "/@/utils/http/axios";
import { useMessage } from "/@/hooks/web/useMessage";

const { createConfirm } = useMessage();

enum Api {
  list = '/dw/partner/dwPtPartner/rootList',
  save='/dw/partner/dwPtPartner/add',
  edit='/dw/partner/dwPtPartner/edit',
  deleteDwPtPartner = '/dw/partner/dwPtPartner/delete',
  importExcel = '/dw/partner/dwPtPartner/importExcel',
  exportXls = '/dw/partner/dwPtPartner/exportXls',
  loadTreeData = '/dw/partner/dwPtPartner/loadTreeRoot',
  getChildList = '/dw/partner/dwPtPartner/childList',
  getChildListBatch = '/dw/partner/dwPtPartner/getChildListBatch',
  getUserSubordinateList = '/dw/partner/dwPtPartner/myDescendantUserIds',
  getUserTree = '/sys/user/admin/tree',
}

export const getUserSubordinateList = () => defHttp.get({ url: Api.getUserSubordinateList });
/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 * @param params
 */
export const getImportUrl = Api.importExcel;
/**
 * 列表接口
 * @param params
 */
export const list = (params) =>
  defHttp.get({url: Api.list, params});
/**
 * 删除
 */
export const deleteDwPtPartner = (params,handleSuccess) => {
  return defHttp.delete({url: Api.deleteDwPtPartner, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
}
/**
 * 批量删除
 * @param params
 */
export const batchDeleteDwPtPartner = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({url: Api.deleteDwPtPartner, data: params}, {joinParamsToUrl: true}).then(() => {
        handleSuccess();
      });
    }
  });
}
/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdateDict = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({url: url, params});
}
/**
 * 查询全部树形节点数据
 * @param params
 */
export const loadTreeData = (params) =>
  defHttp.get({url: Api.loadTreeData,params});
/**
 * 查询子节点数据
 * @param params
 */
export const getChildList = (params) =>
  defHttp.get({url: Api.getChildList, params});
/**
 * 批量查询子节点数据
 * @param params
 */
export const getChildListBatch = (params) =>
  defHttp.get({url: Api.getChildListBatch, params},{isTransformResponse:false});
/**
 * 获取用户树形数据
 */
export const getUserTree = () =>
  defHttp.get({url: Api.getUserTree}, {isTransformResponse: false});
