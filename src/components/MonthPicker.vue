<template>
  <div class="month-picker-group">
    <el-button
      type="info"
      :disabled="!canGoPrevMonth"
      @click="handlePrevMonth"
    >
      <el-icon><ArrowLeft /></el-icon>
    </el-button>
    
    <el-date-picker
      v-model="selectedMonth"
      type="month"
      format="YYYY-MM"
      value-format="YYYY-MM"
      placeholder="选择月份"
      :disabled-date="disabledDate"
      @change="handleMonthChange"
      :clearable="false"
      class="month-picker"
    />
    
    <el-button
      type="info"
      :disabled="!canGoNextMonth"
      @click="handleNextMonth"
    >
      <el-icon><ArrowRight /></el-icon>
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  monthlyData: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedMonth = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentMonth = dayjs().format('YYYY-MM')

const disabledDate = (time) => {
  return dayjs(time).format('YYYY-MM') > currentMonth
}

const canGoPrevMonth = computed(() => {
  const sortedData = [...props.monthlyData].sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
  const firstMonth = sortedData[0]?.yearMonth
  return firstMonth && selectedMonth.value > firstMonth
})

const canGoNextMonth = computed(() => {
  return selectedMonth.value < currentMonth
})

const handlePrevMonth = () => {
  const prevMonth = dayjs(selectedMonth.value).subtract(1, 'month').format('YYYY-MM')
  selectedMonth.value = prevMonth
  emit('change', prevMonth)
}

const handleNextMonth = () => {
  const nextMonth = dayjs(selectedMonth.value).add(1, 'month').format('YYYY-MM')
  if (nextMonth <= currentMonth) {
    selectedMonth.value = nextMonth
    emit('change', nextMonth)
  }
}

const handleMonthChange = (value) => {
  emit('change', value)
}

defineOptions({
  components: {
    ArrowLeft,
    ArrowRight
  }
})
</script>

<style scoped>
.month-picker-group {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.month-picker {
  width: 200px;
  flex: 1;
}

:deep(.month-picker .el-input__wrapper) {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
}

:deep(.month-picker .el-input__wrapper:hover) {
  border-color: #cbd5e1;
}

:deep(.month-picker .el-input__wrapper.is-focus) {
  border-color: var(--color-primary);
}

.month-picker-group .el-button {
  padding: 8px;
  background-color: #ffffff;
  width: 32px;
  height: 32px;
  border-color: #e2e8f0;
  --el-button-text-color: var(--color-text-secondary);
  --el-button-hover-text-color: var(--color-primary);
}

.month-picker-group .el-button:disabled {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .month-picker {
    width: auto;
  }

  .month-picker-group .el-button {
    padding: 6px;
  }
}
</style> 