import { defineStore } from 'pinia'
import { db } from '../db'
import dayjs from 'dayjs'

export const useAssetStore = defineStore('asset', {
  state: () => ({
    assets: [],
    income: 0,
    monthlyData: [],
    currentYearMonth: dayjs().format('YYYY-MM')
  }),

  getters: {
    // 获取当前月份的总资产（通过资产总和计算）
    totalAmount: (state) => {
      const total = state.assets.reduce((sum, asset) => sum + asset.amount, 0)
      return Number(total.toFixed(2))
    },

    // 获取最新的总资产（用于计算目标金额）
    latestTotalAmount: (state) => {
      const sortedData = [...state.monthlyData].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
      if (!sortedData[0]) return 0
      return sortedData[0].assets.reduce((sum, asset) => sum + asset.amount, 0)
    },

    assetList: (state) => {
      // 计算当前月份的总资产
      const currentTotalAmount = state.assets.reduce((sum, asset) => sum + asset.amount, 0)

      return state.assets.map(asset => {
        // 使用当前月份的总资产计算目标金额
        const targetAmount = Number(((currentTotalAmount * asset.targetRatio) / 100).toFixed(2))
        const difference = Number((asset.amount - targetAmount).toFixed(2))
        return {
          ...asset,
          amount: Number(asset.amount.toFixed(2)),
          targetAmount,
          difference
        }
      })
    },

    recentYearData: (state) => {
      const currentDate = dayjs()
      const months = []

      for (let i = 0; i < 12; i++) {
        const date = currentDate.subtract(i, 'month')
        const yearMonth = date.format('YYYY-MM')
        const monthData = state.monthlyData.find(d => d.yearMonth === yearMonth)

        if (monthData) {
          // 计算该月的总资产
          const totalAmount = Number(monthData.assets.reduce((sum, asset) => sum + asset.amount, 0).toFixed(2))
          months.unshift({
            ...monthData,
            totalAmount,
            assets: monthData.assets.map(asset => ({
              ...asset,
              amount: Number(asset.amount.toFixed(2))
            }))
          })
        } else {
          months.unshift({
            yearMonth,
            totalAmount: 0,
            income: 0,
            assets: state.assets.map(asset => ({
              ...asset,
              amount: 0
            }))
          })
        }
      }

      return months
    },

    // 获取最新的有效月份数据
    latestValidMonthData: (state) => {
      const sortedData = [...state.monthlyData]
        .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
        .filter(data => data.yearMonth <= dayjs().format('YYYY-MM'))
      return sortedData[0]
    },

    // 获取指定月份的收益率和收益金额
    monthlyProfit: (state) => (yearMonth) => {
      const currentMonthData = state.monthlyData.find(d => d.yearMonth === yearMonth)
      const lastMonthData = state.monthlyData.find(d => d.yearMonth === dayjs(yearMonth).subtract(1, 'month').format('YYYY-MM'))

      if (!currentMonthData || !lastMonthData) {
        return {
          profitAmount: 0,
          profitRate: 0
        }
      }

      const currentTotal = currentMonthData.assets.reduce((sum, asset) => sum + asset.amount, 0)
      const lastTotal = lastMonthData.assets.reduce((sum, asset) => sum + asset.amount, 0)
      const currentIncome = currentMonthData.income || 0

      // 如果上月总资产为0，则本月收益也为0
      if (lastTotal === 0) {
        return {
          profitAmount: 0,
          profitRate: 0
        }
      }

      // 计算收益金额：当月总资产 - 上月总资产 - 当月收入
      const profitAmount = Number((currentTotal - lastTotal - currentIncome).toFixed(2))
      
      // 计算收益率：收益金额 / 上月总资产 * 100%
      const profitRate = Number(((profitAmount / lastTotal) * 100).toFixed(2))

      return {
        profitAmount,
        profitRate
      }
    },

    // 计算最近一年的总收益
    yearlyProfit: (state) => {
      const monthlyData = [...state.monthlyData]
        .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
        .filter(data => data.yearMonth <= dayjs().format('YYYY-MM'))
        .slice(0, 12)

      if (monthlyData.length < 2) {
        return {
          profitAmount: 0,
          profitRate: 0
        }
      }

      // 获取最新月份数据
      const latestMonth = monthlyData[0]
      const latestTotal = latestMonth.assets.reduce((sum, asset) => sum + asset.amount, 0)

      // 找到第一个非0总资产的月份作为基准月份
      const baseMonth = [...monthlyData].reverse().find(month => {
        const total = month.assets.reduce((sum, asset) => sum + asset.amount, 0)
        return total > 0
      })

      // 如果没有找到有效的基准月份，返回0
      if (!baseMonth) {
        return {
          profitAmount: 0,
          profitRate: 0
        }
      }

      // 计算基准月份到最新月份之间的总收入
      const baseMonthIndex = monthlyData.findIndex(m => m.yearMonth === baseMonth.yearMonth)
      const totalIncome = monthlyData
        .slice(0, baseMonthIndex + 1)
        .reduce((sum, data) => sum + (data.income || 0), 0)

      // 计算收益金额：最新月份总资产 - 基准月份总资产 - 期间总收入
      const baseTotal = baseMonth.assets.reduce((sum, asset) => sum + asset.amount, 0)
      const profitAmount = Number((latestTotal - baseTotal - totalIncome).toFixed(2))

      // 计算收益率：收益金额 / 基准月份总资产 * 100%
      const profitRate = Number(((profitAmount / baseTotal) * 100).toFixed(2))

      return {
        profitAmount,
        profitRate
      }
    },

    // 获取最近12个月的月度收益数据
    monthlyProfitTrend: (state) => {
      const monthlyData = [...state.monthlyData]
        .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
        .filter(data => data.yearMonth <= dayjs().format('YYYY-MM'))
        .slice(0, 13) // 获取13个月的数据以计算12个月的收益

      const profitData = monthlyData.slice(0, -1).map((data, index) => {
        const nextData = monthlyData[index + 1]
        if (!nextData) {
          return {
            yearMonth: data.yearMonth,
            profitAmount: 0
          }
        }

        const currentTotal = data.assets.reduce((sum, asset) => sum + asset.amount, 0)
        const prevTotal = nextData.assets.reduce((sum, asset) => sum + asset.amount, 0)
        
        // 如果上月总资产为0，则本月收益为0
        if (prevTotal === 0) {
          return {
            yearMonth: data.yearMonth,
            profitAmount: 0
          }
        }

        // 计算月度收益：当月总资产 - 上月总资产 - 当月收入
        const profitAmount = currentTotal - prevTotal - (data.income || 0)
        
        return {
          yearMonth: data.yearMonth,
          profitAmount: Number(profitAmount.toFixed(2))
        }
      })

      // 返回反转后的数据，保持原有顺序（从早到晚）
      return profitData.reverse()
    },

    // 添加计算总资产的辅助方法
    calculateTotalAmount(assets) {
      return assets.reduce((sum, asset) => sum + asset.amount, 0)
    }
  },

  actions: {
    async initialize() {
      const assets = await db.assets.toArray()
      this.assets = assets

      const monthlyData = await db.monthlyData.toArray()
      this.monthlyData = monthlyData.map(data => ({
        ...data,
        assets: JSON.parse(data.assets)
      }))

      const currentMonthData = this.monthlyData.find(d => d.yearMonth === this.currentYearMonth)
      
      if (currentMonthData) {
        this.income = currentMonthData.income
        this.assets = currentMonthData.assets
      } else {
        // 如果当前月份没有数据，使用最近一个有效月份的数据
        const latestData = this.latestValidMonthData
        if (latestData) {
          this.assets = latestData.assets.map(asset => ({
            ...asset,
            amount: 0
          }))
        }
      }
    },

    // 添加月份检查函数
    checkMonth(yearMonth) {
      const currentMonth = dayjs().format('YYYY-MM')
      if (yearMonth > currentMonth) {
        throw new Error('不能操作未来月份的数据')
      }
    },

    setCurrentYearMonth(yearMonth) {
      this.checkMonth(yearMonth)
      this.currentYearMonth = yearMonth
      const monthData = this.monthlyData.find(d => d.yearMonth === yearMonth)
      
      if (monthData) {
        // 如果有月度数据，直接使用
        this.income = monthData.income
        this.assets = monthData.assets
      } else {
        // 如果是新月份，需要根据情况初始化数据
        const currentMonth = dayjs().format('YYYY-MM')
        this.income = 0
        
        if (yearMonth === currentMonth) {
          // 如果是当前月份，从最近的有效月份继承资产列表
          const latestData = this.latestValidMonthData
          if (latestData) {
            this.assets = latestData.assets.map(asset => ({
              ...asset,
              amount: Number(asset.amount.toFixed(2))
            }))
          } else {
            // 如果没有任何月度数据，从assets表获取资产列表
            this.assets = this.assets.map(asset => ({
              ...asset,
              amount: 0
            }))
          }
        } else {
          // 如果是历史月份，将所有资产金额设为0
          const latestData = this.latestValidMonthData
          if (latestData) {
            this.assets = latestData.assets.map(asset => ({
              ...asset,
              amount: 0
            }))
          } else {
            this.assets = this.assets.map(asset => ({
              ...asset,
              amount: 0
            }))
          }
        }

        // 自动创建新月份的数据
        this.updateMonthlyData(yearMonth)
      }
    },

    // 添加新方法：自动创建月度数据
    async updateMonthlyData(yearMonth) {
      const totalAmount = this.assets.reduce((sum, asset) => sum + asset.amount, 0)
      
      const newMonthData = {
        yearMonth,
        totalAmount: Number(totalAmount.toFixed(2)),
        income: 0,
        assets: JSON.stringify(this.assets)
      }

      await db.monthlyData.put(newMonthData)

      const memoryMonthData = {
        ...newMonthData,
        assets: this.assets
      }

      this.monthlyData.push(memoryMonthData)
    },

    async updateMonthlyAsset(yearMonth, asset) {
      this.checkMonth(yearMonth)
      const monthData = this.monthlyData.find(d => d.yearMonth === yearMonth)
      let monthAssets = []
      let monthIncome = 0

      if (monthData) {
        monthAssets = [...monthData.assets]
        monthIncome = monthData.income
      } else {
        // 如果目标月份没有数据，根据情况初始化
        const currentMonth = dayjs().format('YYYY-MM')
        if (yearMonth === currentMonth) {
          // 当前月份使用最近的有效月份数据
          const latestData = this.latestValidMonthData
          monthAssets = latestData 
            ? latestData.assets.map(asset => ({
                ...asset,
                amount: Number(asset.amount.toFixed(2))
              }))
            : []
        } else {
          // 历史月份将所有资产金额设为0
          const latestData = this.latestValidMonthData
          monthAssets = latestData 
            ? latestData.assets.map(asset => ({
                ...asset,
                amount: 0
              }))
            : []
        }
      }

      const index = monthAssets.findIndex(a => a.code === asset.code)
      if (index !== -1) {
        monthAssets[index] = { 
          ...asset,
          amount: Number(asset.amount.toFixed(2))
        }
      } else {
        monthAssets.push({ 
          ...asset,
          amount: Number(asset.amount.toFixed(2))
        })
      }

      // 计算总资产
      const totalAmount = Number(monthAssets.reduce((sum, a) => sum + a.amount, 0).toFixed(2))

      const newMonthData = {
        yearMonth,
        totalAmount,
        income: monthIncome,
        assets: JSON.stringify(monthAssets)
      }

      await db.monthlyData.put(newMonthData)

      const memoryMonthData = {
        ...newMonthData,
        assets: monthAssets
      }

      const existingIndex = this.monthlyData.findIndex(d => d.yearMonth === yearMonth)
      if (existingIndex !== -1) {
        this.monthlyData[existingIndex] = memoryMonthData
      } else {
        this.monthlyData.push(memoryMonthData)
      }

      if (yearMonth === this.currentYearMonth) {
        this.assets = monthAssets
      }
    },

    async updateMonthlyIncome(yearMonth, income) {
      this.checkMonth(yearMonth)
      const monthData = this.monthlyData.find(d => d.yearMonth === yearMonth)
      let monthAssets = []

      if (monthData) {
        monthAssets = monthData.assets.map(asset => ({
          ...asset,
          amount: Number(asset.amount.toFixed(2))
        }))
      } else {
        monthAssets = this.assets.map(a => ({
          ...a,
          amount: 0
        }))
      }

      // 计算总资产
      const totalAmount = Number(monthAssets.reduce((sum, a) => sum + a.amount, 0).toFixed(2))

      const newMonthData = {
        yearMonth,
        totalAmount,
        income: Number(income.toFixed(2)),
        assets: JSON.stringify(monthAssets)
      }

      await db.monthlyData.put(newMonthData)

      const memoryMonthData = {
        ...newMonthData,
        assets: monthAssets
      }

      const existingIndex = this.monthlyData.findIndex(d => d.yearMonth === yearMonth)
      if (existingIndex !== -1) {
        this.monthlyData[existingIndex] = memoryMonthData
      } else {
        this.monthlyData.push(memoryMonthData)
      }

      if (yearMonth === this.currentYearMonth) {
        this.income = Number(income.toFixed(2))
      }
    }
  }
}) 