import request from '@/utils/request.js'
import {ConsoleApi} from "@/api/console/index.js";

export function getEnterpriseInviteInfo(id) {
    return request({
        url: ConsoleApi+ `/invite/info/${id}`,
        method: 'get',
    })
}
