import { defineStore } from 'pinia'
import { db } from '../db'
import dayjs from 'dayjs'

export const useAssetStore = defineStore('asset', {
  state: () => ({
    assets: [],
    totalAmount: 0,
    income: 0,
    monthlyData: [],
    currentYearMonth: dayjs().format('YYYY-MM')
  }),

  getters: {
    // 获取最新的总资产（用于计算目标金额）
    latestTotalAmount: (state) => {
      const sortedData = [...state.monthlyData].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
      return sortedData[0]?.totalAmount || 0
    },

    assetList: (state) => {
      return state.assets.map(asset => {
        // 使用最新的总资产计算目标金额
        const targetAmount = (state.latestTotalAmount * asset.targetRatio) / 100
        const difference = asset.amount - targetAmount
        return {
          ...asset,
          targetAmount,
          difference
        }
      })
    },
    
    totalCurrentAmount: (state) => {
      return state.assets.reduce((sum, asset) => sum + asset.amount, 0)
    },

    recentYearData: (state) => {
      const currentDate = dayjs()
      const months = []

      for (let i = 0; i < 12; i++) {
        const date = currentDate.subtract(i, 'month')
        const yearMonth = date.format('YYYY-MM')
        const monthData = state.monthlyData.find(d => d.yearMonth === yearMonth)

        if (monthData) {
          months.unshift(monthData)
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
        this.totalAmount = currentMonthData.totalAmount
        this.income = currentMonthData.income
        this.assets = currentMonthData.assets
      }
    },

    setCurrentYearMonth(yearMonth) {
      this.currentYearMonth = yearMonth
      const monthData = this.monthlyData.find(d => d.yearMonth === yearMonth)
      if (monthData) {
        this.totalAmount = monthData.totalAmount
        this.income = monthData.income
        this.assets = monthData.assets
      } else {
        this.totalAmount = 0
        this.income = 0
        this.assets = this.assets.map(asset => ({
          ...asset,
          amount: 0
        }))
      }
    },

    async updateMonthlyAsset(yearMonth, asset) {
      const monthData = this.monthlyData.find(d => d.yearMonth === yearMonth)
      let monthAssets = []
      let monthTotalAmount = 0
      let monthIncome = 0

      if (monthData) {
        monthAssets = [...monthData.assets]
        monthTotalAmount = monthData.totalAmount
        monthIncome = monthData.income
      } else {
        monthAssets = this.assets.map(a => ({
          ...a,
          amount: 0
        }))
      }

      const index = monthAssets.findIndex(a => a.id === asset.id)
      if (index !== -1) {
        monthAssets[index] = { ...asset }
      } else {
        monthAssets.push({ ...asset })
      }

      const newMonthData = {
        yearMonth,
        totalAmount: monthTotalAmount,
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

    async updateMonthlyTotalAmount(yearMonth, totalAmount) {
      const monthData = this.monthlyData.find(d => d.yearMonth === yearMonth)
      let monthAssets = []
      let monthIncome = 0

      if (monthData) {
        monthAssets = monthData.assets
        monthIncome = monthData.income
      } else {
        monthAssets = this.assets.map(a => ({
          ...a,
          amount: 0
        }))
      }

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
        this.totalAmount = totalAmount
      }
    },

    async updateMonthlyIncome(yearMonth, income) {
      const monthData = this.monthlyData.find(d => d.yearMonth === yearMonth)
      let monthAssets = []
      let monthTotalAmount = 0

      if (monthData) {
        monthAssets = monthData.assets
        monthTotalAmount = monthData.totalAmount
      } else {
        monthAssets = this.assets.map(a => ({
          ...a,
          amount: 0
        }))
      }

      const newMonthData = {
        yearMonth,
        totalAmount: monthTotalAmount,
        income,
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
        this.income = income
      }
    }
  }
}) 