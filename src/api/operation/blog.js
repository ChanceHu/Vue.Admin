import request from '@/utils/request'

 
export function getListApi(params){
  return request({
      url:'/Blog/Get',
      method:'get',
      params,  
  })
}
 
export function deleteApi(params){
  return request({
      url:'/Module/DeleteModule',
      method:'delete',
      params, 
      transformRequest:[function(data,header){
          return data;
      }]
  })
} 
export function createApi(params){
    return request({
        url:'/Module/DeleteModule',
        method:'delete',
        params, 
        transformRequest:[function(data,header){
            return data;
        }]
    })
  } 
  export function updateApi(params){
    return request({
        url:'/Module/DeleteModule',
        method:'delete',
        params, 
        transformRequest:[function(data,header){
            return data;
        }]
    })
  } 
 