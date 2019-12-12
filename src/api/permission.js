import request from '@/utils/request'
export function getPermission(uid) {
    return request({
      url: '/api/permission/GetNavigationBar',
      method: 'get',
      params: { uid }
    })
  }
  