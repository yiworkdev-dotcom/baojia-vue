<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="600" @ok="handleSubmit">
      <BasicForm @register="registerForm" name="DwUserQuoteAuditForm" />
    </BasicModal>
  </template>
  
  <script lang="ts" setup>
    import {ref, computed, unref, reactive, nextTick} from "vue";
    import {BasicModal, useModalInner} from "/@/components/Modal";
    import {BasicForm, useForm} from "/@/components/Form/index";
    import {saveOrUpdate} from "../DwUserQuote.api";
    import { useMessage } from "/@/hooks/web/useMessage";
    import { getDateByPicker } from "/@/utils";
    
    const { createMessage } = useMessage();
    // Emits声明
    const emit = defineEmits(["register","success"]);
    const isAudit = ref(false);
    
    // 审核表单配置
    const auditFormSchema = [
      {
        label: "ID",
        field: "id",
        component: "Input",
        show: false
      },
      {
        label: "报价状态",
        field: "status",
        component: "JDictSelectTag",
        componentProps: {
          dictCode: "quote_status",
          placeholder: "请选择报价状态",
          allowClear: true,
          type: "select"
        },
        dynamicRules: ({model,schema}) => {
          return [
            { required: true, message: "请选择报价状态!"},
          ];
        },
      },
      {
        label: "审核备注",
        field: "remark",
        component: "InputTextArea",
        componentProps: {
          rows: 4,
          placeholder: "请输入审核备注"
        },
        dynamicRules: ({model,schema}) => {
          return [
            { required: true, message: "请输入审核备注!"},
          ];
        },
      }
    ];
    
    //表单配置
    const [registerForm, { setProps,resetFields, setFieldsValue, validate, scrollToField, updateSchema }] = useForm({
      labelWidth: 120,
      schemas: auditFormSchema,
      showActionButtonGroup: false,
      baseColProps: {span: 24}
    });
    
    //表单赋值
    const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
      //重置表单
      await resetFields();
      setModalProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
      isAudit.value = !!data?.isAudit;
      
      if (unref(isAudit)) {
        console.log("审核数据:", data.record);
        
        // 使用 nextTick 确保组件已渲染
        await nextTick();
        
        // 设置表单值
        await setFieldsValue({
          ...data.record,
        });
        
        // 再次使用 nextTick 确保字典组件已加载
        await nextTick();
        
        // 强制更新状态字段
        if (data.record.status !== undefined) {
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
    const title = computed(() => "审核");
    
    //表单提交事件
    async function handleSubmit(v) {
      try {
        let values = await validate();
        console.log("提交的审核数据:", values);
        // 预处理日期数据
        changeDateValue(values);
        setModalProps({confirmLoading: true});
        //提交表单
        await saveOrUpdate(values, true);
        //关闭弹窗
        closeModal();
        //刷新列表
        emit("success");
        createMessage.success("审核成功");
      } catch ({ errorFields }) {
         if (errorFields) {
           const firstField = errorFields[0];
           if (firstField) {
             scrollToField(firstField.name, { behavior: "smooth", block: "center" });
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
