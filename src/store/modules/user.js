import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token:window.localStorage.Token,
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  tokenExpire: window.localStorage.TokenExpire
}
// mutations改变状态（值）
const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    window.localStorage.setItem("Token", token);
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
    window.localStorage.setItem("Roles", roles);
  },
  SET_TOKEN_EXPIRE: (state, tokenExpire) => {
    state.tokenExpire = tokenExpire
    window.localStorage.setItem('TokenExpire', tokenExpire)
  }
}
// actions触发状态变更方法
const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        
        const data = response 
        // 把token存入state
        commit('SET_TOKEN', data.token)
       
        var curTime = new Date()
        var expireDate = new Date(curTime.setSeconds(curTime.getSeconds() + data.expires_in))
        // 把过期时间存state
        commit('SET_TOKEN_EXPIRE', expireDate)
        // 把过期时间存localStorage
        window.localStorage.refreshTime = expireDate
        // token时长
        window.localStorage.expires_in = data.expires_in 
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => { 
        const userInfo = response.response
        console.log("请求用户详情信息") 
        if (!response.success) {
          reject('验证失败，请重新登录.')
        }
        window.localStorage.user = JSON.stringify(userInfo)
        const { RoleNames, uRealName, name, uRemark } = userInfo;
        console.log(RoleNames) 
        
        if (!RoleNames || RoleNames.length <= 0) {
          reject('roles角色必须是非空数组')
        }

        commit('SET_ROLES', RoleNames)
        commit('SET_NAME', uRealName)
        commit('SET_AVATAR', name)
        commit('SET_INTRODUCTION', uRemark)
        resolve(userInfo)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 用户退出
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        // 重置访问的视图和缓存的视图
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 移除token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // 动态修改权限
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getInfo')
      // 模拟权限
      roles = []
      resetRouter()

      // 基于角色生成可访问路由图
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // 动态添加可访问路由
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  }
}

export default {
  namespaced: true, // 启用了命名空间
  state,
  mutations,
  actions
}
