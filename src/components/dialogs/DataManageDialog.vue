<template>
  <el-dialog
    v-model="dialogVisible"
    title="数据管理"
    width="480px"
    class="data-manage-dialog"
  >
    <div class="data-manage-content">
      <div class="data-manage-section">
        <h3 class="section-title">导出数据</h3>
        <p class="section-desc">将当前所有资产数据导出为 JSON 文件备份</p>
        <el-button
          type="info"
          @click="handleExport"
          class="w-full"
        >
          导出数据
        </el-button>
      </div>
      <div class="data-manage-section">
        <h3 class="section-title">导入数据</h3>
        <p class="section-desc">从之前导出的 JSON 文件中恢复数据（会覆盖当前数据）</p>
        <el-button
          type="primary"
          @click="handleImportClick"
          class="w-full"
        >
          导入数据
        </el-button>
      </div>
      <input
        type="file"
        ref="fileInput"
        class="hidden"
        accept=".json"
        @change="handleImport"
      />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'export', 'import'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const fileInput = ref(null)

const handleExport = () => {
  emit('export')
}

const handleImportClick = () => {
  fileInput.value.click()
}

const handleImport = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  emit('import', file)
  event.target.value = ''
}
</script>

<style scoped>
.data-manage-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.data-manage-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.section-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .data-manage-content {
    gap: 24px;
  }

  .data-manage-section {
    gap: 12px;
  }

  .section-title {
    font-size: 14px;
  }

  .section-desc {
    font-size: 12px;
  }
}
</style> 