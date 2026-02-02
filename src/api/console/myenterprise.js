import request from '@/utils/request.js'
import {ConsoleApi} from "@/api/console/index.js";

const  MyEnterprise='/my-enterprise'

export function getMyEnterpriseList() {
    return request({
        url: ConsoleApi+MyEnterprise+ '/list',
        method: 'get',
    })
}
/**
 * 创建企业
 * @param {object} data - 企业数据
 * @returns {Promise}
 */
export function createMyEnterprise(data) {
    return request({
        url: ConsoleApi+MyEnterprise,
        method: 'post',
        data
    })
}