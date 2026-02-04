import request from '@/utils/request.js'
import { useUserStore } from '@/store/user'
import {EnterpriseApi} from "@/api/enterprise/index.js";

const api = EnterpriseApi+'/enterprise-member'

export function createEnterpriseMember(data) {
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

export function updateEnterpriseMember(id, data) {
  return request({
    url: `${api}/${id}`,
    method: 'put',
    data
  })
}

export function deleteEnterpriseMember(id) {
  return request({
    url: `${api}/${id}`,
    method: 'delete'
  })
}

export function getEnterpriseMemberById(id) {
  return request({
    url: `${api}/${id}`,
    method: 'get'
  })
}

export function getEnterpriseMemberPage(data) {
  return request({
    url: `${api}/page`,
    method: 'post',
    data
  })
}

export function getMembersByEnterpriseId(enterpriseId) {
  return request({
    url: `${api}/enterprise/${enterpriseId}`,
    method: 'get'
  })
}

export function getMemberByUserId(userId) {
  return request({
    url: `${api}/user/${userId}`,
    method: 'get'
  })
}
