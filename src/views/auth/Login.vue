<template>
  <div class="login-container">
    <!-- 左上角Logo -->
    <div class="top-logo">
      <div class="logo-icon-wrapper">
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="10" fill="url(#topLogoGradient)"/>
          <path d="M14 12 L14 36" stroke="white" stroke-width="3" stroke-linecap="round"/>
          <path d="M14 12 C14 12, 28 12, 28 24 C28 36, 14 36, 14 36"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
                fill="none"/>
          <circle cx="20" cy="18" r="1.5" fill="white" opacity="0.9"/>
          <line x1="23" y1="18" x2="30" y2="18" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>
          <circle cx="20" cy="24" r="1.5" fill="white" opacity="0.9"/>
          <line x1="23" y1="24" x2="28" y2="24" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>
          <circle cx="20" cy="30" r="1.5" fill="white" opacity="0.9"/>
          <line x1="23" y1="30" x2="30" y2="30" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>
          <path d="M33 14 L35 16 L39 11"
                stroke="#4CAF50"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
                opacity="0.95"/>
          <defs>
            <linearGradient id="topLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0052D9"/>
              <stop offset="50%" stop-color="#0066FF"/>
              <stop offset="100%" stop-color="#0080FF"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="logo-text-wrapper">
        <div class="logo-title">需求管控系统</div>
        <div class="logo-subtitle">Diego</div>
      </div>
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
    <div class="login-main">
      <div class="login-card">
        <!-- 登录表单 -->
        <div class="card-body">
          <!-- 标题文字 -->
          <div class="login-title">
            <h2 class="title-text">登录以继续使用</h2>
          </div>

          <!-- 登录方式 Tab -->
          <t-tabs
            v-model="loginType"
            theme="normal"
            class="login-tabs"
          >
            <t-tab-panel value="email" label="邮箱登录" />
          </t-tabs>

          <t-form
            ref="loginFormRef"
            :data="loginForm"
            :rules="loginRules"
            class="login-form"
            label-width="0"
          >
            <t-form-item name="email">
              <t-input
                v-model="loginForm.email"
                placeholder="邮箱"
                size="large"
                clearable
              >
                <template #prefix-icon>
                  <t-icon name="mail" />
                </template>
              </t-input>
            </t-form-item>

            <t-form-item name="password">
              <t-input
                v-model="loginForm.password"
                :type="passwordVisible ? 'text' : 'password'"
                placeholder="密码"
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

            <div class="form-options">
              <t-checkbox v-model="loginForm.remember">记住我</t-checkbox>
              <t-link theme="primary" hover="color">忘记密码?</t-link>
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

        <!-- 底部注册链接 -->
        <div class="card-footer">
          <span class="footer-text">还没有账号?</span>
          <t-link theme="primary" hover="color" @click="goToRegister">立即注册</t-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useUserStore } from '@/store/user.js'
import tracking from '@/utils/tracking'

const router = useRouter()
const route = useRoute()
const authStore = useUserStore()

// 登录方式
const loginType = ref('email')

// 表单引用和状态
const loginFormRef = ref(null)
const loading = ref(false)
const passwordVisible = ref(false)

const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入正确的邮箱格式' }
  ],
  password: [{ required: true, message: '请输入密码' }]
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await authStore.login({
      email: loginForm.email,
      password: loginForm.password,
      remember: loginForm.remember
    })

    // 登录成功埋点
    tracking.trackLogin(loginForm.email)

    const redirect = route.query.redirect || '/home'
    await router.push(redirect)
  } catch (error) {
    await MessagePlugin.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped lang="scss">
.login-container {
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
  }

  // 主体内容 - 居中卡片
  .login-main {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
    animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    .login-card {
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05);
      padding: 48px 40px;
      border: 1px solid rgba(0, 0, 0, 0.06);


      .hero-illustration {
        width: 100%;
        margin: 0 auto 24px;
        display: flex;
        justify-content: center;

        svg {
          width: 100%;
          max-width: 320px;
          height: auto;
          display: block;
        }
      }

      // 表单区域
      .card-body {
        .login-title {
          margin-bottom: 24px;
          text-align: center;

          .title-text {
            font-size: 24px;
            font-weight: 600;
            color: #1d1d1f;
            margin: 0;
            letter-spacing: -0.01em;
          }
        }

        .login-tabs {
          margin-bottom: 24px;
          
          :deep(.t-tabs__nav) {
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            padding: 0;
          }
          
          :deep(.t-tabs__tab) {
            font-size: 15px;
            font-weight: 500;
            color: #86868b;
            padding: 12px 20px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            
            &:hover {
              color: #0052d9;
            }
          }
          
          :deep(.t-tabs__tab--active) {
            color: #0052d9;
            font-weight: 600;
          }
          
          :deep(.t-tabs__bar) {
            background: #0052d9;
            height: 2px;
            border-radius: 1px;
          }
          
          :deep(.t-tabs__content) {
            display: none;
          }
        }

        .login-form {
          :deep(.t-form-item) {
            margin-bottom: 20px;
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

          .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;

            :deep(.t-checkbox) {
              font-size: 14px;
              color: #1d1d1f;

              .t-checkbox__label {
                color: #1d1d1f;
              }
            }

            :deep(.t-link) {
              font-size: 14px;
              color: #0052d9;
              font-weight: 500;
            }
          }

          .submit-btn {
            height: 48px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 12px !important;
            background: #0052d9;
            border: none;
            margin-bottom: 12px;
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

      // 底部注册链接
      .card-footer {
        margin-top: 32px;
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
    opacity: 0.85;
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
  .login-container {
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

    .login-main {
      .login-card {
        padding: 40px 32px;
      }
    }
  }
}

@media (max-width: 480px) {
  .login-container {
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

    .login-main {
      .login-card {
        padding: 32px 24px;
        border-radius: 12px;
      }
    }
  }
}
</style>
