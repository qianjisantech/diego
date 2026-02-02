import request from '@/utils/request.js'
/**
 * 获取我的视图列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export function getMyViews(params) {
    return request({
        url: '/workspace/view/list',
        method: 'get',
        params
    })
}

/**
 * 创建视图
 * @param {object} data - 视图数据
 * @returns {Promise}
 */
export function createView(data) {
    return request({
        url: '/workspace/view',
        method: 'post',
        data
    })
}

/**
 * 更新视图
 * @param {string} id - 视图ID
 * @param {object} data - 视图数据
 * @returns {Promise}
 */
export function updateView(id, data) {
    return request({
        url: `/workspace/view/${id}`,
        method: 'put',
        data
    })
}

/**
 * 删除视图
 * @param {string} id - 视图ID
 * @returns {Promise}
 */
export function deleteView(id) {
    return request({
        url: `/workspace/view/${id}`,
        method: 'delete'
    })
}

/**
 * 获取视图详情
 * @param {string} id - 视图ID
 * @returns {Promise}
 */
export function getViewDetail(id) {
    return request({
        url: `/workspace/view/${id}`,
        method: 'get'
    })
}

/**
 * 创建视图文件夹
 * @param {object} data - 文件夹数据
 * @returns {Promise}
 */
export function createViewFolder(data) {
    return request({
        url: '/workspace/view-folder',
        method: 'post',
        data
    })
}

/**
 * 更新视图文件夹
 * @param {string} id - 文件夹ID
 * @param {object} data - 文件夹数据
 * @returns {Promise}
 */
export function updateViewFolder(id, data) {
    return request({
        url: `/workspace/view-folder/${id}`,
        method: 'put',
        data
    })
}

/**
 * 删除视图文件夹
 * @param {string} id - 文件夹ID
 * @returns {Promise}
 */
export function deleteViewFolder(id) {
    return request({
        url: `/workspace/view-folder/${id}`,
        method: 'delete'
    })
}
