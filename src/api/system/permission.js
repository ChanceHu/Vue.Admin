import request from '@/utils/request'

// 创建
export function createApi (data) {
  return request({
    url: '/Permission/Post',
    method: 'post',
    data,
    transformRequest: [function (data, headers) { 
      console.log("设备添加");
      console.log( data);
      console.log(headers);   
      return  JSON.stringify(data);
    }],
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
  })
}

// 编辑
export function updateApi (data) {
  return request({
    url: '/Permission/Put',
    method: 'put',
    data,
    transformRequest: [function (data, headers) { 
      console.log("设备添加");
      console.log( data);
      console.log(headers);   
      return  JSON.stringify(data);
    }],
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
  })
}

// 删除
export function deleteApi (id) {
  return request({
    url: `/Permission/Delete/${id}`,
    method: 'delete',
    
  })
}

// 得到单条数据
export function getRowApi (id) {
  return request({
    url: `/Permission/getRow/${id}`,
    method: 'get'
  })
}

// 获取列表
export function getListApi (params) {
  return request({
    url: '/Permission/GetTreeList',
    method: 'get',
    params
  })
}

// 获取所有
export function getRoleMenuApi (params) {
  return request({
    url: `/Permission/GetRolePerms`,
    method: 'get',
    params
  })
}

// 获取所有
export function getAllApi (params) {
  return request({
    url: `/Permission/GetTreeList`,
    method: 'get',
    params
  })
}

/**
 * 菜单相关的按钮权限
 */
// 创建
export function permsBtnCreateApi (data) {
  return request({
    url: '/PermissionButton/Post',
    method: 'post',
    data
  })
}

// 编辑
export function permsBtnUpdateApi (data) {
  return request({
    url: '/PermissionButton/Put',
    method: 'put',
    data,
    transformRequest: [function (data, headers) { 
      console.log("设备添加");
      console.log( data);
      console.log(headers);   
      return  JSON.stringify(data);
    }],
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
  })
}

// 删除
export function permsBtnDeleteApi (id) {
  return request({
    url: `/PermissionButton/Delete/${id}`,
    method: 'delete'
  })
}

// 得到单条数据
export function permsBtnGetRowApi (id) {
  return request({
    url: `/PermissionButton/getRow/${id}`,
    method: 'get'
  })
}

// 获取列表
export function permsBtnGetListApi (params) {
  return request({
    url: '/PermissionButton/getList',
    method: 'get',
    params
  })
}

// 获取用户拥有
export function getRoleDataPermsApi (params) {
  return request({
    url: `/PermissionButton/getRoleDataPerms`,
    method: 'get',
    params
  })
}

// 获取所有
export function permsBtnGetAllApi (params) {
  return request({
    url: `/PermissionButton/Get`,
    method: 'get',
    params
  })
}
