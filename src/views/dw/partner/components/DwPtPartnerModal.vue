<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :width="800" :height="350" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" name="DwPtPartnerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import {ref, computed, unref, reactive} from 'vue';
  import {BasicModal, useModalInner} from '/@/components/Modal';
  import {BasicForm, useForm} from '/@/components/Form';
  import {formSchema} from '../DwPtPartner.data';
  import {loadTreeData, saveOrUpdateDict} from '../DwPtPartner.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getDateByPicker } from '/@/utils';
  //日期个性化选择
  const fieldPickers = reactive({
  });
  const { createMessage } = useMessage();
  // 获取emit
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const isDetail = ref(false);
  const isAddSub = ref(false); // 添加标识
  const expandedRowKeys = ref([]);
  const treeData = ref([]);
  // 当前编辑的数据
  let model:Nullable<Recordable> = null;
  //表单配置
  const [registerForm, { setProps,resetFields, setFieldsValue, validate, updateSchema, scrollToField }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: {span: 24},
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  });
  //表单赋值
  const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    expandedRowKeys.value = [];
    setModalProps({confirmLoading: false, minHeight: 80 ,showOkBtn: !!!data?.hideFooter});
    isUpdate.value = !!data?.isUpdate;
    isDetail.value = !!data?.showFooter;
    isAddSub.value = !!data?.isAddSub; // 设置添加下级标识
    
    // 添加调试信息
    console.log('Modal接收到的数据:', data);
    console.log('是否为添加下级操作:', isAddSub.value);
    
    if (data?.record) {
      model = data.record;
      console.log('当前记录数据:', data.record);
      console.log('当前记录的userId:', data.record.userId);
      
      // 如果是编辑或详情操作，才填充所有字段
      if (isUpdate.value || isDetail.value) {
        //表单赋值
        await setFieldsValue({
          ...data.record,
        });
      }
    } else {
      model = null;
    }
    
    // 如果是添加下级操作，隐藏直接推荐人字段并设置父级
    if (isAddSub.value && data?.record) {
      console.log('执行添加下级逻辑');
      // 隐藏直接推荐人字段
      await updateSchema([
        {
          field: 'parent',
          show: false,
        }
      ]);
      // 设置父级ID为当前记录的id，parent为当前记录的userId
      const pidValue = data.record.id;
      const parentValue = data.record.userId; // 添加parent字段，来源于当前记录的userId
      console.log('设置pid为:', pidValue);
      console.log('设置parent为:', parentValue);
      
      await setFieldsValue({
        pid: pidValue, // 设置父级ID用于树形结构
        parent: parentValue // 设置直接推荐人为当前记录的userId
      });
    } else {
      // 恢复直接推荐人字段的显示
      await updateSchema([
        {
          field: 'parent',
          show: true,
        }
      ]);
    }
    
    //父级节点树信息
    treeData.value = await loadTreeData({'async': false,'pcode':''});
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !!data?.hideFooter })
  });
  //设置标题
  const getTitle = computed(() => {
    if (isAddSub.value) {
      return '添加下级合伙人';
    }
    return (!unref(isUpdate) ? '新增' : !unref(isDetail) ? '详情' : '编辑');
  });

  /**
   * 根据pid获取展开的节点
   * @param pid
   * @param arr
   */
  function getExpandKeysByPid(pid,arr){
    if(pid && arr && arr.length>0){
      for(let i=0;i<arr.length;i++){
        if(arr[i].key==pid && unref(expandedRowKeys).indexOf(pid)<0){
          expandedRowKeys.value.push(arr[i].key);
          getExpandKeysByPid(arr[i]['parentId'],unref(treeData))
        }else{
          getExpandKeysByPid(pid,arr[i].children)
        }
      }
    }
  }
  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      // 预处理日期数据
      changeDateValue(values);
      setModalProps({confirmLoading: true});
      //提交表单
      await saveOrUpdateDict(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //展开的节点信息
      await getExpandKeysByPid(values['pid'],unref(treeData))
      //刷新列表(isUpdate:是否编辑;values:表单信息;expandedArr:展开的节点信息)
      emit('success', {
        isUpdate: unref(isUpdate),
        values: {...values},
        expandedArr: unref(expandedRowKeys).reverse(),
        // 是否更改了父级节点
        changeParent: model != null && (model['pid'] != values['pid']),
      });
    } catch ({ errorFields }) {
      if (errorFields) {
        const firstField = errorFields[0];
        if (firstField) {
          scrollToField(firstField.name, { behavior: 'smooth', block: 'center' });
        }
      }
      return Promise.reject(errorFields);
    } finally {
      setModalProps({confirmLoading: false});
    }
  }

  /**
   * 处理日期值
   * @param formData 表单数据
   */
  const changeDateValue = (formData) => {
      if (formData && fieldPickers) {
          for (let key in fieldPickers) {
              if (formData[key]) {
                  formData[key] = getDateByPicker(formData[key], fieldPickers[key]);
              }
          }
      }
  };

</script>
<style lang="less" scoped>
	/** 时间和数字输入框样式 */
  :deep(.ant-input-number) {
    width: 100%;
  }

  :deep(.ant-calendar-picker) {
    width: 100%;
  }
</style>