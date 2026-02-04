import request from '@/utils/request.js'
import {AuthApi} from "@/api/auth/index.js";
export function login(data) {
  return request({
    url: AuthApi+'/auth/login',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request({
    url: AuthApi+'/profile',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: AuthApi+'/auth/logout',
    method: 'post'
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
    url: AuthApi+'/auth/register',
    method: 'post',
    data
  })
}
