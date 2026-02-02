import request from '@/utils/request.js'

/**
 * 获取部门列表
 * @param {number} companyId - 企业ID
 * @returns {Promise}
 */
export function getDepartmentList(companyId) {
  return request({
    url: `/console/department/list/${companyId}`,
    method: 'get'
  })
}

/**
 * 获取部门树形结构
 * @param {number} companyId - 企业ID
 * @returns {Promise}
 */
export function getDepartmentTree(companyId) {
  return request({
    url: `/console/department/tree/${companyId}`,
    method: 'get'
  })
}

/**
 * 创建部门
 * @param {object} data - 部门数据
 * @returns {Promise}
 */
export function createDepartment(data) {
  return request({
    url: '/console/department',
    method: 'post',
    data
  })
}

/**
 * 更新部门
 * @param {number} id - 部门ID
 * @param {object} data - 部门数据
 * @returns {Promise}
 */
export function updateDepartment(id, data) {
  return request({
    url: `/console/department/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除部门
 * @param {number} id - 部门ID
 * @returns {Promise}
 */
export function deleteDepartment(id) {
  return request({
    url: `/console/department/${id}`,
    method: 'delete'
  })
}

/**
 * 根据ID查询部门
 * @param {number} id - 部门ID
 * @returns {Promise}
 */
export function getDepartmentById(id) {
  return request({
    url: `/console/department/${id}`,
    method: 'get'
  })
}
