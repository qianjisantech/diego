import { ref } from 'vue'
import request from '@/utils/request'

export function useLoading(initialState = false) {
  const loading = ref(initialState)
  const loadingText = ref('正在加载中，请稍等...')

  /**
   * 显示 loading
   * @param {string} text - loading 提示文本
   */
  const showLoading = (text = '正在加载中，请稍等...') => {
    loading.value = true
    loadingText.value = text
  }

  /**
   * 隐藏 loading
   */
  const hideLoading = () => {
    loading.value = false
  }

  /**
   * 包装异步函数，自动管理 loading 状态
   * @param {Function} fn - 异步函数
   * @param {string} text - loading 提示文本
   * @returns {Promise} 异步函数的返回值
   */
  const withLoading = async (fn, text = '正在加载中，请稍等...') => {
    try {
      showLoading(text)
      return await fn()
    } finally {
      hideLoading()
    }
  }

  const createApiCaller = () => {
    /**
     * @param {Function} apiFn - API 调用函数，应该返回一个 Promise
     * @param {string} text - loading 提示文本
     * @returns {Promise} API 调用结果
     */
    return async (apiFn, text = '正在加载中，请稍等...') => {
      // 显示 loading
      showLoading(text)

      try {
        // 执行 API 调用
        // 注意：这里的 loading 会由 request 拦截器自动管理
        // 因为我们已经在调用前设置了 loading 状态
        const result = await apiFn()
        return result
      } catch (error) {
        // 确保出错时也隐藏 loading
        hideLoading()
        throw error
      }
    }
  }

  /**
   * 创建一个带组件级 loading 配置的 request 包装器
   * 可以直接在 API 层使用，而不需要修改组件
   *
   * @param {Object} config - request 配置对象
   * @param {string} text - loading 提示文本
   * @returns {Promise} request 结果
   *
   * @example
   * const loading = useLoading()
   * const data = await loading.requestWithLoading({
   *   url: '/workspace/issue/page',
   *   method: 'post',
   *   data: params
   * }, '正在加载事项列表...')
   */
  const requestWithLoading = (config, text = '正在加载中，请稍等...') => {
    return request({
      ...config,
      componentLoading: true,
      loadingController: {
        showLoading,
        hideLoading
      },
      loadingText: text
    })
  }

  return {
    loading,
    loadingText,
    showLoading,
    hideLoading,
    withLoading,
    createApiCaller,
    requestWithLoading
  }
}
