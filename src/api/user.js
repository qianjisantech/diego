import request from '@/utils/request'

/**
 * 获取用户列表（根据企业ID）
 * @param {string|number} companyId - 企业ID，如果不提供则使用当前用户的默认企业ID
 * @returns {Promise}
 */
export function getUserList(companyId) {
  // 如果没有提供companyId，从localStorage获取当前选择的企业ID
  const currentCompanyId = companyId || localStorage.getItem('activeCompanyId')

  return request({
    url: `/console/self/user/select/options/${currentCompanyId}`,
    method: 'get'
  })
}

/**
 * 获取用户详情
 * @param {number} id - 用户ID
 * @returns {Promise}
 */
export function getUserDetail(id) {
  return request({
    url: `/user/${id}`,
    method: 'get'
  })
}
