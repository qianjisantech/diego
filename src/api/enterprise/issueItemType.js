import request from '@/utils/request.js'
import { useUserStore } from '@/store/user'

const api = '/enterprise-api/issue-item-type'

export function createIssueItemType(data) {
  const userStore = useUserStore()
  const requestData = {
    ...data,
    enterpriseId: userStore.selectedCompanyId
  }
  return request({
    url: api,
    method: 'post',
    data: requestData
  })
}

export function updateIssueItemType(id, data) {
  return request({
    url: `${api}/${id}`,
    method: 'put',
    data
  })
}

export function deleteIssueItemType(id) {
  return request({
    url: `${api}/${id}`,
    method: 'delete'
  })
}

export function getIssueItemTypeById(id) {
  return request({
    url: `${api}/${id}`,
    method: 'get'
  })
}

export function getIssueItemTypePage(data) {
  return request({
    url: `${api}/page`,
    method: 'post',
    data
  })
}
