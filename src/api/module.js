import request from '@/utils/request'

 
export function fetchList(params){
  return request({
      url:'/Module/Get',
      method:'get',
      params,  
  })
}
export function moduleExcelDown(params){
  return request({
      url:'/Module/ModuleExcelDown',
      method:'get',
      params, 
      transformRequest: [function (data, headers) { 
          console.log("批量导出:"+data);
          return data;
      }],
      responseType:'blob'
  })
}
export function moduleUpLoad(data){
  return request({
      url:'/Module/UpLoad',
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
export function deleteModule(params){
  return request({
      url:'/Module/DeleteModule',
      method:'delete',
      params, 
      transformRequest:[function(data,header){
          return data;
      }]
  })
} 
 