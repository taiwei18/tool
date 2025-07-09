import { ref, watch, Ref } from 'vue'

type StorageType = 'localStorage' | 'sessionStorage'

/**
 * 本地存储组合式函数
 * @param key 存储键
 * @param defaultValue 默认值
 * @param storageType 存储类型
 */
export function useStorage<T>(
  key: string,
  defaultValue: T,
  storageType: StorageType = 'localStorage'
): [Ref<T>, (value: T) => void, () => void] {
  const storage = storageType === 'localStorage' ? localStorage : sessionStorage

  // 读取存储的值
  const readFromStorage = (): T => {
    try {
      const item = storage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item)
    } catch (error) {
      console.warn(`Error reading ${key} from ${storageType}:`, error)
      return defaultValue
    }
  }

  // 写入存储
  const writeToStorage = (value: T) => {
    try {
      storage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error writing ${key} to ${storageType}:`, error)
    }
  }

  // 删除存储
  const removeFromStorage = () => {
    try {
      storage.removeItem(key)
      storedValue.value = defaultValue
    } catch (error) {
      console.warn(`Error removing ${key} from ${storageType}:`, error)
    }
  }

  const storedValue = ref<T>(readFromStorage())

  // 监听值的变化并同步到存储
  watch(
    storedValue,
    (newValue) => {
      writeToStorage(newValue)
    },
    { deep: true }
  )

  // 更新值的函数
  const setValue = (value: T) => {
    storedValue.value = value
  }

  return [storedValue, setValue, removeFromStorage]
}

/**
 * 本地存储工具函数
 */
export const storageUtils = {
  /**
   * 设置本地存储
   */
  set(key: string, value: any, storageType: StorageType = 'localStorage') {
    try {
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage
      storage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error setting ${key} in ${storageType}:`, error)
    }
  },

  /**
   * 获取本地存储
   */
  get<T>(key: string, defaultValue?: T, storageType: StorageType = 'localStorage'): T | null {
    try {
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage
      const item = storage.getItem(key)
      if (item === null) return defaultValue || null
      return JSON.parse(item)
    } catch (error) {
      console.warn(`Error getting ${key} from ${storageType}:`, error)
      return defaultValue || null
    }
  },

  /**
   * 删除本地存储
   */
  remove(key: string, storageType: StorageType = 'localStorage') {
    try {
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage
      storage.removeItem(key)
    } catch (error) {
      console.warn(`Error removing ${key} from ${storageType}:`, error)
    }
  },

  /**
   * 清空本地存储
   */
  clear(storageType: StorageType = 'localStorage') {
    try {
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage
      storage.clear()
    } catch (error) {
      console.warn(`Error clearing ${storageType}:`, error)
    }
  }
}
