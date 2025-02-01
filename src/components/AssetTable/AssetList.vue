<template>
  <div class="asset-list">
    <!-- PC端表格 -->
    <el-table 
      :data="assetList" 
      class="asset-table"
      v-if="!isMobile"
    >
      <el-table-column prop="code" label="资产代码" />
      <el-table-column prop="name" label="资产名称" />
      <el-table-column prop="amount" label="当前金额">
        <template #default="{ row }">
          {{ row.amount.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="targetAmount" label="目标金额">
        <template #default="{ row }">
          {{ row.targetAmount.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="targetRatio" label="目标占比">
        <template #default="{ row }">
          {{ row.targetRatio }}%
        </template>
      </el-table-column>
      <el-table-column prop="difference" label="差异">
        <template #default="{ row }">
          <span :class="{ 'font-bold': row.difference < 0 }">
            {{ row.difference.toFixed(2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <div class="flex gap-4">
            <el-button
              type="primary"
              link
              @click="$emit('edit', row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="$emit('delete', row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动端卡片列表 -->
    <div class="asset-cards" v-else>
      <div
        v-for="asset in assetList"
        :key="asset.code"
        class="asset-card"
      >
        <div class="asset-card-header">
          <div class="asset-card-title">
            <span class="asset-name">{{ asset.name }}</span>
            <span class="asset-code">{{ asset.code }}</span>
          </div>
          <div class="asset-amount">{{ asset.amount.toFixed(2) }}</div>
        </div>
        
        <div class="asset-card-content">
          <div class="asset-info-item">
            <span class="info-label">目标金额</span>
            <span class="info-value">{{ asset.targetAmount.toFixed(2) }}</span>
          </div>
          <div class="asset-info-item">
            <span class="info-label">目标占比</span>
            <span class="info-value">{{ asset.targetRatio }}%</span>
          </div>
          <div class="asset-info-item">
            <span class="info-label">差异</span>
            <span class="info-value" :class="{ 'font-bold': asset.difference < 0 }">
              {{ asset.difference.toFixed(2) }}
            </span>
          </div>
        </div>

        <div class="asset-card-footer">
          <el-button
            type="primary"
            link
            @click="$emit('edit', asset)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            @click="$emit('delete', asset)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  assetList: {
    type: Array,
    required: true
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete'])
</script>

<style scoped>
.asset-table {
  overflow: auto;
}

:deep(.el-table__inner-wrapper) {
  height: 100%;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

.asset-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.asset-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
}

.asset-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.asset-card-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.asset-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.asset-code {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.asset-amount {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.asset-card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.asset-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.asset-card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .asset-card-footer {
    padding-top: 8px;
    gap: 8px;
  }

  .asset-card-footer .el-button {
    font-size: 0.875rem;
    padding: 4px 8px;
  }
}
</style> 