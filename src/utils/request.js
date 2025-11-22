import axios from 'axios'
import { MessagePlugin } from 'tdesign-vue-next'
import Cookies from 'js-cookie'
import { useLoadingStore } from '@/store/loading'
import { objectKeysToSnake, objectKeysToCamel } from './caseConverter'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000
})

// 获取 loading store 实例
let loadingStore = null
const getLoadingStore = () => {
  if (!loadingStore) {
    loadingStore = useLoadingStore()
  }
  return loadingStore
}

// 获取客户端IP地址
let clientIP = 'auto-detect'

/**
 * 获取客户端真实IP地址
 * 尝试多种方式获取用户浏览器的真实公网IP
 */
const fetchClientIP = async () => {
  if (clientIP && clientIP !== 'auto-detect') {
    return clientIP
  }

  // 检查fetch和AbortController是否可用
  if (typeof fetch === 'undefined' || typeof AbortController === 'undefined') {
    console.warn('⚠️ fetch或AbortController不可用，将由后端自动识别IP')
    clientIP = 'auto-detect'
    return clientIP
  }

  // 尝试多个IP查询服务，提高成功率
  const ipServices = [
    { url: 'https://api.ipify.org?format=json', key: 'ip' },
    { url: 'https://api64.ipify.org?format=json', key: 'ip' },
    { url: 'https://ipapi.co/json/', key: 'ip' },
    { url: 'https://api.myip.com', key: 'ip' }
  ]

  for (const service of ipServices) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒超时

      const response = await fetch(service.url, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const ip = data[service.key]

        if (ip && ip !== 'undefined') {
          clientIP = ip
          console.log('✅ 获取客户端IP成功:', clientIP, '(来源:', service.url, ')')
          return clientIP
        }
      }
    } catch (error) {
      console.warn('⚠️ IP服务失败:', service.url, error.message)
      continue
    }
  }

  // 所有服务都失败，让后端自动识别
  console.warn('⚠️ 前端无法获取IP，将由后端自动识别')
  clientIP = 'auto-detect'
  return clientIP
}

// 初始化时尝试获取IP（延迟执行，避免打包问题）
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fetchClientIP().catch(() => {})
  }, 0)
}

request.interceptors.request.use(
  async (config) => {
    // 显示组件级加载（优先级更高）
    if (config.componentLoading && config.loadingController) {
      config.loadingController.showLoading(config.loadingText || '正在加载中，请稍等...')
    }
    // 显示全局加载（需要明确启用）
    else if (config.showLoading === true) {
      const loading = getLoadingStore()
      loading.showLoading(config.loadingText || '正在加载中，请稍等...')
    }

    // 添加Token
    const token = Cookies.get('dcp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加客户端IP到请求头
    // 如果IP还未获取或为默认值，尝试重新获取
    if (!clientIP || clientIP === 'auto-detect') {
      await fetchClientIP()
    }

    // 设置IP请求头（即使是auto-detect，后端也会自动识别）
    config.headers['X-Client-IP'] = clientIP

    // 【关键配置】将请求参数从小驼峰转换为下划线
    // 处理 GET/DELETE 请求的 params 参数
    if (config.params) {
      config.params = objectKeysToSnake(config.params)
    }

    // 处理 POST/PUT/PATCH 请求的 data 参数
    if (config.data && typeof config.data === 'object') {
      config.data = objectKeysToSnake(config.data)
    }

    return config
  },
  (error) => {
    // 请求失败时，如果有显示加载，则隐藏
    if (error.config?.componentLoading && error.config.loadingController) {
      error.config.loadingController.hideLoading()
    } else if (error.config?.showLoading === true) {
      const loading = getLoadingStore()
      loading.hideLoading()
    }
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    // 响应成功时，如果有显示加载，则隐藏
    // 组件级 loading 优先
    if (response.config?.componentLoading && response.config.loadingController) {
      response.config.loadingController.hideLoading()
    }
    // 全局 loading
    else if (response.config?.showLoading === true) {
      const loading = getLoadingStore()
      loading.hideLoading()
    }

    // 【关键配置】将响应数据从下划线转换为小驼峰
    // 后端返回的是下划线格式，前端需要转换为小驼峰
      const success=response.success
      console.log('✅ response:', response)

      if (success){
          console.log('✅ response:', response)
      }
    const data = response.data
    if (data && typeof data === 'object') {
        if(!data.success){
            MessagePlugin.error(data.message||'系统异常，请联系管理员')
        }
      return objectKeysToCamel(data)
    }

    return data
  },
  (error) => {
    // 响应失败时，如果有显示加载，则隐藏
    // 组件级 loading 优先
    if (error.config?.componentLoading && error.config.loadingController) {
      error.config.loadingController.hideLoading()
    }
    // 全局 loading
    else if (error.config?.showLoading === true) {
      const loading = getLoadingStore()
      loading.hideLoading()
    }

    MessagePlugin.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default request
