import request from '@/utils/request'

export function login(params) {
  return request({
    url: '/Login/JWTToken',
    method: 'get',
    params,
    baseURL: '/blog'
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
