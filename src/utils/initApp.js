/**
 * 应用初始化脚本
 * 处理数据迁移、初始化等任务
 */

import dbManager, { migrateFromLocalStorage } from './indexedDB'

/**
 * 初始化 IndexedDB 并迁移旧数据
 */
export async function initIndexedDB() {
  try {
    await dbManager.init()
    // 检查是否已经迁移过
    const migrationFlag = await dbManager.getItem('__migration_completed__')

    if (!migrationFlag) {
      const migratedKeys = await migrateFromLocalStorage('table_view_columns_')

      // 迁移 Issue 页面的列配置
      const issueColumnConfig = localStorage.getItem('issue_list_columns')
      if (issueColumnConfig) {
        try {
          const parsedValue = JSON.parse(issueColumnConfig)
          await dbManager.setItem('issue_list_columns', parsedValue)
          localStorage.removeItem('issue_list_columns')
        } catch (err) {
          console.warn('[InitApp] 迁移 issue_list_columns 失败:', err)
        }
      }

      // 设置迁移完成标志
      await dbManager.setItem('__migration_completed__', {
        completed: true,
        timestamp: Date.now(),
        migratedCount: migratedKeys.length
      })
    } else {
    }

    return true
  } catch (error) {
    console.error('[InitApp] IndexedDB 初始化失败:', error)
    return false
  }
}

/**
 * 初始化应用
 */
export async function initApp() {
  try {
    await initIndexedDB()
    return true
  } catch (error) {
    console.error('[InitApp] 应用初始化失败:', error)
    return false
  }
}

/**
 * 重置所有数据（用于调试）
 */
export async function resetAllData() {
  try {
    await dbManager.clear()
    localStorage.clear()
    sessionStorage.clear()
    return true
  } catch (error) {
    console.error('[InitApp] 重置数据失败:', error)
    return false
  }
}

/**
 * 查看 IndexedDB 中的所有数据（用于调试）
 */
export async function viewAllData() {
  try {
    const allData = await dbManager.getAll()
    console.table(allData)
    return allData
  } catch (error) {
    console.error('[InitApp] 查看数据失败:', error)
    return []
  }
}

// 将调试函数挂载到 window 对象上，方便控制台调试
if (typeof window !== 'undefined') {
  window.__dcp_debug__ = {
    resetAllData,
    viewAllData,
    initIndexedDB
  }
}
