import request from '@/utils/request'

 
export function getListApi(params){
  return request({
      url:'/Role/GetList',
      method:'get',
      params,  
  })
}
 
export function deleteApi(params){
  return request({
      url:'/Role/DeleteModule',
      method:'delete',
      params, 
      transformRequest:[function(data,header){
          return data;
      }]
  })
} 
export function createApi(params){
    return request({
        url:'/Role/DeleteModule',
        method:'delete',
        params, 
        transformRequest:[function(data,header){
            return data;
        }]
    })
  } 
  export function updateApi(params){
    return request({
        url:'/Role/DeleteModule',
        method:'delete',
        params, 
        transformRequest:[function(data,header){
            return data;
        }]
    })
  } 
  //获取全部
  export function getList() {
    return request({
        url:'/Role/GetList',
        method:'get', 
    })
  }
 