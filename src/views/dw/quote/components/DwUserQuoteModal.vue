<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
      <BasicForm @register="registerForm" name="DwUserQuoteForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
    import {ref, computed, unref, reactive, nextTick} from 'vue';
    import {BasicModal, useModalInner} from '/@/components/Modal';
    import {BasicForm, useForm} from '/@/components/Form/index';
    import {formSchema} from '../DwUserQuote.data';
    import {saveOrUpdate} from '../DwUserQuote.api';
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
            // 等待DOM更新完成
            await nextTick();
            
            // 添加延迟确保字典组件完全加载
            await new Promise(resolve => setTimeout(resolve, 100));
            
            //表单赋值
            await setFieldsValue({
                ...data.record,
            });
            
            // 再次等待确保值设置完成
            await nextTick();
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
            setModalProps({confirmLoading: true});
            //提交表单
            await saveOrUpdate(values, isUpdate.value);
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
        } catch (error) {
           // 检查是否是表单验证错误
           if (error && error.errorFields && Array.isArray(error.errorFields)) {
             const firstField = error.errorFields[0];
             if (firstField) {
               scrollToField(firstField.name, { behavior: 'smooth', block: 'center' });
             }
           } else {
             // 其他类型的错误，显示错误消息
             console.error('表单提交失败:', error);
             createMessage.error('操作失败，请重试');
           }
           // 不要返回 Promise.reject，让错误自然传播
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