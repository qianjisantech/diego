/**
 * WebSocket 客户端封装类
 */
class WebSocketClient {
  constructor() {
    this.Client = null
    this.SockJS = null
    this.client = null
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.subscriptions = new Map()
  }

  /**
   * 动态加载依赖
   */
  async loadDependencies() {
    if (!this.Client || !this.SockJS) {
      const [{ Client }, SockJS] = await Promise.all([
        import('@stomp/stompjs'),
        import('sockjs-client')
      ])
      this.Client = Client
      this.SockJS = SockJS.default || SockJS
    }
  }

  /**
   * 连接 WebSocket
   * @param {string} url WebSocket 服务器地址
   * @param {Function} onConnected 连接成功回调
   * @param {Function} onError 连接错误回调
   * @param {string} token JWT token（可选）
   */
  async connect(url, onConnected, onError, token = null) {
    // 动态加载依赖
    await this.loadDependencies()

    // 如果提供了 token，添加到 URL 参数中
    const finalUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url

    this.client = new this.Client({
      // 使用 SockJS 作为传输方式
      webSocketFactory: () => new this.SockJS(finalUrl),

      // 连接头（可以在这里添加认证信息）
      connectHeaders: token ? {
        Authorization: `Bearer ${token}`
      } : {},

      // 心跳配置
      heartbeatIncoming: 10000, // 客户端接收心跳间隔
      heartbeatOutgoing: 10000, // 客户端发送心跳间隔

      // 重连配置
      reconnectDelay: this.reconnectDelay,

      // 调试日志
      debug: (str) => {
        if (import.meta.env.MODE === 'development') {
          console.log('[WebSocket Debug]', str)
        }
      },

      // 连接成功回调
      onConnect: (frame) => {
        console.log('[WebSocket] 连接成功', frame)
        this.connected = true
        this.reconnectAttempts = 0

        if (onConnected) {
          onConnected(frame)
        }
      },

      // 连接错误回调
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP 错误', frame)
        this.connected = false

        if (onError) {
          onError(frame)
        }
      },

      // WebSocket 错误回调
      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket 错误', event)
        this.connected = false

        if (onError) {
          onError(event)
        }
      },

      // 连接关闭回调
      onDisconnect: () => {
        this.connected = false
      }
    })

    // 激活连接
    this.client.activate()
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate()
      this.subscriptions.clear()
      this.connected = false
    }
  }

  /**
   * 订阅主题
   * @param {string} destination 订阅地址
   * @param {Function} callback 消息回调
   * @returns {string} 订阅ID
   */
  subscribe(destination, callback) {
    if (!this.client || !this.connected) {
      console.error('[WebSocket] 未连接，无法订阅')
      return null
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const body = JSON.parse(message.body)
        callback(body)
      } catch (error) {
        console.error('[WebSocket] 解析消息失败', error)
        callback(message.body)
      }
    })

    this.subscriptions.set(destination, subscription)
    return subscription.id
  }

  /**
   * 取消订阅
   * @param {string} destination 订阅地址
   */
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(destination)
    }
  }

  /**
   * 发送消息
   * @param {string} destination 目标地址
   * @param {object} body 消息体
   */
  send(destination, body = {}) {
    if (!this.client || !this.connected) {
      console.error('[WebSocket] 未连接，无法发送消息')
      return
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body)
    })
  }

  /**
   * 是否已连接
   */
  isConnected() {
    return this.connected
  }
}

// 导出单例
export default new WebSocketClient()
