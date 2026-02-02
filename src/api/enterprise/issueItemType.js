import request from '@/utils/request.js'

/**
 * 创建事项类型
 * @param {object} data - 事项类型数据
 * @returns {Promise}
 */
export function createIssueItemType(data) {
  return request({
    url: '/console/issue-item-type',
    method: 'post',
    data
  })
}

/**
 * 更新事项类型
 * @param {number} id - 事项类型ID
 * @param {object} data - 事项类型数据
 * @returns {Promise}
 */
export function updateIssueItemType(id, data) {
  return request({
    url: `/console/issue-item-type/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除事项类型
 * @param {number} id - 事项类型ID
 * @returns {Promise}
 */
export function deleteIssueItemType(id) {
  return request({
    url: `/console/issue-item-type/${id}`,
    method: 'delete'
  })
}

/**
 * 根据ID查询事项类型
 * @param {number} id - 事项类型ID
 * @returns {Promise}
 */
export function getIssueItemTypeById(id) {
  return request({
    url: `/console/issue-item-type/${id}`,
    method: 'get'
  })
}

/**
 * 分页查询事项类型
 * @param {object} data - 查询参数
 * @returns {Promise}
 */
export function getIssueItemTypePage(data) {
  return request({
    url: '/console/issue-item-type/page',
    method: 'post',
    data
  })
}
