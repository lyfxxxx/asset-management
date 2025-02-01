<template>
  <el-dialog
    v-model="dialogVisible"
    title="更新现金收入"
    width="560px"
    class="income-dialog"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="income-form"
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
      <el-form-item label="现金收入" prop="income">
        <el-input v-model.number="form.income" type="number" />
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
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  initialData: {
    type: Object,
    default: () => ({
      yearMonth: dayjs().format('YYYY-MM'),
      income: 0
    })
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref(null)
const form = ref({ ...props.initialData })

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
  income: [
    { required: true, message: '请输入收入', trigger: 'blur' },
    { type: 'number', message: '收入必须为数字', trigger: 'blur' }
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
.income-form {
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
  .income-form {
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