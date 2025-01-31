<template>
  <div class="asset-manager">
    <div class="main-content">
      <!-- 左侧内容区 -->
      <div class="left-section">
        <!-- 功能区 -->
        <div class="function-section">
          <div class="top-controls">
            <el-date-picker
              v-model="selectedMonth"
              type="month"
              format="YYYY-MM"
              value-format="YYYY-MM"
              placeholder="选择月份"
              @change="handleMonthChange"
              class="month-picker"
            />
            <div class="action-group">
              <el-button
                type="primary"
                @click="handleAddAsset"
              >
                添加资产
              </el-button>
              <el-button
                type="warning"
                @click="handleDataManage"
              >
                数据管理
              </el-button>
            </div>
          </div>

          <div class="info-cards">
            <el-card
              class="info-card"
              shadow="hover"
              :header="null"
            >
              <template #header>
                <div class="card-header">总资产</div>
              </template>
              <div class="info-card-content">
                <span class="info-card-value">{{ totalAmount }}</span>
              </div>
              <template #footer>
                <div class="card-footer">
                  <el-button
                    type="primary"
                    text
                    @click="handleUpdateTotalAmount"
                  >
                    更新总资产
                  </el-button>
                </div>
              </template>
            </el-card>

            <el-card
              class="info-card"
              shadow="hover"
              :header="null"
            >
              <template #header>
                <div class="card-header">收入</div>
              </template>
              <div class="info-card-content">
                <span class="info-card-value">{{ income }}</span>
              </div>
              <template #footer>
                <div class="card-footer">
                  <el-button
                    type="primary"
                    text
                    @click="handleUpdateIncome"
                  >
                    更新收入
                  </el-button>
                </div>
              </template>
            </el-card>

            <el-card
              class="info-card"
              shadow="hover"
              :header="null"
            >
              <template #header>
                <div class="card-header">收益率（年化）</div>
              </template>
              <div class="info-card-content">
                <span class="info-card-value" :class="{ 'text-red-500': profitRate < 0, 'text-green-500': profitRate > 0 }">
                  {{ profitRate }}%
                </span>
              </div>
            </el-card>

            <el-card
              class="info-card"
              shadow="hover"
              :header="null"
            >
              <template #header>
                <div class="card-header">收益金额</div>
              </template>
              <div class="info-card-content">
                <span class="info-card-value" :class="{ 'text-red-500': profitAmount < 0, 'text-green-500': profitAmount > 0 }">
                  {{ profitAmount }}
                </span>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 表格区域 -->
        <div class="table-section">
          <el-table :data="assetList" class="asset-table">
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
                <div class="flex gap-2">
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleEditAsset(row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleDeleteAsset(row)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 右侧图表区 -->
      <div class="right-section">
        <div class="chart-section">
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 数据管理弹窗 -->
    <el-dialog
      v-model="dataManageVisible"
      title="数据管理"
      width="400px"
    >
      <div class="data-manage-content">
        <el-button
          type="success"
          @click="handleExportData"
          class="w-full mb-4"
        >
          导出数据
        </el-button>
        <el-button
          type="primary"
          @click="handleImportClick"
          class="w-full"
        >
          导入数据
        </el-button>
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          accept=".json"
          @change="handleImportData"
        />
      </div>
    </el-dialog>

    <!-- 资产编辑弹窗 -->
    <el-dialog
      v-model="assetDialogVisible"
      :title="isEdit ? '编辑资产' : '添加资产'"
      width="500px"
    >
      <el-form
        ref="assetFormRef"
        :model="assetForm"
        :rules="assetRules"
        label-width="100px"
        class="p-4"
      >
        <el-form-item label="月份" prop="yearMonth">
          <el-date-picker
            v-model="assetForm.yearMonth"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
            placeholder="选择月份"
          />
        </el-form-item>
        <el-form-item label="资产名称" prop="name">
          <el-input v-model="assetForm.name" />
        </el-form-item>
        <el-form-item label="当前金额" prop="amount">
          <el-input v-model.number="assetForm.amount" type="number" />
        </el-form-item>
        <el-form-item label="目标占比" prop="targetRatio">
          <el-input v-model.number="assetForm.targetRatio" type="number">
            <template #append>%</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="assetDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAssetSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 总资产编辑弹窗 -->
    <el-dialog
      v-model="totalAmountDialogVisible"
      title="更新总资产"
      width="500px"
    >
      <el-form
        ref="totalAmountFormRef"
        :model="totalAmountForm"
        :rules="totalAmountRules"
        label-width="100px"
        class="p-4"
      >
        <el-form-item label="月份" prop="yearMonth">
          <el-date-picker
            v-model="totalAmountForm.yearMonth"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
            placeholder="选择月份"
          />
        </el-form-item>
        <el-form-item label="总资产" prop="totalAmount">
          <el-input v-model.number="totalAmountForm.totalAmount" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="totalAmountDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleTotalAmountSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 收入编辑弹窗 -->
    <el-dialog
      v-model="incomeDialogVisible"
      title="更新收入"
      width="500px"
    >
      <el-form
        ref="incomeFormRef"
        :model="incomeForm"
        :rules="incomeRules"
        label-width="100px"
        class="p-4"
      >
        <el-form-item label="月份" prop="yearMonth">
          <el-date-picker
            v-model="incomeForm.yearMonth"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
            placeholder="选择月份"
          />
        </el-form-item>
        <el-form-item label="收入" prop="income">
          <el-input v-model.number="incomeForm.income" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="incomeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleIncomeSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.asset-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  gap: var(--spacing-lg);
  min-height: 0;
}

.left-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.function-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.top-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.action-group {
  display: flex;
  gap: var(--spacing-md);
  margin-left: auto;
}

.info-cards {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.info-card {
  flex: 1;
  min-width: 240px;
}

.info-card :deep(.el-card__header) {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.card-header {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  font-weight: 500;
  text-align: left;
}

.info-card-content {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-sm) 0;
}

.info-card-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-align: left;
}

.info-card :deep(.el-card__footer) {
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--el-border-color-lighter);
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.table-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: var(--spacing-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.asset-table {
  flex: 1;
}

.right-section {
  width: 40%;
  min-width: 500px;
  display: flex;
}

.chart-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: var(--spacing-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.chart-container {
  flex: 1;
  width: 100%;
}

.month-picker {
  width: 200px;
}

@media (max-width: 1280px) {
  .main-content {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .right-section {
    width: 100%;
    min-width: 0;
    height: 500px;
  }

  .info-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .asset-manager {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  .top-controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .action-group {
    margin-left: 0;
    width: 100%;
  }

  .action-group .el-button {
    flex: 1;
  }

  .month-picker {
    width: 100%;
  }

  .info-cards {
    flex-direction: column;
    width: 100%;
  }

  .info-card {
    width: 100%;
    min-width: 0;
  }

  .info-card-content {
    gap: var(--spacing-xs);
  }

  .info-card-value {
    font-size: 1.2rem;
  }
}
</style>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useAssetStore } from '../stores/asset'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { db } from '../db'

const store = useAssetStore()
const assetList = computed(() => store.assetList)
const totalAmount = computed(() => store.totalAmount)
const income = computed(() => store.income)
const selectedMonth = ref(dayjs().format('YYYY-MM'))

// 资产弹窗相关
const assetDialogVisible = ref(false)
const isEdit = ref(false)
const assetFormRef = ref(null)
const assetForm = ref({
  yearMonth: dayjs().format('YYYY-MM'),
  name: '',
  amount: 0,
  targetRatio: 0
})

// 总资产弹窗相关
const totalAmountDialogVisible = ref(false)
const totalAmountFormRef = ref(null)
const totalAmountForm = ref({
  yearMonth: dayjs().format('YYYY-MM'),
  totalAmount: 0
})

// 收入弹窗相关
const incomeDialogVisible = ref(false)
const incomeFormRef = ref(null)
const incomeForm = ref({
  yearMonth: dayjs().format('YYYY-MM'),
  income: 0
})

// 图表相关
const chartRef = ref(null)
let chart = null

// 添加文件输入引用
const fileInput = ref(null)

// 添加数据管理弹窗控制
const dataManageVisible = ref(false)

// 计算当月收益率（年化）和收益金额
const profitRate = computed(() => {
  const monthlyData = store.recentYearData
  if (monthlyData.length < 2) return 0

  const currentData = monthlyData[monthlyData.length - 1]
  const prevData = monthlyData[monthlyData.length - 2]
  
  const currentTotal = currentData.assets.reduce((sum, asset) => sum + asset.amount, 0)
  const prevTotal = prevData.assets.reduce((sum, asset) => sum + asset.amount, 0)
  const monthlyIncome = currentData.income - prevData.income

  // 计算月度收益率（剔除收入影响）
  const monthlyProfitRate = prevTotal === 0 ? 0 : ((currentTotal - prevTotal - monthlyIncome) / prevTotal)
  
  // 转换为年化收益率
  const annualizedRate = monthlyProfitRate * 12 * 100

  return annualizedRate.toFixed(2)
})

const profitAmount = computed(() => {
  const monthlyData = store.recentYearData
  if (monthlyData.length < 2) return 0

  const currentData = monthlyData[monthlyData.length - 1]
  const prevData = monthlyData[monthlyData.length - 2]
  
  const currentTotal = currentData.assets.reduce((sum, asset) => sum + asset.amount, 0)
  const prevTotal = prevData.assets.reduce((sum, asset) => sum + asset.amount, 0)
  const monthlyIncome = currentData.income - prevData.income

  // 计算收益金额（剔除收入影响）
  const profit = currentTotal - prevTotal - monthlyIncome

  return profit.toFixed(2)
})

const initChart = () => {
  if (!chartRef.value) return
  
  // 确保容器有宽高
  const container = chartRef.value
  if (container.offsetHeight === 0) {
    container.style.height = '400px'
  }
  
  // 销毁旧的实例
  if (chart) {
    chart.dispose()
  }
  
  // 创建新实例
  chart = echarts.init(container)
  
  // 初始更新
  updateChart()
  
  // 手动触发一次 resize
  setTimeout(() => {
    chart?.resize()
  }, 100)
}

const updateChart = () => {
  if (!chart) return

  const monthlyData = store.recentYearData
  
  // 获取所有月度数据中出现过的资产名称
  const assetNames = [...new Set(monthlyData.flatMap(data => 
    data.assets.map(asset => asset.name)
  ))]

  const series = assetNames.map(name => ({
    name,
    type: 'line',
    data: monthlyData.map(data => {
      const asset = data.assets.find(a => a.name === name)
      return asset ? asset.amount : 0
    })
  }))

  const option = {
    title: {
      text: '资产变化趋势（最近12个月）',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = params[0].axisValue + '<br/>'
        params.forEach(param => {
          result += param.marker + param.seriesName + ': ' + param.value?.toFixed(2) + '<br/>'
        })
        return result
      }
    },
    legend: {
      data: assetNames,
      top: 40,
      type: 'scroll',
      padding: [5, 20]
    },
    grid: {
      top: 100,
      left: '5%',
      right: '5%',
      bottom: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: monthlyData.map(data => data.yearMonth),
      axisLabel: {
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '金额',
      min: 0,
      nameTextStyle: {
        padding: [0, 0, 0, 40]
      }
    },
    series
  }

  chart.setOption(option)
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  chart?.resize()
})

// 监听数据变化
watch(() => store.monthlyData, updateChart, { deep: true })

onMounted(() => {
  // 延迟初始化，确保容器已渲染
  setTimeout(() => {
    initChart()
  }, 100)
})

// 添加组件销毁时的清理
onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  // 移除 resize 监听
  window.removeEventListener('resize', handleResize)
})

// 将 resize 处理提取为函数
const handleResize = () => {
  chart?.resize()
}

// 使用函数引用监听 resize
window.addEventListener('resize', handleResize)

const handleMonthChange = (value) => {
  store.setCurrentYearMonth(value)
}

const handleUpdateTotalAmount = () => {
  totalAmountForm.value = {
    yearMonth: selectedMonth.value,
    totalAmount: store.totalAmount
  }
  totalAmountDialogVisible.value = true
}

const handleTotalAmountSubmit = async () => {
  if (!totalAmountFormRef.value) return
  
  await totalAmountFormRef.value.validate(async (valid) => {
    if (valid) {
      const { yearMonth, totalAmount } = totalAmountForm.value
      await store.updateMonthlyTotalAmount(yearMonth, totalAmount)
      totalAmountDialogVisible.value = false
      ElMessage.success('更新成功')

      if (yearMonth === selectedMonth.value) {
        store.setCurrentYearMonth(yearMonth)
      }
    }
  })
}

const handleUpdateIncome = () => {
  incomeForm.value = {
    yearMonth: selectedMonth.value,
    income: store.income
  }
  incomeDialogVisible.value = true
}

const handleIncomeSubmit = async () => {
  if (!incomeFormRef.value) return
  
  await incomeFormRef.value.validate(async (valid) => {
    if (valid) {
      const { yearMonth, income } = incomeForm.value
      await store.updateMonthlyIncome(yearMonth, income)
      incomeDialogVisible.value = false
      ElMessage.success('更新成功')

      if (yearMonth === selectedMonth.value) {
        store.setCurrentYearMonth(yearMonth)
      }
    }
  })
}

const handleAddAsset = () => {
  isEdit.value = false
  assetForm.value = {
    yearMonth: selectedMonth.value,
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
    await db.assets.delete(row.id)
    // 从所有月度数据中移除该资产
    const updatedMonthlyData = store.monthlyData.map(monthData => {
      const filteredAssets = monthData.assets.filter(asset => asset.id !== row.id)
      return {
        ...monthData,
        assets: JSON.stringify(filteredAssets)
      }
    })
    
    // 批量更新所有月度数据
    await Promise.all(updatedMonthlyData.map(data => db.monthlyData.put(data)))
    
    // 更新 store 中的数据（使用解析后的数组）
    store.monthlyData = updatedMonthlyData.map(data => ({
      ...data,
      assets: JSON.parse(data.assets)
    }))
    store.assets = store.assets.filter(asset => asset.id !== row.id)
    
    ElMessage.success('删除成功')
  })
}

const handleAssetSubmit = async () => {
  if (!assetFormRef.value) return
  
  await assetFormRef.value.validate(async (valid) => {
    if (valid) {
      const { yearMonth, ...assetData } = assetForm.value
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
        const id = await db.assets.add(newAsset)
        await store.updateMonthlyAsset(yearMonth, { ...newAsset, id })
        ElMessage.success('添加成功')
      }
      assetDialogVisible.value = false

      // 如果更新的是当前选中的月份，刷新显示
      if (yearMonth === selectedMonth.value) {
        store.setCurrentYearMonth(yearMonth)
      }
    }
  })
}

const assetRules = {
  yearMonth: [
    { required: true, message: '请选择月份', trigger: 'change' }
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
        const totalRatio = store.assets.reduce((sum, asset) => {
          return sum + (asset.id === assetForm.value.id ? 0 : asset.targetRatio)
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

const totalAmountRules = {
  yearMonth: [
    { required: true, message: '请选择月份', trigger: 'change' }
  ],
  totalAmount: [
    { required: true, message: '请输入总资产', trigger: 'blur' },
    { type: 'number', message: '总资产必须为数字', trigger: 'blur' }
  ]
}

const incomeRules = {
  yearMonth: [
    { required: true, message: '请选择月份', trigger: 'change' }
  ],
  income: [
    { required: true, message: '请输入收入', trigger: 'blur' },
    { type: 'number', message: '收入必须为数字', trigger: 'blur' }
  ]
}

// 导出数据
const handleExportData = async () => {
  try {
    // 获取所有数据
    const assets = await db.assets.toArray()
    const monthlyData = await db.monthlyData.toArray()
    
    // 创建导出对象
    const exportData = {
      assets,
      monthlyData,
      exportDate: new Date().toISOString()
    }
    
    // 创建并下载文件
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

// 触发文件选择
const handleImportClick = () => {
  fileInput.value.click()
}

// 导入数据
const handleImportData = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        // 验证数据格式
        if (!data.assets || !data.monthlyData) {
          throw new Error('无效的数据格式')
        }

        // 清空现有数据
        await db.assets.clear()
        await db.monthlyData.clear()

        // 导入新数据
        await db.assets.bulkAdd(data.assets)
        await db.monthlyData.bulkAdd(data.monthlyData)

        // 重新初始化 store
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
  } finally {
    // 清空文件输入，允许重复选择同一个文件
    event.target.value = ''
  }
}

const handleDataManage = () => {
  dataManageVisible.value = true
}
</script> 