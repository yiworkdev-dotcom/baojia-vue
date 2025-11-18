<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
    <BasicForm @register="registerForm" name="DwProductQuoteRtForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from '../DwProductQuoteRt.data';
  import { saveOrUpdate as saveOrUpdateRt } from '../DwProductQuoteRt.api';
  import { saveOrUpdate as saveOrUpdateHist } from '../../hist/DwProductQuoteHist.api';
  import { getDateByPicker } from '/@/utils';
  import dayjs from 'dayjs';
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const isDetail = ref(false);
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, scrollToField }] = useForm({
    labelWidth: 150,
    schemas: formSchema,
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
  const title = computed(() => (!unref(isUpdate) ? '新增' : !unref(isDetail) ? '详情' : '编辑'));
  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      // 预处理日期数据
      changeDateValue(values);
      setModalProps({ confirmLoading: true });
      //提交当前报价
      await saveOrUpdateRt(values, isUpdate.value);
      // 同步新增历史报价（使用当前时间）
      try {
        const nowStr = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const histPayload: any = {
          productId: values.productId,
          bidPrice: values.bidPrice,
          askPrice: values.askPrice,
          lastPrice: values.lastPrice,
          provider: values.provider,
          updateTime: nowStr,
        };
        await saveOrUpdateHist(histPayload, false);
      } catch (e) {
        // 历史报价写入失败不阻断主流程
      }
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } catch (err: any) {
      if (err?.errorFields) {
        const firstField = err.errorFields[0];
        if (firstField) {
          scrollToField(firstField.name);
        }
      }
      return Promise.reject(err?.errorFields ?? err);
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
