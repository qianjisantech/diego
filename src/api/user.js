import request from '@/utils/request'

/**
 * 获取用户列表（根据企业ID）
 * @param {string|number} enterpriseId - 企业ID，如果不提供则使用当前用户的默认企业ID
 * @returns {Promise}
 */
export function getUserList(enterpriseId) {
  // 如果没有提供enterpriseId，从localStorage获取当前选择的企业ID
  const currentEnterpriseId = enterpriseId || localStorage.getItem('activeEnterpriseId')

  return request({
    url: `/console-api/self/user/select/options/${currentEnterpriseId}`,
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
