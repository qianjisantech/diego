import request from '@/utils/request.js'
import { getUserInfo } from '@/api/auth/auth.js'
import {EnterpriseApi} from "@/api/enterprise/index.js";


/**
 * 获取企业列表（分页）
 * @param {object} data - 查询参数
 * @returns {Promise}
 */
export function getEnterpriseListPage(data) {
  return request({
    url: EnterpriseApi+'/enterprise/page',
    method: 'post',
    data,
    showLoading: true,
    loadingText: '正在加载企业列表...'
  })
}

/**
 * 获取企业列表（全部）
 * @returns {Promise}
 */
export async function getEnterpriseList() {
  return request({
    url: EnterpriseApi+ `/console/self/enterprises`,
    method: 'get'
  })
}

/**
 * 获取当前用户所属企业（自助接口，例如 /self/enterprises）
 * @returns {Promise}
 */
export function getSelfEnterprises() {
  return request({
    url:  EnterpriseApi+`/console/self/enterprises`,
    method: 'get'
  })
}



/**
 * 更新企业
 * @param {number} id - 企业ID
 * @param {object} data - 企业数据
 * @returns {Promise}
 */
export function updateEnterprise(id, data) {
  return request({
    url:EnterpriseApi+ `/enterprise/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除企业
 * @param {number} id - 企业ID
 * @returns {Promise}
 */
export function deleteEnterprise(id) {
  return request({
    url: EnterpriseApi+`/enterprise/${id}`,
    method: 'delete'
  })
}

/**
 * 获取企业详情
 * @param {number} id - 企业ID
 * @returns {Promise}
 */
export function getEnterprise(id) {
  return request({
    url: EnterpriseApi+`/enterprise/${id}`,
    method: 'get'
  })
}

/**
 * 获取企业邀请信息（用于邀请链接页面展示）
 * @param {number|string} EnterpriseId
 * @returns {Promise}
 */
export function getInviteInfo(EnterpriseId) {
  return request({
    url: `/console/self/Enterprise/invite/info/${EnterpriseId}`,
    method: 'get'
  })
}

/**
 * 根据用户ID获取企业列表
 * @param {number|string} ownerId - 用户ID
 * @returns {Promise}
 */
export function getEnterpriseListByOwner(ownerId) {
  return request({
    url: `/enterprise/owner/${ownerId}`,
    method: 'get'
  })
}


/**
 * 获取企业成员列表（分页）
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export function getEnterpriseMemberPage(params) {
  return request({
    url: '/Enterprise/member/page',
    method: 'post',
    data: params
  })
}

/**
 * 添加企业成员
 * @param {object} data - 成员数据
 * @returns {Promise}
 */
export function addEnterpriseMember(data) {
  return request({
    url: '/Enterprise/member',
    method: 'post',
    data
  })
}

/**
 * 更新企业成员
 * @param {number} id - 成员ID
 * @param {object} data - 成员数据
 * @returns {Promise}
 */
export function updateEnterpriseMember(id, data) {
  return request({
    url: `/Enterprise/member/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除企业成员
 * @param {number} id - 成员ID
 * @returns {Promise}
 */
export function deleteEnterpriseMember(id) {
  return request({
    url: `/enterprise/member/${id}`,
    method: 'delete'
  })
}

/**
 * 获取可添加到企业的用户列表
 * @param {number} EnterpriseId - 企业ID
 * @returns {Promise}
 */
export function getAvailableUsers(EnterpriseId) {
  return request({
    url: `/enterprise/member/available-users/${EnterpriseId}`,
    method: 'get'
  })
}

/**
 * 激活/切换当前用户的企业（控制台接口）
 * @param {number|string} EnterpriseId
 * @returns {Promise}
 */
export function activateEnterprise(EnterpriseId) {
  return request({
    url: `/console/self/Enterprise/active/${EnterpriseId}`,
    method: 'put'
  })
}
