<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
      <BasicForm @register="registerForm" name="DwQuoteSuggestedPriceForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
    import {ref, computed, unref, reactive} from 'vue';
    import {BasicModal, useModalInner} from '/@/components/Modal';
    import {BasicForm, useForm} from '/@/components/Form/index';
    import {formSchema} from '../DwQuoteSuggestedPrice.data';
    import {saveOrUpdate} from '../DwQuoteSuggestedPrice.api';
    import { useMessage } from '/@/hooks/web/useMessage';
    import { getDateByPicker } from '/@/utils';
    const { createMessage } = useMessage();
    // Emits声明
    const emit = defineEmits(['register','success']);
    const isUpdate = ref(true);
    const isDetail = ref(false);
    //表单配置
    const [registerForm, { setProps,resetFields, setFieldsValue, validate, scrollToField }] = useForm({
        labelWidth: 150,
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: {span: 24}
    });
    //表单赋值
    const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
        //重置表单
        await resetFields();
        setModalProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
        isUpdate.value = !!data?.isUpdate;
        isDetail.value = !!data?.showFooter;
        if (unref(isUpdate)) {
            //表单赋值 - 处理空值，确保选择框可以正确清空
            const formData = {};
            if (data.record) {
                Object.keys(data.record).forEach(key => {
                    // 对于可能为空值的字段，确保传递 null 或 undefined 而不是空字符串
                    const value = data.record[key];
                    // 处理各种空值情况
                    if (value === '' || value === 'null' || value === 'undefined' || value === null || value === undefined) {
                        formData[key] = null;
                    } else {
                        formData[key] = value;
                    }
                });
            }
            await setFieldsValue(formData);
        }
        // 隐藏底部时禁用整个表单
       setProps({ disabled: !data?.showFooter })
    });
    //日期个性化选择
    const fieldPickers = reactive({
    });
    //设置标题
    const title = computed(() => (!unref(isUpdate) ? '新增' : !unref(isDetail) ? '详情' : '编辑'));
    //表单提交事件
    async function handleSubmit(v) {
        try {
            let values = await validate();
            // 预处理日期数据
            changeDateValue(values);
            
            // 确保数字类型字段的空值能正确提交
            if (values.suggestedPrice === '' || values.suggestedPrice === null || values.suggestedPrice === undefined) {
                values.suggestedPrice = 0;
            }
            if (values.suggestedBasis === '' || values.suggestedBasis === null || values.suggestedBasis === undefined) {
                values.suggestedBasis = 0;
            }
            
            setModalProps({confirmLoading: true});
            //提交表单
            await saveOrUpdate(values, isUpdate.value);
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
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