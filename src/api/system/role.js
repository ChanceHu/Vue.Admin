import request from '@/utils/request'

 
export function getListApi(params){
  return request({
      url:'/Role/Get',
      method:'get',
      params,  
  })
}
 
export function deleteApi(params){
  return request({
      url:'/Role/Delete',
      method:'delete',
      params, 
      transformRequest:[function(data,header){
          return data;
      }]
  })
} 
export function createApi(data){
    return request({
        url:'/Role/Post',
        method:'post',
        data, 
        transformRequest: [function (data, headers) {   
          return  JSON.stringify(data);
        }],
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    })
  } 
  export function updateApi(data){
    return request({
        url:'/Role/Put',
        method:'Put',
        data, 
        transformRequest: [function (data, headers) {  
          return  JSON.stringify(data);
        }],
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    })
  } 
  export function getPermissionsApi(params) {
    return request ({
      url:'/Permission/GetPermAndBtnIds',
      method:'get',
      params,  
    })
    
  }
  /**
 * 角色依赖关系
 */
// 设置角色权限
export function setPermissionsApi (data) {
  return request({
    url: '/Role/SavePermissions',
    method: 'post',
    data
  })
}
 
 