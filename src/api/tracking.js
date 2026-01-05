import request from '@/utils/request'

/**
 * 分页查询埋点日志
 * @param {Object} query 查询条件
 */
export function pageTrackingLogs(query) {
  return request({
    url: '/tracking/page',
    method: 'post',
    data: query
  })
}

/**
 * 保存埋点日志
 * @param {Object} data 埋点数据
 */
export function saveTrackingLog(data) {
  return request({
    url: '/tracking/save',
    method: 'post',
    data
  })
}

/**
 * 查询埋点日志详情
 * @param {Number} id 日志ID
 */
export function getTrackingLogById(id) {
  return request({
    url: `/tracking/${id}`,
    method: 'get'
  })
}

/**
 * 统计埋点类型数量（柱状图）
 * 展示年月日每个埋点类型的量
 * @param {Object} query 查询条件 { dateType: 'day'|'month'|'year', startDate, endDate }
 */
export function getTrackingTypeStats(query) {
  return request({
    url: '/tracking/report/event-type-statistics',
    method: 'post',
    data: query
  })
}

/**
 * 统计用户活跃量
 * 展示用户的活跃量
 * @param {Object} query 查询条件 { dateType: 'day'|'month'|'year', startDate, endDate }
 */
export function getTrackingUserStats(query) {
  return request({
    url: '/tracking/report/user-activity',
    method: 'post',
    data: query
  })
}

/**
 * 上报埋点数据（使用 /api/tracking/report 接口）
 * @param {Object} data 埋点数据
 */
export function reportTracking(data) {
  return request({
    url: '/tracking/report',
    method: 'post',
    data,
    showLoading: false // 埋点请求不显示loading
  })
}
