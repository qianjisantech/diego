import request from '@/utils/request.js'

export function getIssueList(data) {
  return request({
    url: '/workspace/issue/page',
    method: 'post',
    data
  })
}

/**
 * 创建事项
 * @param {object} data - 事项数据
 * @returns {Promise}
 */
export function createIssue(data) {
  return request({
    url: '/workspace/issue',
    method: 'post',
    data
  })
}

/**
 * 更新事项
 * @param {string} id - 事项ID
 * @param {object} data - 事项数据
 * @returns {Promise}
 */
export function updateIssue(id, data) {
  return request({
    url: `/workspace/issue/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除事项
 * @param {string} id - 事项ID
 * @returns {Promise}
 */
export function deleteIssue(id) {
  return request({
    url: `/workspace/issue/${id}`,
    method: 'delete'
  })
}

/**
 * 获取事项详情
 * @param {string} id - 事项ID
 * @returns {Promise}
 */
export function getIssueDetail(id) {
  return request({
    url: `/workspace/issue/${id}`,
    method: 'get'
  })
}


/**
 * 获取文件夹列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export function getViewFolderList(params) {
  return request({
    url: '/workspace/view-folder/list',
    method: 'get',
    params
  })
}

/**
 * 搜索事项（支持事项单号和标题搜索）
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
export function searchIssues(keyword) {
  return request({
    url: '/workspace/issue/search',
    method: 'get',
    params: { keyword }
  })
}
