<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
    <BasicForm @register="registerForm" name="DwProductOrderForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from '../DwProductOrder.data';
  import { saveOrUpdate } from '../DwProductOrder.api';
  import { getDateByPicker } from '/@/utils';
  // const { createMessage } = useMessage();
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const isDetail = ref(false);
  const isAudit = ref(false);
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, scrollToField }] = useForm({
    labelWidth: 150,
    schemas: isAudit.value ? getAuditSchema() : formSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
    isUpdate.value = !!data?.isUpdate;
    isDetail.value = !!data?.showFooter;
    isAudit.value = !!data?.isAudit;

    // 如果是审核模式，重新设置表单schema
    if (isAudit.value) {
      setProps({ schemas: getAuditSchema() });
    }

    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter });
  });
  //日期个性化选择
  const fieldPickers = reactive({});
  //设置标题
  const title = computed(() => {
    if (isAudit.value) return '审核';
    if (!unref(isUpdate)) return '新增';
    if (!unref(isDetail)) return '详情';
    return '编辑';
  });
  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      // 预处理日期数据
      changeDateValue(values);
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdate(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } catch (error: any) {
      if (error?.errorFields) {
        const firstField = error.errorFields[0];
        if (firstField) {
          scrollToField(firstField.name, { behavior: 'smooth' });
        }
      }
      return Promise.reject(error);
    } finally {
      setModalProps({ confirmLoading: false });
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

  /**
   * 获取审核模式的表单schema
   */
  function getAuditSchema() {
    return formSchema.filter((item) => item.field === 'status' || item.field === 'remark' || item.field === 'id');
  }
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
