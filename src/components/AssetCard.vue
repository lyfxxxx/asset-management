<template>
  <el-card class="info-card" shadow="hover">
    <div class="info-card-content">
      <span class="info-card-label">{{ label }}</span>
      <span 
        class="info-card-value"
        :class="valueClass"
      >{{ formattedValue }}</span>
      <slot name="extra"></slot>
      <slot name="desc"></slot>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  isProfit: {
    type: Boolean,
    default: false
  },
  suffix: {
    type: String,
    default: ''
  }
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return `${props.value.toFixed(2)}${props.suffix}`
  }
  return `${props.value}${props.suffix}`
})

const valueClass = computed(() => {
  if (!props.isProfit) return {}
  return {
    'text-green-500': props.value < 0,
    'text-red-500': props.value > 0
  }
})
</script>

<style scoped>
.info-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.info-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.info-card-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-card-value {
  font-size: 1.25rem;
  line-height: 1.2;
  color: var(--color-text-primary);
}

:deep(.update-btn) {
  font-size: 0.75rem;
  margin-top: 2px;
}

:deep(.info-card-desc) {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .info-card-content {
    gap: 2px;
  }

  .info-card-label {
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .info-card-value {
    font-size: 1rem;
    line-height: 1.2;
  }
}
</style> 