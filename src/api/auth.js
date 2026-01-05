import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request({
    url: '/auth/profile',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}



/**
 * 发送邮箱验证码
 * @param {string} email - 邮箱地址
 */
export function sendVerificationCode(email) {
  return request({
    url: '/auth/send-code',
    method: 'post',
    data: { email }
  })
}

/**
 * 用户注册
 * @param {object} data - 注册数据
 * @param {string} data.email - 邮箱
 * @param {string} data.code - 验证码
 * @param {string} data.password - 密码
 */
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}
