<template>
  <div class="asset-manager">
    <!-- 标题区 -->
    <div class="header-section">
      <h1 class="page-title">投资管理助手</h1>
    </div>

    <div class="main-content">
      <!-- 左侧内容区：月度数据 -->
      <div class="left-section">
        <div class="monthly-section">
          <div class="chart-header">
            <h2 class="chart-title">资产总览</h2>
            <span class="chart-subtitle">展示选择月份的资产总览</span>
          </div>
          
          <!-- 月份选择区域 -->
          <div class="monthly-header">
            <MonthPicker
              v-model="selectedMonth"
              :monthly-data="store.monthlyData"
              @change="handleMonthChange"
            />
          </div>
          
          <div class="monthly-cards">
            <AssetCard
              label="总资产"
              :value="totalAmount"
            />

            <AssetCard
              label="现金收入"
              :value="income"
            >
              <template #extra>
                <el-button
                  type="primary"
                  link
                  @click="handleUpdateIncome"
                  class="update-btn"
                >
                  更新现金收入
                </el-button>
              </template>
            </AssetCard>

            <AssetCard
              label="本月收益率"
              :value="monthlyProfit.profitRate"
              :is-profit="true"
              suffix="%"
            >
              <template #desc>
                <span class="info-card-desc">相比上月</span>
              </template>
            </AssetCard>

            <AssetCard
              label="本月收益金额"
              :value="monthlyProfit.profitAmount"
              :is-profit="true"
            >
              <template #desc>
                <span class="info-card-desc">相比上月</span>
              </template>
            </AssetCard>
          </div>

          <!-- 资产表格区域 -->
          <div class="asset-table-section">
            <div class="table-header">
              <div class="action-group">
                <el-button
                  type="primary"
                  @click="handleAddAsset"
                >
                  添加资产
                </el-button>
                <el-button
                  type="info"
                  @click="handleDataManage"
                >
                  数据管理
                </el-button>
              </div>
            </div>
            
            <AssetList
              :asset-list="assetList"
              :is-mobile="isMobile"
              @edit="handleEditAsset"
              @delete="handleDeleteAsset"
            />
          </div>
        </div>

        <!-- 年度统计卡片 -->
        <div class="yearly-section">
          <div class="chart-header">
            <h2 class="chart-title">年度统计</h2>
            <span class="chart-subtitle">最近12个月</span>
          </div>
          <div class="yearly-cards">
            <AssetCard
              label="最近12个月收益率"
              :value="yearlyProfit.profitRate"
              :is-profit="true"
              suffix="%"
            >
              <template #desc>
                <span class="info-card-desc">{{ profitDateRange }}</span>
              </template>
            </AssetCard>

            <AssetCard
              label="最近12个月收益金额"
              :value="yearlyProfit.profitAmount"
              :is-profit="true"
            >
              <template #desc>
                <span class="info-card-desc">{{ profitDateRange }}</span>
              </template>
            </AssetCard>
          </div>
        </div>
      </div>

      <!-- 右侧内容区：图表 -->
      <div class="right-section">
        <AssetChart
          title="资产变化趋势"
          subtitle="最近12个月"
          :chart-data="assetChartOption"
        />

        <AssetChart
          title="月度收益趋势"
          subtitle="最近12个月"
          :chart-data="profitChartOption"
        />
      </div>
    </div>

    <!-- 弹窗组件 -->
    <AssetDialog
      v-model="assetDialogVisible"
      :is-edit="isEdit"
      :initial-data="assetForm"
      :assets="store.assets"
      @submit="handleAssetSubmit"
    />

    <IncomeDialog
      v-model="incomeDialogVisible"
      :initial-data="incomeForm"
      @submit="handleIncomeSubmit"
    />

    <DataManageDialog
      v-model="dataManageVisible"
      @export="handleExportData"
      @import="handleImportData"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useAssetStore } from '../stores/asset'
import dayjs from 'dayjs'
import { useAssetManager } from '../composables/useAssetManager'
import { useChartOptions } from '../composables/useChartOptions'

// 导入组件
import MonthPicker from './MonthPicker.vue'
import AssetCard from './AssetCard.vue'
import AssetList from './AssetTable/AssetList.vue'
import AssetChart from './AssetChart.vue'
import AssetDialog from './dialogs/AssetDialog.vue'
import IncomeDialog from './dialogs/IncomeDialog.vue'
import DataManageDialog from './dialogs/DataManageDialog.vue'

// 使用 composables
const store = useAssetStore()
const {
  selectedMonth,
  assetList,
  totalAmount,
  income,
  monthlyProfit,
  yearlyProfit,
  profitDateRange,
  handleMonthChange,
  handleAssetSubmit,
  handleDeleteAsset,
  handleIncomeSubmit,
  handleExportData,
  handleImportData
} = useAssetManager()

const { assetChartOption, profitChartOption, updateChartOptions } = useChartOptions()

// 移动端适配
const isMobile = ref(window.innerWidth < 768)
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

// 弹窗状态
const assetDialogVisible = ref(false)
const incomeDialogVisible = ref(false)
const dataManageVisible = ref(false)
const isEdit = ref(false)
const assetForm = ref({
  yearMonth: dayjs().format('YYYY-MM'),
  code: '',
  name: '',
  amount: 0,
  targetRatio: 0
})
const incomeForm = ref({
  yearMonth: dayjs().format('YYYY-MM'),
  income: 0
})

// 事件处理方法
const handleAddAsset = () => {
  isEdit.value = false
  assetForm.value = {
    yearMonth: selectedMonth.value,
    code: '',
    name: '',
    amount: 0,
    targetRatio: 0
  }
  assetDialogVisible.value = true
}

const handleEditAsset = (row) => {
  isEdit.value = true
  assetForm.value = {
    ...row,
    yearMonth: selectedMonth.value
  }
  assetDialogVisible.value = true
}

const handleUpdateIncome = () => {
  incomeForm.value = {
    yearMonth: selectedMonth.value,
    income: income.value
  }
  incomeDialogVisible.value = true
}

const handleDataManage = () => {
  dataManageVisible.value = true
}

// 生命周期钩子
window.addEventListener('resize', handleResize)

watch(() => store.monthlyData, () => {
  updateChartOptions(store.recentYearData, store.monthlyProfitTrend)
}, { deep: true })

onMounted(async () => {
  await store.initialize()
  updateChartOptions(store.recentYearData, store.monthlyProfitTrend)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.asset-manager {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 32px;
  gap: 32px;
  background-color: #f8fafc;
  overflow: hidden;
}

.header-section {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 32px;
  min-height: 0;
  overflow: auto;
}

.left-section {
  width: 50%;
  min-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-section {
  width: 50%;
  min-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.monthly-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.monthly-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.monthly-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.yearly-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.yearly-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.asset-table-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.action-group {
  display: flex;
  gap: 8px;
}

.chart-header {
  margin-bottom: 16px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-subtitle {
  font-size: 14px;
  color: #64748b;
}

@media (max-width: 1440px) {
  .main-content {
    flex-direction: column;
  }

  .left-section,
  .right-section {
    width: 100%;
    min-width: 0;
  }

  .monthly-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 24px;
  }
}

/* 平板横屏布局 */
@media (min-width: 1024px) and (orientation: landscape) {
  .main-content {
    flex-direction: row;
  }

  .left-section,
  .right-section {
    width: 50%;
    min-width: 0;
  }

  .monthly-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .asset-manager {
    padding: 16px;
    gap: 16px;
  }

  .monthly-section {
    padding: 16px;
  }

  .monthly-cards {
    gap: 16px;
    margin-bottom: 20px;
  }

  .main-content {
    gap: 16px;
  }

  .left-section,
  .right-section {
    gap: 16px;
  }

  .monthly-header {
    padding: 12px 0;
  }

  .table-header {
    padding-top: 12px;
  }

  .action-group {
    gap: 8px;
  }

  .table-header .el-button {
    padding: 8px 12px;
  }
}
</style> 