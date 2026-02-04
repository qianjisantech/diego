import request from "@/utils/request.js";
import {CommonApi} from "@/api/common/index.js";
const api= CommonApi+'/email'

export function sendCode(data) {
    return request({
        url: `${api}/send-code`,
        method: 'post',
        data
    })
}