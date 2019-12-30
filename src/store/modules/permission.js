import { asyncRoutes, constantRoutes, filterAsyncRouter } from '@/router'
import { getPermission } from '@/api/permission'

/**
 * 使用meta.role确定当前用户是否具有权限
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: [],
  dataPerms: []
}
// mutations改变状态（值）
const mutations = {
  SET_ROUTES: (state, routes) => {
    // 新添加的路由
    state.addRoutes = routes
    // concat方法用于连接两个或多个数组。
    // 把异步路由（也就是动态获取的路由）和公共路由导航合并（constantRoutes）
    // 全部路由
    state.routes = constantRoutes.concat(routes)
  },
  // 设置按钮权限
  SET_DATAPERMS: (state, dataPerms) => {
    state.dataPerms = dataPerms
  }
}
// actions触发状态变更方法
const actions = {
  generateRoutes({ commit }, uId) {
    return new Promise(resolve => {
      getPermission(uId).then(response => {
        let accessedRoutes
        // 这是根据角色资源加载导航条roles传入角色资源
        // accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
        accessedRoutes = filterAsyncRouter(response.success?response.response.permsList:response.data.response.permsList)
        const dataPerms =response.success?response.response.btnList.map(item => item.Code):response.data.response.btnList.map(item => item.Code); 
        /** *******过滤按钮**********/
        var f = item => {
          if (item['children']) {
            item['children'] = item['children'].filter(f)
            return true
          } else if (item['IsButton']) {
            return item['IsButton'] === false
          } else {
            return true
          }
        }
        accessedRoutes = accessedRoutes.filter(f)
        /** ************************/
        commit('SET_DATAPERMS', dataPerms)
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
