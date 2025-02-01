import Dexie from 'dexie'

export const db = new Dexie('AssetManageDB')

// 定义数据库版本1的结构
db.version(1).stores({
  assets: '++id, name, amount, targetRatio, createdAt, updatedAt',
  monthlyData: 'yearMonth, totalAmount, income, assets'
})

// 定义新版本的结构，并处理数据迁移
db.version(2)
  .stores({
    assets: null, // 先删除旧的表结构
    monthlyData: null // 先删除旧的表结构
  })
  .upgrade(async tx => {
    // 在升级事务中执行数据迁移
    const assets = await tx.assets.toArray()
    const monthlyData = await tx.monthlyData.toArray()

    // 保存旧数据
    const oldAssets = assets.map(asset => ({
      ...asset,
      code: `ASSET_${asset.id}`
    }))

    const oldMonthlyData = monthlyData.map(data => {
      const assets = JSON.parse(data.assets)
      const updatedAssets = assets.map(asset => ({
        ...asset,
        code: `ASSET_${asset.id}`
      }))
      return {
        ...data,
        assets: JSON.stringify(updatedAssets)
      }
    })

    // 存储迁移的数据供下一个版本使用
    await tx.table('_migration_assets').bulkAdd(oldAssets)
    await tx.table('_migration_monthlyData').bulkAdd(oldMonthlyData)
  })

// 定义最终的表结构，并完成数据迁移
db.version(3)
  .stores({
    _migration_assets: null, // 删除临时迁移表
    _migration_monthlyData: null, // 删除临时迁移表
    assets: 'code, name, targetRatio, createdAt, updatedAt',
    monthlyData: 'yearMonth, totalAmount, income, assets'
  })
  .upgrade(async tx => {
    // 从临时表中读取迁移的数据
    const oldAssets = await tx.table('_migration_assets').toArray()
    const oldMonthlyData = await tx.table('_migration_monthlyData').toArray()

    // 将数据写入新表
    await tx.assets.bulkAdd(oldAssets)
    await tx.monthlyData.bulkAdd(oldMonthlyData)
  })

export default db 