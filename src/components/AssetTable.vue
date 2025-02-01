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
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { db } from '../db'

// 导入组件
import MonthPicker from './MonthPicker.vue'
import AssetCard from './AssetCard.vue'
import AssetList from './AssetTable/AssetList.vue'
import AssetChart from './AssetChart.vue'
import AssetDialog from './dialogs/AssetDialog.vue'
import IncomeDialog from './dialogs/IncomeDialog.vue'
import DataManageDialog from './dialogs/DataManageDialog.vue'

const store = useAssetStore()
const assetList = computed(() => store.assetList)
const totalAmount = computed(() => store.totalAmount)
const income = computed(() => store.income)
const selectedMonth = ref(dayjs().format('YYYY-MM'))

// 资产弹窗相关
const assetDialogVisible = ref(false)
const isEdit = ref(false)
const assetForm = ref({
  yearMonth: dayjs().format('YYYY-MM'),
  code: '',
  name: '',
  amount: 0,
  targetRatio: 0
})

// 收入弹窗相关
const incomeDialogVisible = ref(false)
const incomeForm = ref({
  yearMonth: dayjs().format('YYYY-MM'),
  income: 0
})

// 数据管理弹窗相关
const dataManageVisible = ref(false)

// 计算当月收益率（年化）和收益金额
const monthlyProfit = computed(() => {
  return store.monthlyProfit(selectedMonth.value)
})

// 添加年度收益计算
const yearlyProfit = computed(() => store.yearlyProfit)

// 添加收益日期范围计算
const profitDateRange = computed(() => {
  const endDate = dayjs()
  const startDate = endDate.subtract(11, 'month')
  return `${startDate.format('YYYY.MM')}-${endDate.format('YYYY.MM')}`
})

// 添加移动端判断
const isMobile = ref(window.innerWidth < 640)

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth < 640
}

window.addEventListener('resize', handleResize)

// 监听数据变化
watch(() => store.monthlyData, () => {
  updateChartOptions()
}, { deep: true })

onMounted(() => {
  updateChartOptions()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleMonthChange = (value) => {
  store.setCurrentYearMonth(value)
}

const handleUpdateIncome = () => {
  incomeForm.value = {
    yearMonth: selectedMonth.value,
    income: store.income
  }
  incomeDialogVisible.value = true
}

const handleIncomeSubmit = async (data) => {
  await store.updateMonthlyIncome(data.yearMonth, data.income)
  ElMessage.success('更新成功')

  if (data.yearMonth === selectedMonth.value) {
    store.setCurrentYearMonth(data.yearMonth)
  }
}

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

const handleDeleteAsset = (row) => {
  ElMessageBox.confirm(
    '确定要删除该资产吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    await db.assets.delete(row.code)
    const updatedMonthlyData = store.monthlyData.map(monthData => {
      const filteredAssets = monthData.assets.filter(asset => asset.code !== row.code)
      return {
        ...monthData,
        assets: JSON.stringify(filteredAssets)
      }
    })
    
    await Promise.all(updatedMonthlyData.map(data => db.monthlyData.put(data)))
    store.monthlyData = updatedMonthlyData.map(data => ({
      ...data,
      assets: JSON.parse(data.assets)
    }))
    store.assets = store.assets.filter(asset => asset.code !== row.code)
    
    ElMessage.success('删除成功')
  })
}

const handleAssetSubmit = async (data) => {
  const { yearMonth, ...assetData } = data
  if (isEdit.value) {
    await store.updateMonthlyAsset(yearMonth, assetData)
    ElMessage.success('更新成功')
  } else {
    const now = new Date()
    const newAsset = {
      ...assetData,
      createdAt: now,
      updatedAt: now
    }
    await db.assets.add(newAsset)
    await store.updateMonthlyAsset(yearMonth, newAsset)
    ElMessage.success('添加成功')
  }

  if (yearMonth === selectedMonth.value) {
    store.setCurrentYearMonth(yearMonth)
  }
}

const handleDataManage = () => {
  dataManageVisible.value = true
}

const handleExportData = async () => {
  try {
    const assets = await db.assets.toArray()
    const monthlyData = await db.monthlyData.toArray()
    
    const exportData = {
      assets,
      monthlyData,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `asset-manage-backup-${dayjs().format('YYYY-MM-DD')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败')
  }
}

const handleImportData = async (file) => {
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (!data.assets || !data.monthlyData) {
          throw new Error('无效的数据格式')
        }

        await db.assets.clear()
        await db.monthlyData.clear()
        await db.assets.bulkAdd(data.assets)
        await db.monthlyData.bulkAdd(data.monthlyData)
        await store.initialize()
        
        ElMessage.success('数据导入成功')
      } catch (error) {
        console.error('导入数据失败:', error)
        ElMessage.error('导入数据失败：无效的数据格式')
      }
    }
    reader.readAsText(file)
  } catch (error) {
    console.error('读取文件失败:', error)
    ElMessage.error('读取文件失败')
  }
}

// 图表配置
const assetChartOption = ref({})
const profitChartOption = ref({})

const updateChartOptions = () => {
  // 更新资产趋势图配置
  const monthlyData = store.recentYearData
  const assetNames = [...new Set(monthlyData.flatMap(data => 
    data.assets.map(asset => asset.name)
  ))]

  assetChartOption.value = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'rgba(0, 0, 0, 0.05)',
      borderWidth: 1,
      textStyle: {
        color: '#1e293b'
      },
      formatter: (params) => {
        let result = `<div style="font-weight: 500; margin-bottom: 8px;">${params[0].axisValue}</div>`
        params.forEach(param => {
          const value = param.value?.toFixed(2) || '0.00'
          const color = param.value >= 0 ? '#dc2626' : '#16a34a'
          result += `<div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>${param.marker} ${param.seriesName}</span>
            <span style="font-weight: 500; margin-left: 24px; color: ${color}">${value}</span>
          </div>`
        })
        return result
      }
    },
    legend: {
      type: 'scroll',
      top: 0,
      right: 0,
      padding: [5, 0],
      itemGap: 16,
      textStyle: {
        color: '#64748b'
      }
    },
    grid: {
      top: 40,
      left: 0,
      right: 0,
      bottom: 0,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: monthlyData.map(data => data.yearMonth),
      axisLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        interval: 0,
        rotate: 45,
        color: '#64748b'
      }
    },
    yAxis: {
      type: 'value',
      name: '金额',
      nameTextStyle: {
        color: '#64748b',
        padding: [0, 0, 0, 24]
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#64748b'
      }
    },
    series: assetNames.map(name => ({
      name,
      type: 'line',
      data: monthlyData.map(data => {
        const asset = data.assets.find(a => a.name === name)
        return asset ? asset.amount : 0
      }),
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3
      }
    }))
  }

  // 更新收益趋势图配置
  const profitData = store.monthlyProfitTrend
  profitChartOption.value = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'rgba(0, 0, 0, 0.05)',
      borderWidth: 1,
      textStyle: {
        color: '#1e293b'
      },
      formatter: (params) => {
        const param = params[0]
        const value = param.value?.toFixed(2) || '0.00'
        const color = param.value >= 0 ? '#dc2626' : '#16a34a'
        return `<div style="font-weight: 500; margin-bottom: 8px;">${param.axisValue}</div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>收益金额</span>
            <span style="font-weight: 500; margin-left: 24px; color: ${color}">${value}</span>
          </div>`
      }
    },
    grid: {
      top: 40,
      left: 0,
      right: 0,
      bottom: 0,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: profitData.map(item => item.yearMonth),
      axisLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        interval: 0,
        rotate: 45,
        color: '#64748b'
      }
    },
    yAxis: {
      type: 'value',
      name: '收益金额',
      nameTextStyle: {
        color: '#64748b',
        padding: [0, 0, 0, 24]
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#64748b'
      }
    },
    series: [{
      data: profitData.map(item => item.profitAmount),
      type: 'line',
      name: '收益金额',
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3
      },
      areaStyle: {
        opacity: 0.1
      },
      itemStyle: {
        color: (params) => {
          return params.value >= 0 ? '#dc2626' : '#16a34a'
        }
      }
    }]
  }
}
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