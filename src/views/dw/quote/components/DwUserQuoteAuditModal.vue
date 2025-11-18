<template>
    <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="600" @ok="handleSubmit">
        <BasicForm @register="registerForm" name="DwUserQuoteAuditForm" />
      </BasicModal>
    </template>
    
    <script lang="ts" setup>
      import {ref, computed, unref, reactive, nextTick} from 'vue';
      import {BasicModal, useModalInner} from '/@/components/Modal';
      import {BasicForm, useForm} from '/@/components/Form/index';
      import {review} from '../DwUserQuote.api';
      import { useMessage } from '/@/hooks/web/useMessage';
      import { getDateByPicker } from '/@/utils';
      
      const { createMessage } = useMessage();
      // Emits声明
      const emit = defineEmits(['register','success']);
      const isAudit = ref(false);
      const auditType = ref(''); // 新增：审核类型 'approve' | 'reject'
      
      // 审核通过表单配置
      const approveFormSchema = [
        {
          label: 'ID',
          field: 'id',
          component: 'Input' as const,
          show: false
        },
        {
          label: '报价状态',
          field: 'status',
          component: 'JDictSelectTag' as const,
          componentProps: {
            dictCode: "quote_status",
            placeholder: "请选择报价状态",
            allowClear: true,
            type: 'input'
          },
          show: false,
          dynamicRules: () => {
            return [
              { required: true, message: '请选择报价状态!'},
            ];
          },
        },
        {
          label: '审核不通过备注',
          field: 'remark',
          component: 'InputTextArea' as const,
          componentProps: {
            rows: 4,
            placeholder: '请输入审核备注'
          },
        }
      ];
      
      // 审核不通过表单配置（不包含报价状态字段）
      const rejectFormSchema = [
        {
          label: 'ID',
          field: 'id',
          component: 'Input' as const,
          show: false
        },
        {
          label: '审核备注',
          field: 'remark',
          component: 'InputTextArea' as const,
          componentProps: {
            rows: 4,
            placeholder: '请输入审核备注'
          },
        }
      ];
      
      // 当前表单配置
      const currentFormSchema = ref(approveFormSchema);
      
      //表单配置
      const [registerForm, { setProps,resetFields, setFieldsValue, validate, scrollToField, updateSchema }] = useForm({
        labelWidth: 120,
        schemas: currentFormSchema.value,
        showActionButtonGroup: false,
        baseColProps: {span: 24}
      });
      
      //表单赋值
      const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
        //重置表单
        await resetFields();
        setModalProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
        isAudit.value = !!data?.isAudit;
        auditType.value = data?.auditType || 'approve'; // 设置审核类型，默认为通过
        
        if (unref(isAudit)) {
          console.log('审核数据:', data.record);
          
          // 根据审核类型设置表单配置
          if (auditType.value === 'reject') {
            currentFormSchema.value = rejectFormSchema;
          } else {
            currentFormSchema.value = approveFormSchema;
          }
          
          // 更新表单配置
          await updateSchema(currentFormSchema.value);
          
          // 使用 nextTick 确保组件已渲染
          await nextTick();
          
          // 设置表单值
          const formData = {
            ...data.record,
          };
          
          // 如果是审核不通过，预填状态为4
          if (auditType.value === 'reject') {
            formData.status = 4;
          }
          
          await setFieldsValue(formData);
          
          // 再次使用 nextTick 确保字典组件已加载
          await nextTick();
          
          // 强制更新状态字段（仅在审核通过时）
          if (auditType.value === 'approve' && data.record.status !== undefined) {
            await setFieldsValue({
              status: data.record.status
            });
          }
        }
      });
      
      //日期个性化选择
      const fieldPickers = reactive({
      });
      
      //设置标题
      const title = computed(() => {
        if (auditType.value === 'reject') {
          return '审核不通过';
        }
        return '审核';
      });
      
      //表单提交事件
      async function handleSubmit(v) {
        try {
          let values = await validate();
          
          // 如果是审核不通过，确保状态为4
          if (auditType.value === 'reject') {
            values.status = 4;
          } else {
            values.status = parseInt(values.status);
          }
          
          console.log('提交的审核数据:', values);
          // 预处理日期数据
          changeDateValue(values);
          setModalProps({confirmLoading: true});
          //提交表单
          await review(values);
          //关闭弹窗
          closeModal();
          //刷新列表
          emit('success');
        } catch (error: any) {
           // 处理表单验证错误
           if (error?.errorFields) {
             const firstField = error.errorFields[0];
             if (firstField) {
               scrollToField(firstField.name, { behavior: 'smooth' });
             }
           }
           // 处理其他错误
           else if (error?.message) {
             createMessage.error(error.message);
           } else {
             createMessage.error('提交失败，请重试');
           }
           return Promise.reject(error);
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