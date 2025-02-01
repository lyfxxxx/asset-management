<template>
  <div class="chart-section">
    <div class="chart-header">
      <h2 class="chart-title">{{ title }}</h2>
      <span class="chart-subtitle">{{ subtitle }}</span>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  chartData: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chart = null

const initChart = () => {
  if (!chartRef.value) return
  
  const container = chartRef.value
  if (container.offsetHeight === 0) {
    container.style.height = '100%'
  }
  
  if (chart) {
    chart.dispose()
  }
  
  chart = echarts.init(container)
  updateChart()
  
  setTimeout(() => {
    chart?.resize()
  }, 100)
}

const updateChart = () => {
  if (!chart) return
  chart.setOption(props.chartData)
}

// 监听窗口大小变化
const handleResize = () => {
  chart?.resize()
}

window.addEventListener('resize', handleResize)

// 监听数据变化
watch(() => props.chartData, () => {
  updateChart()
}, { deep: true })

onMounted(() => {
  setTimeout(() => {
    initChart()
  }, 100)
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  height: 360px;
  min-height: 360px;
  display: flex;
  flex-direction: column;
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

.chart-container {
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .chart-section {
    padding: 16px;
  }
}
</style> 