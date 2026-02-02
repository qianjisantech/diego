import request from '@/utils/request.js'

// ==================== 用户管理 ====================

/**
 * 分页查询用户
 */
export function getUserPage(params) {
  return request({
    url: '/rbac/user/page',
    method: 'post',
    data: params
  })
}

/**
 * 获取用户详情
 */
export function getUserDetail(id) {
  return request({
    url: `/rbac/user/${id}`,
    method: 'get'
  })
}

/**
 * 新增用户
 */
export function addUser(data) {
  return request({
    url: '/rbac/user',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(id, data) {
  return request({
    url: `/rbac/user/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/rbac/user/${id}`,
    method: 'delete'
  })
}

/**
 * 重置用户密码
 */
export function resetPassword(id) {
  return request({
    url: `/rbac/user/${id}/reset-password`,
    method: 'post'
  })
}

/**
 * 分配用户角色
 */
export function assignUserRoles(userId, roleIds) {
  return request({
    url: `/rbac/user/${userId}/assign-role`,
    method: 'post',
    data: { roleIds }
  })
}

// ==================== 角色管理 ====================

/**
 * 分页查询角色
 */
export function getRolePage(params) {
  return request({
    url: '/rbac/role/page',
    method: 'post',
    data: params
  })
}

/**
 * 获取所有角色列表
 */
export function getRoleList() {
  return request({
    url: '/rbac/role/list',
    method: 'get'
  })
}

/**
 * 获取角色详情
 */
export function getRoleDetail(id) {
  return request({
    url: `/rbac/role/${id}`,
    method: 'get'
  })
}

/**
 * 新增角色
 */
export function addRole(data) {
  return request({
    url: '/rbac/role',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 */
export function updateRole(id, data) {
  return request({
    url: `/rbac/role/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除角色
 */
export function deleteRole(id) {
  return request({
    url: `/rbac/role/${id}`,
    method: 'delete'
  })
}

/**
 * 分配角色权限
 */
export function assignRolePermissions(roleId, menuIds) {
  return request({
    url: `/rbac/role/${roleId}/assign-permission`,
    method: 'post',
    data: { menuIds }
  })
}

/**
 * 获取角色已分配的菜单ID列表
 */
export function getRoleMenuIds(roleId) {
  return request({
    url: `/rbac/role/${roleId}/menu-ids`,
    method: 'get'
  })
}

// ==================== 菜单管理 ====================

/**
 * 获取菜单树
 */
export function getMenuTree() {
  return request({
    url: '/rbac/menu/tree',
    method: 'get'
  })
}

/**
 * 获取菜单列表
 */
export function getMenuList(params) {
  return request({
    url: '/rbac/menu/list',
    method: 'get',
    params
  })
}

/**
 * 获取菜单详情
 */
export function getMenuDetail(id) {
  return request({
    url: `/rbac/menu/${id}`,
    method: 'get'
  })
}

/**
 * 新增菜单
 */
export function addMenu(data) {
  return request({
    url: '/rbac/menu',
    method: 'post',
    data
  })
}

/**
 * 更新菜单
 */
export function updateMenu(id, data) {
  return request({
    url: `/rbac/menu/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除菜单
 */
export function deleteMenu(id) {
  return request({
    url: `/rbac/menu/${id}`,
    method: 'delete'
  })
}

// ==================== 权限管理 ====================

/**
 * 获取权限列表
 */
export function getPermissionList(params) {
  return request({
    url: '/rbac/permission/list',
    method: 'get',
    params
  })
}

/**
 * 新增权限
 */
export function addPermission(data) {
  return request({
    url: '/rbac/permission',
    method: 'post',
    data
  })
}

/**
 * 更新权限
 */
export function updatePermission(id, data) {
  return request({
    url: `/rbac/permission/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除权限
 */
export function deletePermission(id) {
  return request({
    url: `/rbac/permission/${id}`,
    method: 'delete'
  })
}

// ==================== 字典管理 ====================

/**
 * 分页查询字典类型
 */
export function getDictTypePage(params) {
  return request({
    url: '/rbac/dict/type/page',
    method: 'post',
    data: params
  })
}

/**
 * 新增字典类型
 */
export function addDictType(data) {
  return request({
    url: '/rbac/dict/type',
    method: 'post',
    data
  })
}

/**
 * 更新字典类型
 */
export function updateDictType(id, data) {
  return request({
    url: `/rbac/dict/type/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除字典类型
 */
export function deleteDictType(id) {
  return request({
    url: `/rbac/dict/type/${id}`,
    method: 'delete'
  })
}

/**
 * 查询字典数据列表
 */
export function getDictDataList(dictTypeId) {
  return request({
    url: `/rbac/dict/data/list/${dictTypeId}`,
    method: 'get'
  })
}

/**
 * 根据字典编码查询字典数据
 */
export function getDictDataByCode(dictCode) {
  return request({
    url: `/rbac/dict/data/code/${dictCode}`,
    method: 'get'
  })
}

/**
 * 新增字典数据
 */
export function addDictData(data) {
  return request({
    url: '/rbac/dict/data',
    method: 'post',
    data
  })
}

/**
 * 更新字典数据
 */
export function updateDictData(id, data) {
  return request({
    url: `/rbac/dict/data/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除字典数据
 */
export function deleteDictData(id) {
  return request({
    url: `/rbac/dict/data/${id}`,
    method: 'delete'
  })
}

// ==================== 配置管理 ====================

/**
 * 分页查询配置
 */
export function getConfigPage(params) {
  return request({
    url: '/rbac/config/page',
    method: 'post',
    data: params
  })
}

/**
 * 根据配置组查询配置
 */
export function getConfigByGroup(group) {
  return request({
    url: `/rbac/config/group/${group}`,
    method: 'get'
  })
}

/**
 * 新增配置
 */
export function addConfig(data) {
  return request({
    url: '/rbac/config',
    method: 'post',
    data
  })
}

/**
 * 更新配置
 */
export function updateConfig(id, data) {
  return request({
    url: `/rbac/config/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除配置
 */
export function deleteConfig(id) {
  return request({
    url: `/rbac/config/${id}`,
    method: 'delete'
  })
}

/**
 * 获取字段配置列表
 */
export function getFieldConfigList(moduleCode) {
  return request({
    url: `/rbac/field-config/list/${moduleCode}`,
    method: 'get'
  })
}

/**
 * 更新字段配置
 */
export function updateFieldConfig(id, data) {
  return request({
    url: `/rbac/field-config/${id}`,
    method: 'put',
    data
  })
}

/**
 * 批量更新字段配置
 */
export function batchUpdateFieldConfig(data) {
  return request({
    url: '/rbac/field-config/batch',
    method: 'put',
    data
  })
}
