import request from '@/utils/request'
export function getPermission(uid) {
    return request({
      url: '/permission/GetNavigationBar',
      method: 'get',
      params: { uid }
    })
  }
  