<template>
  <div class="register-container">
    <!-- 左上角Logo -->
    <div class="top-logo">
      <AppLogo :clickable="false" />
    </div>

    <!-- 背景装饰和插画 - 参考图片风格 -->
    <div class="bg-decoration">
      <!-- 3D几何形状装饰 -->
      <div class="shape-3d shape-torus"></div>
      <div class="shape-3d shape-sphere"></div>
      <div class="shape-3d shape-cone-1"></div>
      <div class="shape-3d shape-cone-2"></div>
      
      <!-- 背景插画 - 浅蓝色风格 -->
      <div class="background-illustration">
        <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="skyBlueGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#B0D8FF" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#E0F2FF" stop-opacity="0.2" />
            </linearGradient>
            <linearGradient id="skyBlueGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#A8D5FF" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#D0EBFF" stop-opacity="0.15" />
            </linearGradient>
            <linearGradient id="skyBlueGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#9BCFFF" stop-opacity="0.28" />
              <stop offset="100%" stop-color="#C8E8FF" stop-opacity="0.18" />
            </linearGradient>
            <radialGradient id="sphereGrad" cx="50%" cy="50%">
              <stop offset="0%" stop-color="#B0D8FF" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#E0F2FF" stop-opacity="0.15" />
            </radialGradient>
          </defs>
              
              <!-- 简化的装饰图形 - 参考图片风格 -->
              <!-- 左侧圆形装饰 -->
              <circle cx="200" cy="150" r="100" fill="url(#sphereGrad)" opacity="0.4" />
              <circle cx="150" cy="600" r="80" fill="url(#skyBlueGrad1)" opacity="0.3" />
              
              <!-- 右侧圆形装饰 -->
              <circle cx="1000" cy="200" r="90" fill="url(#sphereGrad)" opacity="0.35" />
              <circle cx="1050" cy="650" r="95" fill="url(#skyBlueGrad2)" opacity="0.3" />
              
              <!-- 柔和的波浪装饰 -->
              <path d="M0,300 Q200,250 400,300 T800,300 T1200,300" 
                    stroke="url(#skyBlueGrad1)" stroke-width="6" fill="none" opacity="0.25" />
              <path d="M0,500 Q250,450 500,500 T1000,500 T1200,500" 
                    stroke="url(#skyBlueGrad2)" stroke-width="8" fill="none" opacity="0.2" />
              
              <!-- 柔和的几何形状 -->
              <ellipse cx="350" cy="450" rx="70" ry="50" fill="url(#skyBlueGrad1)" opacity="0.25" transform="rotate(-20 350 450)" />
              <ellipse cx="850" cy="550" rx="60" ry="40" fill="url(#skyBlueGrad2)" opacity="0.25" transform="rotate(25 850 550)" />
              
              <!-- 柔和的曲线装饰 -->
              <path d="M150 200 Q250 150, 350 200" 
                    stroke="url(#skyBlueGrad1)" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.3" />
              <path d="M950 250 Q1050 200, 1150 250" 
                    stroke="url(#skyBlueGrad2)" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.3" />
        </svg>
      </div>
    </div>

    <!-- 主体内容 - 居中卡片 -->
    <div class="register-main">
      <div class="register-card">
        <!-- Logo和标题 -->
        <div class="card-header">
          <div class="logo-container">
            <div class="logo-icon">D</div>
          </div>
        </div>

        <!-- 注册表单 -->
        <div class="card-body">
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
                placeholder="邮箱"
                size="large"
                clearable
              >
                <template #prefix-icon>
                  <t-icon name="mail" />
                </template>
              </t-input>
            </t-form-item>

            <t-form-item name="code" class="code-form-item">
              <div class="code-input-wrapper">
                <t-input
                  v-model="registerForm.code"
                  placeholder="验证码"
                  size="large"
                  clearable
                  class="code-input"
                >
                  <template #prefix-icon>
                    <t-icon name="lock-on" />
                  </template>
                </t-input>
                <t-button
                  theme="primary"
                  variant="outline"
                  :disabled="codeCountdown > 0 || codeLoading"
                  @click="handleSendCode"
                  :loading="codeLoading"
                  class="code-button"
                >
                  {{ codeCountdown > 0 ? `${codeCountdown}秒` : '获取验证码' }}
                </t-button>
              </div>
            </t-form-item>

            <t-form-item name="password">
              <t-input
                v-model="registerForm.password"
                :type="passwordVisible ? 'text' : 'password'"
                placeholder="密码（至少6位）"
                size="large"
                clearable
              >
                <template #prefix-icon>
                  <t-icon name="lock-on" />
                </template>
                <template #suffix-icon>
                  <t-icon :name="passwordVisible ? 'browse' : 'browse-off'" @click="togglePasswordVisibility" style="cursor: pointer;" />
                </template>
              </t-input>
            </t-form-item>

            <t-form-item name="confirmPassword">
              <t-input
                v-model="registerForm.confirmPassword"
                :type="confirmPasswordVisible ? 'text' : 'password'"
                placeholder="确认密码"
                size="large"
                clearable
              >
                <template #prefix-icon>
                  <t-icon name="lock-on" />
                </template>
                <template #suffix-icon>
                  <t-icon :name="confirmPasswordVisible ? 'browse' : 'browse-off'" @click="toggleConfirmPasswordVisibility" style="cursor: pointer;" />
                </template>
              </t-input>
            </t-form-item>

            <t-button
              theme="primary"
              size="large"
              :loading="loading"
              block
              @click="handleRegister"
              class="submit-btn"
            >
              注册
            </t-button>
          </t-form>
        </div>

        <!-- 底部登录链接 -->
        <div class="card-footer">
          <span class="footer-text">已有账号?</span>
          <t-link theme="primary" hover="color" @click="goToLogin">立即登录</t-link>
        </div>
      </div>
    </div>

    <!-- 注册成功引导弹窗 -->
    <div v-if="showSuccessModal" class="success-modal">
      <div class="success-dialog">
        <div class="success-title">注册成功</div>
        <div class="success-body">恭喜您，注册成功！是否现在前往登录页面？</div>
        <div class="success-actions">
          <t-button theme="default" variant="outline" @click="cancelGoLogin">稍后再去</t-button>
          <t-button theme="primary" @click="confirmGoLogin">去登录</t-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { register, sendVerificationCode } from '@/api/auth.js'
import tracking from '@/utils/tracking'
import AppLogo from '@/components/AppLogo.vue'

const router = useRouter()

const registerFormRef = ref(null)
const loading = ref(false)
const codeLoading = ref(false)
const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)
const codeCountdown = ref(0)

const registerForm = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (val) => {
  if (!val) {
    return { result: false, message: '请再次输入密码' }
  }
  if (val !== registerForm.password) {
    return { result: false, message: '两次输入的密码不一致' }
  }
  return { result: true }
}

const validateCode = (val) => {
  if (!val || !val.trim()) {
    return { result: false, message: '请输入验证码' }
  }
  if (!/^\d{6}$/.test(val.trim())) {
    return { result: false, message: '验证码为6位数字' }
  }
  return { result: true }
}

const registerRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入正确的邮箱格式' }
  ],
  code: [
    { required: true, message: '请输入验证码' },
    { validator: validateCode }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码长度至少6位' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码' },
    { validator: validateConfirmPassword }
  ]
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

const toggleConfirmPasswordVisibility = () => {
  confirmPasswordVisible.value = !confirmPasswordVisible.value
}

const handleSendCode = async () => {
  console.log('🔵 点击获取验证码按钮')
  
  // 检查邮箱是否为空
  const email = registerForm.email?.trim()
  console.log('🔵 邮箱值:', email)
  
  if (!email) {
    await MessagePlugin.warning('请输入邮箱')
    // 手动触发表单验证，显示错误提示
    try {
      await registerFormRef.value?.validate()
    } catch (e) {
      // 忽略验证错误，只是为了让错误提示显示出来
    }
    return
  }

  // 手动验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    await MessagePlugin.warning('请输入正确的邮箱格式')
    // 触发表单验证，显示错误提示
    try {
      await registerFormRef.value?.validate()
    } catch (e) {
      // 忽略验证错误
    }
    return
  }

  // 开始发送验证码
  console.log('🔵 开始发送验证码，邮箱:', email)
  codeLoading.value = true

  try {
    const response = await sendVerificationCode(email)
    console.log('✅ 验证码发送响应:', response)
    
    // 检查后端响应
    if (response && response.success === false) {
      // 后端返回失败，拦截器已经显示了错误消息
      console.log('❌ 后端返回失败')
      const errorMessage = response.message || '发送验证码失败'
      tracking.trackSendVerificationCode(email, false, errorMessage)
      return
    }
    
    // 发送成功
    console.log('✅ 验证码发送成功')

    tracking.trackSendVerificationCode(email, true, null)
    await MessagePlugin.success(response?.message || '验证码已发送，请查收邮箱')
    
    // 开始倒计时
    codeCountdown.value = 60
    const timer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('❌ 发送验证码异常:', error)
  } finally {
    codeLoading.value = false
  }
}

const handleRegister = async () => {
  // 先手动检查必填字段是否为空（双重保险）
  if (!registerForm.email || !registerForm.email.trim()) {
    await MessagePlugin.warning('请输入邮箱')
    return
  }
  if (!registerForm.code || !registerForm.code.trim()) {
    await MessagePlugin.warning('请输入验证码')
    return
  }
  if (!registerForm.password || !registerForm.password.trim()) {
    await MessagePlugin.warning('请输入密码')
    return
  }
  if (!registerForm.confirmPassword || !registerForm.confirmPassword.trim()) {
    await MessagePlugin.warning('请再次输入密码')
    return
  }

  // 表单验证
  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) {
      return
    }
  } catch (error) {
    // 验证失败，不发送请求
    return
  }

  // 验证通过后才发送请求
  loading.value = true
  const email = registerForm.email.trim()
  try {
    const response = await register({
      email: email,
      code: registerForm.code.trim(),
      password: registerForm.password
    })

    // 根据后端返回判断是否成功；只有 success === true 才显示引导弹窗
    if (response && response.success === true) {

      showSuccessModal.value = true
    } else {
      console.error(error)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

// modal state and handlers
const showSuccessModal = ref(false)
const confirmGoLogin = () => {
  showSuccessModal.value = false
  router.push('/login')
}
const cancelGoLogin = () => {
  showSuccessModal.value = false
}
</script>

<style scoped lang="scss">
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #E8F4FD 0%, #F0F8FF 50%, #FFFFFF 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;

  // 背景装饰和插画 - 参考图片风格
  .bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;

    // 3D几何形状装饰
    .shape-3d {
      position: absolute;
      filter: blur(40px);
      opacity: 0.4;
      animation: float 25s infinite ease-in-out;
      
      &.shape-torus {
        // 圆环（左侧）
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(176, 216, 255, 0.5) 0%, rgba(176, 216, 255, 0) 70%);
        border: 40px solid rgba(160, 200, 255, 0.3);
        border-radius: 50%;
        top: 15%;
        left: 8%;
        animation-delay: 0s;
      }
      
      &.shape-sphere {
        // 球体（右侧）
        width: 120px;
        height: 120px;
        background: radial-gradient(circle at 30% 30%, rgba(176, 216, 255, 0.6), rgba(224, 242, 255, 0.2));
        border-radius: 50%;
        top: 20%;
        right: 12%;
        animation-delay: 3s;
        box-shadow: 0 0 60px rgba(176, 216, 255, 0.4);
      }
      
      &.shape-cone-1 {
        // 三角锥（左下）
        width: 0;
        height: 0;
        border-left: 60px solid transparent;
        border-right: 60px solid transparent;
        border-bottom: 120px solid rgba(200, 220, 255, 0.35);
        bottom: 10%;
        left: 5%;
        animation-delay: 6s;
        filter: blur(30px);
      }
      
      &.shape-cone-2 {
        // 三角锥（右下）
        width: 0;
        height: 0;
        border-left: 70px solid transparent;
        border-right: 70px solid transparent;
        border-bottom: 140px solid rgba(180, 210, 255, 0.3);
        bottom: 8%;
        right: 8%;
        animation-delay: 9s;
        filter: blur(35px);
        transform: rotate(15deg);
      }
    }

    // 背景插画 - 浅蓝色风格
    .background-illustration {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.6;
      animation: fadeInIllustration 1.5s ease-out;

      svg {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  // 左上角Logo
  .top-logo {
    position: absolute;
    top: 24px;
    left: 24px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    .logo-icon-wrapper {
      flex-shrink: 0;
      
      svg {
        display: block;
        filter: drop-shadow(0 2px 4px rgba(0, 82, 217, 0.2));
      }
    }

    .logo-text-wrapper {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .logo-title {
        font-size: 18px;
        font-weight: 600;
        color: #1d1d1f;
        line-height: 1.2;
        letter-spacing: 0.01em;
      }

      .logo-subtitle {
        font-size: 14px;
        font-weight: 500;
        color: #86868b;
        line-height: 1.2;
        letter-spacing: 0.5px;
      }
    }
    /* hide AppLogo text (keep only the mark) */
    :deep(.logo-text-svg) {
      display: none !important;
    }
  }

  // 主体内容 - 居中卡片
  .register-main {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
    animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    .register-card {
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05);
      padding: 48px 40px;
      border: 1px solid rgba(0, 0, 0, 0.06);

      // Logo和标题区域
      .card-header {
        text-align: center;
        margin-bottom: 36px;

        .logo-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #0052d9 0%, #3e7dff 100%);
          border-radius: 16px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0, 82, 217, 0.2);

          .logo-icon {
            font-size: 32px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.02em;
          }
        }
      }

      // 表单区域
      .card-body {
        .register-form {
          :deep(.t-form-item) {
            margin-bottom: 20px;

            &:last-of-type {
              margin-bottom: 0;
            }
          }

          :deep(.t-input) {
            height: 48px;
            border-radius: 12px !important;
            border-color: rgba(0, 0, 0, 0.1);
            background: #f5f5f7;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

            &:hover {
              border-color: rgba(0, 0, 0, 0.15);
              background: #ffffff;
            }

            &:focus-within {
              border-color: #0052d9;
              background: #ffffff;
              box-shadow: 0 0 0 3px rgba(0, 82, 217, 0.1);
            }
            
            .t-input__inner {
              border-radius: 12px !important;
            }
            
            .t-input__wrap {
              border-radius: 12px !important;
            }

            input {
              font-size: 15px;
              color: #1d1d1f;
            }

            input::placeholder {
              color: #86868b;
            }

            .t-input__prefix {
              color: #86868b;
            }

            .t-input__suffix {
              color: #86868b;
              cursor: pointer;
            }
          }

          // 验证码输入框特殊样式
          .code-form-item {
            :deep(.t-form-item__content) {
              margin: 0;
            }
          }

          .code-input-wrapper {
            display: flex;
            gap: 12px;
            align-items: flex-start;

            .code-input {
              flex: 1;
              
              :deep(.t-input) {
                margin-bottom: 0;
              }
            }

            .code-button {
              flex-shrink: 0;
              height: 48px;
              min-width: 120px;
              border-radius: 12px !important;
              font-size: 14px;
              font-weight: 500;
              border-color: #0052d9 !important;
              color: #0052d9 !important;
              background: #ffffff !important;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              white-space: nowrap;

              &:hover:not(:disabled) {
                background: #0052d9 !important;
                color: #ffffff !important;
                border-color: #0052d9 !important;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 82, 217, 0.25);
              }

              &:active:not(:disabled) {
                transform: translateY(0);
                background: #003d9f !important;
                border-color: #003d9f !important;
              }

              &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background: #f5f5f7 !important;
                border-color: rgba(0, 0, 0, 0.1) !important;
                color: #86868b !important;
              }

              :deep(.t-button) {
                border-radius: 12px !important;
                background: inherit !important;
                border-color: inherit !important;
                color: inherit !important;
              }

              :deep(.t-button__text) {
                border-radius: 12px !important;
                color: inherit !important;
              }

              :deep(.t-button:hover:not(:disabled)) {
                background: #0052d9 !important;
                color: #ffffff !important;
                border-color: #0052d9 !important;
              }
            }
          }

          .submit-btn {
            height: 48px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 12px !important;
            background: #0052d9;
            border: none;
            margin-top: 30px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

            &:hover:not(:disabled) {
              background: #003d9f;
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(0, 82, 217, 0.3);
            }

            &:active:not(:disabled) {
              transform: translateY(0);
            }
            
            :deep(.t-button) {
              border-radius: 12px !important;
            }
            
            :deep(.t-button__text) {
              border-radius: 12px !important;
            }
          }
        }
      }

      // 底部登录链接
      .card-footer {
        margin-top: 25px;
        text-align: center;
        padding-top: 24px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);

        .footer-text {
          font-size: 14px;
          color: #86868b;
          margin-right: 4px;
        }

        :deep(.t-link) {
          font-size: 14px;
          color: #0052d9;
          font-weight: 500;
        }
      }
    }
  }
}

/* success modal styles */
.success-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
}
.success-dialog {
  background: #fff;
  border-radius: 12px;
  padding: 20px 22px;
  width: 360px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  text-align: center;
}
.success-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}
.success-body {
  color: #555;
  margin-bottom: 16px;
}
.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

// 动画定义
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(5deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(-5deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInIllustration {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.6;
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .register-container {
    padding: 16px;

    .top-logo {
      top: 16px;
      left: 16px;
      gap: 10px;

      .logo-icon-wrapper {
        svg {
          width: 36px;
          height: 36px;
        }
      }

      .logo-text-wrapper {
        .logo-title {
          font-size: 16px;
        }

        .logo-subtitle {
          font-size: 13px;
        }
      }
    }

    .register-main {
      .register-card {
        padding: 40px 32px;

        .card-header {
          margin-bottom: 28px;

          .logo-container {
            width: 56px;
            height: 56px;
            margin-bottom: 16px;

            .logo-icon {
              font-size: 28px;
            }
          }
        }

        .card-body {
          .register-form {
            .code-input-wrapper {
              flex-direction: column;
              gap: 12px;

              .code-button {
                width: 100%;
                min-width: auto;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 12px;

    .top-logo {
      top: 12px;
      left: 12px;
      gap: 8px;

      .logo-icon-wrapper {
        svg {
          width: 32px;
          height: 32px;
        }
      }

      .logo-text-wrapper {
        .logo-title {
          font-size: 15px;
        }

        .logo-subtitle {
          font-size: 12px;
        }
      }
    }

    .register-main {
      .register-card {
        padding: 32px 24px;
        border-radius: 12px;
      }
    }
  }
}
</style>

