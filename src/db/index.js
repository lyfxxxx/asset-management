import Dexie from 'dexie'

export const db = new Dexie('AssetManageDB')

db.version(1).stores({
  assets: '++id, name, amount, targetRatio, createdAt, updatedAt',
  snapshots: '++id, assets, totalAmount, income, date',
  settings: 'id, totalAmount, income',
  monthlyData: 'yearMonth, totalAmount, income, assets'
})

// 初始化设置
db.settings.get(1).then(settings => {
  if (!settings) {
    db.settings.put({
      id: 1,
      totalAmount: 0,
      income: 0
    })
  }
})

export default db 