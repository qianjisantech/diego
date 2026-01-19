import request from '@/utils/request'

/**
 * 分页查询模板
 * @param {object} data - 查询参数
 * @param {number} data.current - 当前页
 * @param {number} data.size - 每页大小
 * @param {string} data.code - 模板编码
 * @param {string} data.name - 模板名称
 * @param {string} data.description - 模板描述
 * @param {number} data.companyId - 企业ID
 * @param {number} data.status - 状态
 * @returns {Promise}
 */
export function getTemplateListPage(data) {
  return request({
    url: '/enterprise/template/page',
    method: 'post',
    data,
    showLoading: true,
    loadingText: '正在加载模板列表...'
  })
}

/**
 * 创建模板
 * @param {object} data - 模板数据
 * @returns {Promise}
 */
export function createTemplate(data) {
  return request({
    url: '/enterprise/template',
    method: 'post',
    data,
    showLoading: true,
    loadingText: '正在创建模板...'
  })
}

/**
 * 更新模板
 * @param {number} id - 模板ID
 * @param {object} data - 模板数据
 * @returns {Promise}
 */
export function updateTemplate(id, data) {
  return request({
    url: `/enterprise/template/${id}`,
    method: 'put',
    data,
    showLoading: true,
    loadingText: '正在更新模板...'
  })
}

/**
 * 删除模板
 * @param {number} id - 模板ID
 * @returns {Promise}
 */
export function deleteTemplate(id) {
  return request({
    url: `/enterprise/template/${id}`,
    method: 'delete',
    showLoading: true,
    loadingText: '正在删除模板...'
  })
}

/**
 * 获取模板详情
 * @param {number} id - 模板ID
 * @returns {Promise}
 */
export function getTemplateDetail(id) {
  return request({
    url: `/enterprise/template/${id}`,
    method: 'get',
    showLoading: true,
    loadingText: '正在加载模板详情...'
  })
}

/**
 * 复制模板
 * @param {number} id - 模板ID
 * @param {object} data - 新模板数据
 * @returns {Promise}
 */
export function copyTemplate(id, data) {
  return request({
    url: `/enterprise/template/${id}/copy`,
    method: 'post',
    data,
    showLoading: true,
    loadingText: '正在复制模板...'
  })
}

/**
 * 获取模板字段
 * @param {number} templateId - 模板ID
 * @returns {Promise}
 */
export function getTemplateFields(templateId) {
  return request({
    url: `/enterprise/template-field/${templateId}`,
    method: 'get',
    showLoading: true,
    loadingText: '正在加载模板字段...'
  })
}

/**
 * 创建模板字段
 * @param {object} data - 字段数据
 * @returns {Promise}
 */
export function createTemplateField(data) {
  return request({
    url: `/enterprise/template-field`,
    method: 'post',
    data,
    showLoading: true,
    loadingText: '正在创建字段...'
  })
}

/**
 * 更新模板字段
 * @param {number} id - 字段ID
 * @param {object} data - 字段数据
 * @returns {Promise}
 */
export function updateTemplateField(id, data) {
  return request({
    url: `/enterprise/template-field/${id}`,
    method: 'put',
    data,
    showLoading: true,
    loadingText: '正在更新字段...'
  })
}

/**
 * 删除模板字段
 * @param {number} id - 字段ID
 * @returns {Promise}
 */
export function deleteTemplateField(id) {
  return request({
    url: `/enterprise/template-field/${id}`,
    method: 'delete',
    showLoading: true,
    loadingText: '正在删除字段...'
  })
}

/**
 * 批量保存模板字段
 * @param {object} data - { template_id, fields: [] }
 * @returns {Promise}
 */
export function saveTemplateFields(data) {
  return request({
    url: `/enterprise/template-field/save`,
    method: 'post',
    data,
    showLoading: true,
    loadingText: '正在保存字段...'
  })
}

/**
 * 获取模板选项（用于设计页面下拉）
 * @param {number|string} companyId
 * @returns {Promise}
 */
export function getTemplateOptions(companyId) {
  return request({
    url: `/enterprise/template/options`,
    method: 'get',
    params: { companyId }
  })
}
