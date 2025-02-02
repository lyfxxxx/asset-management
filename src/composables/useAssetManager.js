import { ref, computed } from 'vue'
import { useAssetStore } from '../stores/asset'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { db } from '../db'

export function useAssetManager() {
  const store = useAssetStore()
  const selectedMonth = ref(dayjs().format('YYYY-MM'))
  
  // 计算属性
  const assetList = computed(() => store.assetList)
  const totalAmount = computed(() => store.totalAmount)
  const income = computed(() => store.income)
  const monthlyProfit = computed(() => store.monthlyProfit(selectedMonth.value))
  const yearlyProfit = computed(() => store.yearlyProfit)
  const profitDateRange = computed(() => {
    const endDate = dayjs()
    const startDate = endDate.subtract(11, 'month')
    return `${startDate.format('YYYY.MM')}-${endDate.format('YYYY.MM')}`
  })

  // 资产管理方法
  const handleMonthChange = (value) => {
    store.setCurrentYearMonth(value)
  }

  const handleAssetSubmit = async (data, isEdit) => {
    const { yearMonth, ...assetData } = data
    if (isEdit) {
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

  const handleDeleteAsset = async (row) => {
    try {
      await ElMessageBox.confirm(
        '确定要删除该资产吗？',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
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
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除资产失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  // 收入管理方法
  const handleIncomeSubmit = async (data) => {
    await store.updateMonthlyIncome(data.yearMonth, data.income)
    ElMessage.success('更新成功')

    if (data.yearMonth === selectedMonth.value) {
      store.setCurrentYearMonth(data.yearMonth)
    }
  }

  // 数据导入导出方法
  const handleExportData = async () => {
    try {
      const assets = await db.assets.toArray()
      const monthlyData = await db.monthlyData.toArray()
      
      const exportData = {
        assets,
        monthlyData,
        exportDate: new Date().toISOString()
      }
      
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const fileName = `asset-manage-backup-${dayjs().format('YYYY-MM-DD')}.json`

      // 检查是否为移动设备
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // 移动设备：创建临时下载链接并打开
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 100)
      } else {
        // PC设备：使用传统下载方式
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
      
      ElMessage.success('数据导出成功')
    } catch (error) {
      console.error('导出数据失败:', error)
      ElMessage.error('导出数据失败')
    }
  }

  const handleImportData = async (file) => {
    try {
      // 检查文件大小（限制为 5MB）
      if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('文件大小不能超过5MB')
        return
      }

      // 检查文件类型
      if (file.type && file.type !== 'application/json' && !file.name.endsWith('.json')) {
        ElMessage.error('请选择JSON格式的文件')
        return
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          if (!data.assets || !data.monthlyData) {
            throw new Error('无效的数据格式')
          }

          // 显示确认对话框
          await ElMessageBox.confirm(
            '导入数据将覆盖当前所有数据，是否继续？',
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )

          await db.assets.clear()
          await db.monthlyData.clear()
          await db.assets.bulkAdd(data.assets)
          await db.monthlyData.bulkAdd(data.monthlyData)
          await store.initialize()
          
          ElMessage.success('数据导入成功')
        } catch (error) {
          console.error('导入数据失败:', error)
          if (error.message === '无效的数据格式') {
            ElMessage.error('导入数据失败：无效的数据格式')
          } else {
            ElMessage.error('导入数据失败，请重试')
          }
        }
      }

      reader.onerror = () => {
        ElMessage.error('读取文件失败，请重试')
      }

      reader.readAsText(file)
    } catch (error) {
      console.error('读取文件失败:', error)
      ElMessage.error('读取文件失败')
    }
  }

  return {
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
  }
} 