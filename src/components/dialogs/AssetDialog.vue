<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑资产' : '添加资产'"
    width="560px"
    class="asset-dialog"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="asset-form"
    >
      <el-form-item label="月份" prop="yearMonth">
        <el-date-picker
          v-model="form.yearMonth"
          type="month"
          format="YYYY-MM"
          value-format="YYYY-MM"
          placeholder="选择月份"
          :disabled-date="disabledDate"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="资产代码" prop="code">
        <el-input v-model="form.code" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="资产名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="当前金额" prop="amount">
        <el-input v-model.number="form.amount" type="number" />
      </el-form-item>
      <el-form-item label="目标占比" prop="targetRatio">
        <el-input v-model.number="form.targetRatio" type="number">
          <template #append>%</template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  initialData: {
    type: Object,
    default: () => ({
      yearMonth: dayjs().format('YYYY-MM'),
      code: '',
      name: '',
      amount: 0,
      targetRatio: 0
    })
  },
  assets: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref(null)
const form = ref({ ...props.initialData })

// 监听弹窗打开和初始数据变化
watch(
  [() => props.modelValue, () => props.initialData],
  ([visible, initialData]) => {
    if (visible) {
      form.value = { ...initialData }
    }
  },
  { immediate: true }
)

const currentMonth = dayjs().format('YYYY-MM')
const disabledDate = (time) => {
  return dayjs(time).format('YYYY-MM') > currentMonth
}

const validateMonth = (rule, value, callback) => {
  if (value > currentMonth) {
    callback(new Error('不能选择未来月份'))
  } else {
    callback()
  }
}

const rules = {
  yearMonth: [
    { required: true, message: '请选择月份', trigger: 'change' },
    { validator: validateMonth, trigger: 'change' }
  ],
  code: [
    { required: true, message: '请输入资产代码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (props.isEdit) {
          callback()
          return
        }
        const exists = props.assets.some(asset => asset.code === value)
        if (exists) {
          callback(new Error('资产代码已存在'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  name: [
    { required: true, message: '请输入资产名称', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入当前金额', trigger: 'blur' },
    { type: 'number', message: '金额必须为数字', trigger: 'blur' }
  ],
  targetRatio: [
    { required: true, message: '请输入目标占比', trigger: 'blur' },
    { type: 'number', message: '占比必须为数字', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        const totalRatio = props.assets.reduce((sum, asset) => {
          return sum + (asset.code === form.value.code ? 0 : asset.targetRatio)
        }, 0)
        if (totalRatio + value > 100) {
          callback(new Error('总占比不能超过100%'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      emit('submit', { ...form.value })
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.asset-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .asset-form {
    gap: 16px;
  }

  .dialog-footer {
    gap: 8px;
  }

  .dialog-footer .el-button {
    flex: 1;
  }
}
</style> 