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
    url: '/User/GetInfoByToken',
    method: 'get',
    params: { token }
  })
}
export function fetchList(params){
  return request({
      url:'/Device/GetDeviceByPage',
      method:'get',
      params,  
  })
}
export function userExcelDown(params){
  return request({
      url:'/Device/DeviceExcelDown',
      method:'get',
      params, 
      transformRequest: [function (data, headers) { 
          console.log("批量导出:"+data);
          return data;
      }],
      responseType:'blob'
  })
}
export function userUpLoad(data){
  return request({
      url:'/Device/UpLoad',
      method:'post',
      data, 
      transformRequest: [function (data, headers) { 
          console.log("批量导入");
          console.log( data);
          console.log(headers);
          return data;
      }],
      headers: {"Content-Type": "multipart/form-data"}
     
  })
  
}
export function deleteUser(params){
  return request({
      url:'/Device/DeleteDevice',
      method:'delete',
      params, 
      transformRequest:[function(data,header){
          return data;
      }]
  })
} 
export function  refreshToken(params) {
  return request({
    url:'/Login/RefreshToken',
    method:'get',
    params, 
    
  })
}
export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
