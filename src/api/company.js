import request from '@/utils/request'
import { getUserInfo } from '@/api/auth'

/**
 * 获取企业列表（分页）
 * @param {object} data - 查询参数
 * @returns {Promise}
 */
export function getCompanyListPage(data) {
  return request({
    url: '/company/page',
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
export async function getCompanyList() {
  return request({
    url: `/console/self/companies`,
    method: 'get'
  })
}

/**
 * 获取当前用户所属企业（自助接口，例如 /self/companies）
 * @returns {Promise}
 */
export function getSelfCompanies() {
  return request({
    url: `/console/self/companies`,
    method: 'get'
  })
}

/**
 * 创建企业
 * @param {object} data - 企业数据
 * @returns {Promise}
 */
export function createCompany(data) {
  return request({
    url: '/console/self/company',
    method: 'post',
    data
  })
}

/**
 * 更新企业
 * @param {number} id - 企业ID
 * @param {object} data - 企业数据
 * @returns {Promise}
 */
export function updateCompany(id, data) {
  return request({
    url: `/enterprise/company/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除企业
 * @param {number} id - 企业ID
 * @returns {Promise}
 */
export function deleteCompany(id) {
  return request({
    url: `/company/${id}`,
    method: 'delete'
  })
}

/**
 * 获取企业详情
 * @param {number} id - 企业ID
 * @returns {Promise}
 */
export function getCompanyDetail(id) {
  return request({
    url: `/company/${id}`,
    method: 'get'
  })
}

/**
 * 获取企业邀请信息（用于邀请链接页面展示）
 * @param {number|string} companyId
 * @returns {Promise}
 */
export function getInviteInfo(companyId) {
  return request({
    url: `/console/self/company/invite/info/${companyId}`,
    method: 'get'
  })
}

/**
 * 根据用户ID获取企业列表
 * @param {number|string} ownerId - 用户ID
 * @returns {Promise}
 */
export function getCompanyListByOwner(ownerId) {
  return request({
    url: `/company/owner/${ownerId}`,
    method: 'get'
  })
}


/**
 * 获取企业成员列表（分页）
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export function getCompanyMemberPage(params) {
  return request({
    url: '/company/member/page',
    method: 'post',
    data: params
  })
}

/**
 * 添加企业成员
 * @param {object} data - 成员数据
 * @returns {Promise}
 */
export function addCompanyMember(data) {
  return request({
    url: '/company/member',
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
export function updateCompanyMember(id, data) {
  return request({
    url: `/company/member/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除企业成员
 * @param {number} id - 成员ID
 * @returns {Promise}
 */
export function deleteCompanyMember(id) {
  return request({
    url: `/company/member/${id}`,
    method: 'delete'
  })
}

/**
 * 获取可添加到企业的用户列表
 * @param {number} companyId - 企业ID
 * @returns {Promise}
 */
export function getAvailableUsers(companyId) {
  return request({
    url: `/company/member/available-users/${companyId}`,
    method: 'get'
  })
}

/**
 * 激活/切换当前用户的企业（控制台接口）
 * @param {number|string} companyId
 * @returns {Promise}
 */
export function activateCompany(companyId) {
  return request({
    url: `/console/self/company/active/${companyId}`,
    method: 'put'
  })
}
