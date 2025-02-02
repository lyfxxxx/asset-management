import { ref } from 'vue'

export function useChartOptions() {
  const assetChartOption = ref({})
  const profitChartOption = ref({})

  const updateAssetChartOption = (monthlyData) => {
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
  }

  const updateProfitChartOption = (profitData) => {
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

  const updateChartOptions = (monthlyData, profitData) => {
    updateAssetChartOption(monthlyData)
    updateProfitChartOption(profitData)
  }

  return {
    assetChartOption,
    profitChartOption,
    updateChartOptions
  }
} 