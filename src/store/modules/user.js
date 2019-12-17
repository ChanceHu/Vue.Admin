import { login, logout, getInfo, refreshToken } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: window.localStorage.Token,
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
    window.localStorage.setItem('Token', token)
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
    window.localStorage.setItem('Roles', roles)
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
        // 当前时间：2019/12/12 16:08:17
        var curTime = new Date()
        // token过期时间:2019/12/12 17:08:17
        var expireDate = new Date(curTime.setSeconds(curTime.getSeconds() + data.expires_in))
        // 把过期时间存state
        commit('SET_TOKEN_EXPIRE', expireDate)
        // 保存刷新时间，这里的和过期时间一致主要用于刷新token时验证
        window.localStorage.refreshTime = expireDate
        // token时长:3600
        window.localStorage.expires_in = data.expires_in
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 定义token刷新时间戳
  saveRefreshTime() {
    const nowTime = new Date()
    // 上次刷新时间
    let lastRefreshTime = window.localStorage.refreshTime ? new Date(window.localStorage.refreshTime) : new Date(-1)
    // 过期时间
    const expireTime = new Date(Date.parse(window.localStorage.TokenExpire))
    const refreshCount = 1// 滑动系数（1用来在token过期后一分内访问可以重新获取token，超过则转到登录）
    // 如果当前时间小于最后刷新时间（也就是token过期后一分钟内）
    if (lastRefreshTime >= nowTime) {
      lastRefreshTime = nowTime > expireTime ? nowTime : expireTime
      // 每次都用过期时间或者当前时间加上滑动时间生成，用于token过期时判断是否跳转到登录页面
      // 在请求响应response返回的401状态时判断
      lastRefreshTime.setMinutes(lastRefreshTime.getMinutes() + refreshCount)
      window.localStorage.refreshTime = lastRefreshTime
    } else {
      // 当前时间大于token加上滑动时就设置refreshTime为最小
      // 然后在请求响应response返回的401时判断refreshTime时就会跳到登录
      window.localStorage.refreshTime = new Date(-1)
    }
  },
  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const userInfo = response.response

        if (!response.success) {
          reject('验证失败，请重新登录.')
        }
        window.localStorage.user = JSON.stringify(userInfo)
        const { RoleNames, uRealName, name, uRemark } = userInfo
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
    return new Promise((resolve) => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      window.localStorage.removeItem('user')
      window.localStorage.removeItem('Token')
      window.localStorage.removeItem('TokenExpire')
      window.localStorage.removeItem('refreshTime')
      // removeToken()
      resetRouter()
      // 重置访问的视图和缓存的视图
      // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
      dispatch('tagsView/delAllViews', null, { root: true })
      resolve()
    })
  },

  // 移除token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_TOKEN_EXPIRE', '')
      window.localStorage.removeItem('user')
      window.localStorage.removeItem('Token')
      resolve()
    })
  },

  // 刷新token
  refreshToken({ commit, state }) {
    return new Promise((resolve, reject) => {
      refreshToken({ token: state.token }).then((res) => {
        if (res.success) {
          commit('SET_TOKEN', res.token)
          var curTime = new Date()
          var expireDate = new Date(curTime.setSeconds(curTime.getSeconds() + res.expires_in))
          commit('SET_TOKEN_EXPIRE', expireDate)
          resolve(res.success)
        } else {
          resolve(res.success)
        }
      }).catch(error => {
        reject(error)
      })
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
