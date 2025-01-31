<template>
  <div class="p-5">
    <div ref="chartRef" class="w-full h-[400px]"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAssetStore } from '../stores/asset'
import * as echarts from 'echarts'
import { groupBy } from 'lodash-es'

const store = useAssetStore()
const chartRef = ref(null)
let chart = null

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return

  const snapshots = store.snapshots
  if (snapshots.length === 0) {
    chart.setOption({
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center'
      }
    })
    return
  }

  // 按资产名称分组计算每个时间点的资产金额
  const assetGroups = {}
  snapshots.forEach(snapshot => {
    snapshot.assets.forEach(asset => {
      if (!assetGroups[asset.name]) {
        assetGroups[asset.name] = []
      }
      assetGroups[asset.name].push({
        date: snapshot.date,
        amount: asset.amount
      })
    })
  })

  // 准备图表数据
  const dates = [...new Set(snapshots.map(s => s.date))].sort()
  const series = Object.entries(assetGroups).map(([name, data]) => ({
    name,
    type: 'line',
    data: dates.map(date => {
      const point = data.find(d => d.date === date)
      return point ? point.amount : null
    })
  }))

  // 计算收益率数据
  const profitRateSeries = {
    name: '收益率',
    type: 'line',
    yAxisIndex: 1,
    data: dates.map((date, index) => {
      if (index === 0) return 0
      const currentSnapshot = snapshots.find(s => s.date === date)
      const prevSnapshot = snapshots.find(s => s.date === dates[index - 1])
      if (!currentSnapshot || !prevSnapshot) return null

      const currentTotal = currentSnapshot.assets.reduce((sum, asset) => sum + asset.amount, 0)
      const prevTotal = prevSnapshot.assets.reduce((sum, asset) => sum + asset.amount, 0)
      const income = currentSnapshot.income - prevSnapshot.income

      // 计算纯收益率（剔除收入）
      return (((currentTotal - prevTotal - income) / prevTotal) * 100).toFixed(2)
    })
  }

  series.push(profitRateSeries)

  const option = {
    title: {
      text: '资产变化趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = params[0].axisValue + '<br/>'
        params.forEach(param => {
          const value = param.seriesName === '收益率' 
            ? param.value + '%'
            : param.value?.toFixed(2)
          result += param.marker + param.seriesName + ': ' + value + '<br/>'
        })
        return result
      }
    },
    legend: {
      data: [...Object.keys(assetGroups), '收益率'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '金额'
      },
      {
        type: 'value',
        name: '收益率(%)',
        splitLine: {
          show: false
        }
      }
    ],
    series
  }

  chart.setOption(option)
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  chart?.resize()
})

// 监听数据变化
watch(() => store.snapshots, updateChart, { deep: true })

onMounted(() => {
  initChart()
})
</script>

<style scoped>
.asset-chart {
  padding: 20px;
}
</style> 