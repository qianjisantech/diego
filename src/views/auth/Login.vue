<template>
  <div class="login-container">
    <!-- 装饰性背景图形 -->
    <div class="bg-decoration">
      <div class="bubble bubble-1"></div>
      <div class="bubble bubble-2"></div>
      <div class="bubble bubble-3"></div>
      <div class="bubble bubble-4"></div>
      <div class="bubble bubble-5"></div>
    </div>

    <!-- 顶部导航 -->
    <TopHeader :is-logged-in="false" />

    <!-- 主体内容 -->
    <div class="login-main">
      <!-- 左侧插画区域 -->
      <div class="illustration-section">
        <div class="illustration-content">
          <h1 class="illustration-title">欢迎使用 Diego</h1>

          <!-- SVG 插画 -->
          <svg class="illustration-svg" viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景元素 -->
            <circle cx="300" cy="250" r="200" fill="url(#gradient1)" opacity="0.1"/>
            <circle cx="450" cy="150" r="80" fill="url(#gradient2)" opacity="0.08"/>
            <circle cx="150" cy="350" r="60" fill="url(#gradient3)" opacity="0.08"/>

            <!-- 主要人物 - 团队协作 -->
            <!-- 人物1 - 左侧 -->
            <g class="person person-1">
              <!-- 身体 -->
              <ellipse cx="200" cy="380" rx="45" ry="15" fill="#E3F2FD" opacity="0.6"/>
              <path d="M 200 280 Q 200 320 200 360" stroke="#0052D9" stroke-width="8" stroke-linecap="round" fill="none"/>
              <!-- 头部 -->
              <circle cx="200" cy="260" r="25" fill="#FFF3E0"/>
              <!-- 头发 -->
              <path d="M 185 250 Q 200 235 215 250" fill="#2C3E50" stroke="#2C3E50" stroke-width="2"/>
              <!-- 手臂 - 指向看板 -->
              <path d="M 200 300 Q 220 310 250 300" stroke="#0052D9" stroke-width="6" stroke-linecap="round" fill="none"/>
              <circle cx="250" cy="300" r="8" fill="#FFA726"/>
            </g>

            <!-- 人物2 - 右侧 -->
            <g class="person person-2">
              <!-- 身体 -->
              <ellipse cx="400" cy="380" rx="45" ry="15" fill="#E8F5E9" opacity="0.6"/>
              <path d="M 400 290 Q 400 330 400 360" stroke="#4CAF50" stroke-width="8" stroke-linecap="round" fill="none"/>
              <!-- 头部 -->
              <circle cx="400" cy="270" r="25" fill="#FFF3E0"/>
              <!-- 头发 -->
              <path d="M 385 260 Q 400 245 415 260" fill="#5D4037" stroke="#5D4037" stroke-width="2"/>
              <!-- 手臂 - 拿着文档 -->
              <path d="M 400 310 Q 380 320 370 340" stroke="#4CAF50" stroke-width="6" stroke-linecap="round" fill="none"/>
              <!-- 文档 -->
              <rect x="355" y="335" width="30" height="40" rx="3" fill="#FFF" stroke="#4CAF50" stroke-width="2"/>
              <line x1="360" y1="345" x2="380" y2="345" stroke="#4CAF50" stroke-width="2"/>
              <line x1="360" y1="355" x2="380" y2="355" stroke="#4CAF50" stroke-width="2"/>
              <line x1="360" y1="365" x2="375" y2="365" stroke="#4CAF50" stroke-width="2"/>
            </g>

            <!-- 看板/任务板 -->
            <g class="kanban-board">
              <!-- 看板背景 -->
              <rect x="220" y="150" width="160" height="200" rx="10" fill="#FFF" stroke="#E0E0E0" stroke-width="2"/>

              <!-- 看板标题 -->
              <text x="300" y="175" text-anchor="middle" fill="#0052D9" font-size="14" font-weight="600">我的事项</text>
              <line x1="230" y1="185" x2="370" y2="185" stroke="#E0E0E0" stroke-width="2"/>

              <!-- 任务卡片1 -->
              <rect x="235" y="200" width="140" height="35" rx="5" fill="#E3F2FD" stroke="#0052D9" stroke-width="1.5"/>
              <circle cx="245" cy="217.5" r="4" fill="#4CAF50"/>
              <line x1="255" y1="210" x2="365" y2="210" stroke="#0052D9" stroke-width="1.5"/>
              <line x1="255" y1="220" x2="340" y2="220" stroke="#0052D9" stroke-width="1"/>

              <!-- 任务卡片2 -->
              <rect x="235" y="245" width="140" height="35" rx="5" fill="#FFF3E0" stroke="#FF9800" stroke-width="1.5"/>
              <circle cx="245" cy="262.5" r="4" fill="#FFC107"/>
              <line x1="255" y1="255" x2="365" y2="255" stroke="#FF9800" stroke-width="1.5"/>
              <line x1="255" y1="265" x2="330" y2="265" stroke="#FF9800" stroke-width="1"/>

              <!-- 任务卡片3 -->
              <rect x="235" y="290" width="140" height="35" rx="5" fill="#E8F5E9" stroke="#4CAF50" stroke-width="1.5"/>
              <circle cx="245" cy="307.5" r="4" fill="#00BCD4"/>
              <line x1="255" y1="300" x2="365" y2="300" stroke="#4CAF50" stroke-width="1.5"/>
              <line x1="255" y1="310" x2="350" y2="310" stroke="#4CAF50" stroke-width="1"/>
            </g>

            <!-- 装饰元素 -->
            <!-- 对勾图标 -->
            <g class="check-icon floating-element">
              <circle cx="480" cy="200" r="20" fill="#4CAF50" opacity="0.9"/>
              <path d="M 472 200 L 477 206 L 488 193" stroke="#FFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </g>

            <!-- 齿轮图标 -->
            <g class="gear-icon floating-element">
              <circle cx="120" cy="180" r="18" fill="#FF9800" opacity="0.9"/>
              <circle cx="120" cy="180" r="10" fill="#FFF" opacity="0.3"/>
              <rect x="114" y="162" width="12" height="6" rx="2" fill="#FF9800"/>
              <rect x="114" y="192" width="12" height="6" rx="2" fill="#FF9800"/>
              <rect x="102" y="174" width="6" height="12" rx="2" fill="#FF9800"/>
              <rect x="132" y="174" width="6" height="12" rx="2" fill="#FF9800"/>
            </g>

            <!-- 星星 -->
            <g class="star-icon floating-element">
              <path d="M 500 320 L 505 330 L 516 332 L 508 340 L 510 351 L 500 345 L 490 351 L 492 340 L 484 332 L 495 330 Z" fill="#FFC107"/>
            </g>

            <!-- 渐变定义 -->
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0052D9"/>
                <stop offset="100%" stop-color="#00BCD4"/>
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FF9800"/>
                <stop offset="100%" stop-color="#FFC107"/>
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4CAF50"/>
                <stop offset="100%" stop-color="#8BC34A"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <!-- 右侧登录区域 -->
      <div class="login-box">
        <!-- 登录卡片 -->
        <div class="login-card">
          <!-- Tab切换 -->
          <t-tabs v-model="activeTab" class="login-tabs" size="large">
            <!-- 登录Tab -->
            <t-tab-panel value="login" label="登录">
              <div class="tab-content">
                <t-form
                  ref="loginFormRef"
                  :data="loginForm"
                  :rules="loginRules"
                  class="login-form"
                  label-width="0"
                >
                  <t-form-item name="username">
                    <t-input
                      v-model="loginForm.username"
                      placeholder="邮箱"
                      size="large"
                      clearable
                    >
                      <template #prefix-icon>
                        <t-icon name="user" />
                      </template>
                    </t-input>
                  </t-form-item>

                  <t-form-item name="password">
                    <t-input
                      v-model="loginForm.password"
                      type="password"
                      placeholder="请输入密码"
                      size="large"
                      clearable
                    >
                      <template #prefix-icon>
                        <t-icon name="lock-on" />
                      </template>
                    </t-input>
                  </t-form-item>

                  <div class="form-options">
                    <t-checkbox v-model="loginForm.remember">记住我</t-checkbox>
                    <t-link theme="primary" hover="color">忘记密码？</t-link>
                  </div>

                  <t-button
                    theme="primary"
                    size="large"
                    :loading="loading"
                    block
                    @click="handleLogin"
                    class="submit-btn"
                  >
                    登录
                  </t-button>
                </t-form>
              </div>
            </t-tab-panel>

            <!-- 注册Tab -->
            <t-tab-panel value="register" label="注册">
              <div class="tab-content">
                <t-form
                  ref="registerFormRef"
                  :data="registerForm"
                  :rules="registerRules"
                  class="register-form"
                  label-width="0"
                >
                  <t-form-item name="email">
                    <t-input
                      v-model="registerForm.email"
                      placeholder="请输入邮箱"
                      size="large"
                      clearable
                    >
                      <template #prefix-icon>
                        <t-icon name="mail" />
                      </template>
                    </t-input>
                  </t-form-item>

                  <t-form-item name="code">
                    <t-input
                      v-model="registerForm.code"
                      placeholder="请输入验证码"
                      size="large"
                      maxlength="6"
                      clearable
                    >
                      <template #prefix-icon>
                        <t-icon name="secured" />
                      </template>
                      <template #suffix>
                        <t-button
                          variant="text"
                          :disabled="registerCountdown > 0"
                          @click="sendEmailCode"
                          class="code-btn"
                        >
                          {{ registerCountdown > 0 ? `${registerCountdown}s后重发` : '获取验证码' }}
                        </t-button>
                      </template>
                    </t-input>
                  </t-form-item>

                  <t-form-item name="password">
                    <t-input
                      v-model="registerForm.password"
                      type="password"
                      placeholder="请设置密码（6-20位）"
                      size="large"
                      clearable
                    >
                      <template #prefix-icon>
                        <t-icon name="lock-on" />
                      </template>
                    </t-input>
                  </t-form-item>

                  <t-form-item name="confirmPassword">
                    <t-input
                      v-model="registerForm.confirmPassword"
                      type="password"
                      placeholder="请再次输入密码"
                      size="large"
                      clearable
                    >
                      <template #prefix-icon>
                        <t-icon name="lock-on" />
                      </template>
                    </t-input>
                  </t-form-item>

                  <t-button
                    theme="primary"
                    size="large"
                    :loading="registerLoading"
                    block
                    class="submit-btn"
                    @click="handleRegister"
                  >
                    注册
                  </t-button>
                </t-form>
              </div>
            </t-tab-panel>
          </t-tabs>

          <!-- 底部链接 -->
          <div class="card-footer">
            <t-link theme="default" hover="color" size="small">用户协议</t-link>
            <span class="separator">|</span>
            <t-link theme="default" hover="color" size="small">隐私政策</t-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="login-footer">
      <div class="footer-content">
        <p>© 2025-2025 Diego. All Rights Reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useUserStore } from '@/store/user.js'
import { sendVerificationCode, register } from '@/api/auth.js'
import tracking from '@/utils/tracking'
import TopHeader from '@/components/TopHeader.vue'

const router = useRouter()
const route = useRoute()
const authStore = useUserStore()

const activeTab = ref('login')
const loginFormRef = ref(null)
const registerFormRef = ref(null)
const loading = ref(false)
const registerLoading = ref(false)
const registerCountdown = ref(0)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const registerForm = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入邮箱/手机号' }],
  password: [{ required: true, message: '请输入密码' }]
}

const registerRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入正确的邮箱格式' }
  ],
  code: [
    { required: true, message: '请输入验证码' },
    { len: 6, message: '验证码长度为6位' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码长度不能少于6位' },
    { max: 20, message: '密码长度不能超过20位' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码' },
    {
      validator: (val) => val === registerForm.password,
      message: '两次输入的密码不一致'
    }
  ]
}

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
      remember: loginForm.remember
    })

    // 登录成功埋点
    tracking.trackLogin(loginForm.username)

    MessagePlugin.success('登录成功')

    const redirect = route.query.redirect || '/home'
    router.push(redirect)
  } catch (error) {
    MessagePlugin.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 发送邮箱验证码
const sendEmailCode = async () => {
  // 只校验邮箱字段
  try {
    const result = await registerFormRef.value.validate({ fields: ['email'] })
    if (result !== true) {
      return
    }
  } catch (error) {
    // 校验失败
    return
  }

  try {
    const res = await sendVerificationCode(registerForm.email)
    if (res.success || res.code === 200) {
      MessagePlugin.success('验证码已发送，请查收邮箱')

      // 开始倒计时
      registerCountdown.value = 60
      const timer = setInterval(() => {
        registerCountdown.value--
        if (registerCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      MessagePlugin.error(res.message || '发送失败')
    }
  } catch (error) {
    MessagePlugin.error('发送验证码失败')
  }
}

// 注册
const handleRegister = async () => {
  const valid = await registerFormRef.value.validate()
  if (!valid) return

  registerLoading.value = true
  try {
    const res = await register({
      email: registerForm.email,
      code: registerForm.code,
      password: registerForm.password
    })

    if (res.success || res.code === 200) {
      MessagePlugin.success('注册成功，请登录')
      activeTab.value = 'login'
      // 清空注册表单
      registerForm.email = ''
      registerForm.code = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
    } else {
      MessagePlugin.error(res.message || '注册失败')
    }
  } catch (error) {
    MessagePlugin.error(error.message || '注册失败')
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3f7ff 50%, #f9fbff 100%);
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;

  // 背景装饰
  .bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;

    .bubble {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      animation: float 20s infinite ease-in-out;

      &.bubble-1 {
        width: 300px;
        height: 300px;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
        animation-duration: 25s;
      }

      &.bubble-2 {
        width: 200px;
        height: 200px;
        top: 60%;
        left: 80%;
        animation-delay: 2s;
        animation-duration: 20s;
      }

      &.bubble-3 {
        width: 150px;
        height: 150px;
        top: 30%;
        left: 85%;
        animation-delay: 4s;
        animation-duration: 22s;
      }

      &.bubble-4 {
        width: 250px;
        height: 250px;
        top: 70%;
        left: 5%;
        animation-delay: 1s;
        animation-duration: 28s;
      }

      &.bubble-5 {
        width: 180px;
        height: 180px;
        top: 15%;
        left: 50%;
        animation-delay: 3s;
        animation-duration: 24s;
      }
    }
  }

  // 主体内容
  .login-main {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 60px;
    padding-top: 80px; // 为顶部导航留出空间 (64px + 16px)
    padding-bottom: 20px; // 为底部留出空间
    gap: 60px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    min-height: 0; // 允许flex子项收缩
    overflow: visible; // 允许内容可见

    // 左侧插画区域
    .illustration-section {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 600px;

      .illustration-content {
        width: 100%;

        .illustration-title {
          font-size: 42px;
          font-weight: 700;
          color: #1f2329;
          margin: 0 0 12px 0;
          background: linear-gradient(135deg, #0052D9 0%, #00BCD4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: slideInLeft 0.8s ease-out;
        }

        .illustration-subtitle {
          font-size: 18px;
          color: #646a73;
          margin: 0 0 32px 0;
          animation: slideInLeft 0.8s ease-out 0.2s both;
        }

        .illustration-svg {
          width: 100%;
          max-height: 400px;
          height: auto;
          margin-bottom: 24px;
          animation: slideInLeft 0.8s ease-out 0.4s both;

          // SVG 动画
          .person {
            animation: bounce 3s ease-in-out infinite;
          }

          .person-1 {
            animation-delay: 0s;
          }

          .person-2 {
            animation-delay: 0.5s;
          }

          .floating-element {
            animation: float 4s ease-in-out infinite;
          }

          .check-icon {
            animation-delay: 0s;
          }

          .gear-icon {
            animation-delay: 1s;
          }

          .star-icon {
            animation-delay: 2s;
          }

          .kanban-board {
            animation: fadeIn 1s ease-out 0.6s both;
          }
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: slideInLeft 0.8s ease-out 0.6s both;

          .feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 15px;
            color: #646a73;
            transition: transform 0.3s ease;

            svg {
              flex-shrink: 0;
            }

            &:hover {
              transform: translateX(8px);
            }
          }
        }
      }
    }

    // 右侧登录区域
    .login-box {
      width: 100%;
      max-width: 480px;
      flex-shrink: 0;

      .login-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        box-shadow: none;
        padding: 40px 48px 36px;
        border: 1px solid rgba(255, 255, 255, 0.5);
        animation: slideIn 0.6s ease-out;

        .login-tabs {
          :deep(.t-tabs__nav-container) {
            margin-bottom: 28px;
          }

          :deep(.t-tabs__nav) {
            width: 100%;
            justify-content: center;
          }

          :deep(.t-tabs__nav-item) {
            font-size: 18px;
            font-weight: 600;
            padding: 12px 48px;
          }

          :deep(.t-tabs__nav-item-wrapper) {
            justify-content: center;
          }

          .tab-content {
            .login-form,
            .register-form {
              :deep(.t-form-item) {
                margin-bottom: 20px;
              }

              :deep(.t-input) {
                height: 52px;
                border-radius: 8px;
                transition: all 0.3s ease;

                &:hover {
                  border-color: #0052d9;
                  box-shadow: 0 0 0 2px rgba(0, 82, 217, 0.1);
                }

                &:focus-within {
                  border-color: #0052d9;
                  box-shadow: 0 0 0 3px rgba(0, 82, 217, 0.15);
                  transform: translateY(-2px);
                }

                input {
                  font-size: 15px;
                }
              }

              .form-options {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;

                :deep(.t-checkbox) {
                  font-size: 14px;
                  color: #646a73;
                }

                :deep(.t-link) {
                  font-size: 14px;
                }
              }

              .code-btn {
                white-space: nowrap;
                padding: 0 8px;
                font-size: 13px;
                color: #0052d9;

                &:disabled {
                  color: #bbb;
                }
              }

              .submit-btn {
                height: 52px;
                font-size: 16px;
                font-weight: 600;
                margin-top: 12px;
                border-radius: 8px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;

                &:hover:not(:disabled) {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(0, 82, 217, 0.4);
                }

                &:active:not(:disabled) {
                  transform: translateY(0);
                }
              }
            }
          }
        }

        .card-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e7e7e7;
          text-align: center;

          :deep(.t-link) {
            font-size: 13px;
            color: #646a73;
          }

          .separator {
            margin: 0 12px;
            color: #dcdcdc;
          }
        }
      }
    }
  }

  // 底部版权
  .login-footer {
    min-height: 60px;
    padding: 20px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    margin-top: auto;

    .footer-content {
      text-align: center;

      p {
        margin: 0;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.6);
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
      }
    }
  }
}

// 动画定义
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: translate(30px, -30px) scale(1.1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
    opacity: 0.3;
  }
  75% {
    transform: translate(40px, 10px) scale(1.05);
    opacity: 0.4;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 响应式适配
// 平板及以下 (1024px)
@media (max-width: 1024px) {
  .login-container {
    .login-main {
      gap: 40px;
      padding: 40px 40px;

      .illustration-section {
        .illustration-content {
          .illustration-title {
            font-size: 36px;
          }

          .illustration-subtitle {
            font-size: 18px;
            margin-bottom: 32px;
          }

          .illustration-svg {
            margin-bottom: 32px;
          }
        }
      }
    }
  }
}

// 移动端 (768px)
@media (max-width: 768px) {
  .login-container {
    .bg-decoration {
      .bubble {
        &.bubble-1 {
          width: 200px;
          height: 200px;
        }

        &.bubble-2, &.bubble-3 {
          display: none;
        }

        &.bubble-4 {
          width: 150px;
          height: 150px;
        }

        &.bubble-5 {
          width: 120px;
          height: 120px;
        }
      }
    }

    .login-main {
      flex-direction: column;
      padding: 20px 16px;
      gap: 32px;

      // 移动端隐藏插画
      .illustration-section {
        display: none;
      }

      .login-box {
        max-width: 100%;

        .login-card {
          padding: 32px 24px;
          border-radius: 16px;

          .login-tabs {
            :deep(.t-tabs__nav-item) {
              font-size: 16px;
              padding: 10px 32px;
            }
          }
        }
      }
    }
  }
}

// 大屏展示优化 (1200px+)
@media (min-width: 1200px) {
  .login-container {
    .login-main {
      gap: 100px;

      .illustration-section {
        .illustration-content {
          .illustration-title {
            font-size: 52px;
          }

          .illustration-subtitle {
            font-size: 22px;
          }
        }
      }
    }
  }
}
</style>
