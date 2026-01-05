/**
 * IndexedDB 工具类
 * 用于管理列配置等用户偏好设置
 */

const DB_NAME = 'dcp_vue_db'
const DB_VERSION = 1
const STORE_NAME = 'user_preferences'

class IndexedDBManager {
  constructor() {
    this.db = null
  }

  /**
   * 初始化数据库
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('[IndexedDB] 打开数据库失败:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        // 创建对象仓库
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'key' })
          objectStore.createIndex('key', 'key', { unique: true })
        }
      }
    })
  }

  /**
   * 确保数据库已初始化
   */
  async ensureDB() {
    if (!this.db) {
      await this.init()
    }
  }

  /**
   * 保存数据
   * @param {string} key - 存储键
   * @param {any} value - 存储值
   */
  async setItem(key, value) {
    try {
      await this.ensureDB()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(STORE_NAME)

        const data = {
          key,
          value,
          timestamp: Date.now()
        }

        const request = objectStore.put(data)

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = () => {
          console.error(`[IndexedDB] 保存失败: ${key}`, request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('[IndexedDB] setItem 错误:', error)
      throw error
    }
  }

  /**
   * 获取数据
   * @param {string} key - 存储键
   * @returns {Promise<any>} 存储的值
   */
  async getItem(key) {
    try {
      await this.ensureDB()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly')
        const objectStore = transaction.objectStore(STORE_NAME)
        const request = objectStore.get(key)

        request.onsuccess = () => {
          const result = request.result
          if (result) {
            resolve(result.value)
          } else {
            resolve(null)
          }
        }

        request.onerror = () => {
          console.error(`[IndexedDB] 读取失败: ${key}`, request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('[IndexedDB] getItem 错误:', error)
      return null
    }
  }

  /**
   * 删除数据
   * @param {string} key - 存储键
   */
  async removeItem(key) {
    try {
      await this.ensureDB()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(STORE_NAME)
        const request = objectStore.delete(key)

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = () => {
          console.error(`[IndexedDB] 删除失败: ${key}`, request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('[IndexedDB] removeItem 错误:', error)
      throw error
    }
  }

  /**
   * 清空所有数据
   */
  async clear() {
    try {
      await this.ensureDB()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(STORE_NAME)
        const request = objectStore.clear()

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = () => {
          console.error('[IndexedDB] 清空失败', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('[IndexedDB] clear 错误:', error)
      throw error
    }
  }

  /**
   * 获取所有键
   */
  async getAllKeys() {
    try {
      await this.ensureDB()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly')
        const objectStore = transaction.objectStore(STORE_NAME)
        const request = objectStore.getAllKeys()

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = () => {
          console.error('[IndexedDB] 获取所有键失败', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('[IndexedDB] getAllKeys 错误:', error)
      return []
    }
  }

  /**
   * 获取所有数据
   */
  async getAll() {
    try {
      await this.ensureDB()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly')
        const objectStore = transaction.objectStore(STORE_NAME)
        const request = objectStore.getAll()

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = () => {
          console.error('[IndexedDB] 获取所有数据失败', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('[IndexedDB] getAll 错误:', error)
      return []
    }
  }

  /**
   * 从 localStorage 迁移数据到 IndexedDB
   * @param {string} prefix - localStorage 键前缀
   */
  async migrateFromLocalStorage(prefix = 'table_view_columns_') {
    try {
      const migratedKeys = []

      // 遍历 localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)

        if (key && key.startsWith(prefix)) {
          const value = localStorage.getItem(key)

          try {
            // 尝试解析 JSON
            const parsedValue = JSON.parse(value)

            // 保存到 IndexedDB
            await this.setItem(key, parsedValue)

            migratedKeys.push(key)
          } catch (error) {
            console.warn(`[IndexedDB] 跳过无效数据: ${key}`, error)
          }
        }
      }

      return migratedKeys
    } catch (error) {
      console.error('[IndexedDB] 数据迁移失败:', error)
      return []
    }
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

// 创建单例实例
const dbManager = new IndexedDBManager()

// 导出实例和工具函数
export default dbManager

export const initDB = () => dbManager.init()
export const setItem = (key, value) => dbManager.setItem(key, value)
export const getItem = (key) => dbManager.getItem(key)
export const removeItem = (key) => dbManager.removeItem(key)
export const clear = () => dbManager.clear()
export const getAllKeys = () => dbManager.getAllKeys()
export const getAll = () => dbManager.getAll()
export const migrateFromLocalStorage = (prefix) => dbManager.migrateFromLocalStorage(prefix)
