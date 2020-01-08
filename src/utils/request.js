import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { refreshToken } from '@/api/user'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 20000 // request timeout
})

var storeTemp = store
// request interceptor
service.interceptors.request.use(
  config => {
    // 请求之前验证token和过期事件
    var curTime = new Date()
    // 过期时间
    var expireTime = new Date(Date.parse(store.getters.tokenExpire))
    // 如果token不存在并且也已经过期了就滑动获取新token
    if (store.getters.token && (curTime < expireTime && store.getters.tokenExpire)) {
      // 判断是否存在token，如果存在的话，则每个http header都加上token
      config.headers.Authorization = 'Bearer ' + store.getters.token
      config.headers['X-Token'] = getToken()
    }
    store.dispatch('user/saveRefreshTime')
    return config
  },
  error => {
    // do something with request error 
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => { 
    const res = response.data
    //console.log(res)
    // if the custom code is not 20000, it is judged as an error.
    if (res.success !== true) {
      Message({
        message: res.message || '服务器返回错误',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.Status === 401) {
        // to re-login
        MessageBox.confirm('您未登录，您可以取消以停留在此页，或重新登录', 'Confirm logout', {
          confirmButtonText: '登录',
          cancelButtonText: '关闭',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || '服务器返回错误'))
    } else {
      return res
    }
  },
  error => { 
    // 超时请求处理
    var originalRequest = error.config
    if (error.code == 'ECONNABORTED' && error.message.indexOf('timeout') != -1 && !originalRequest._retry) {
      Message({
        message: '请求超时！请稍后刷新重试。',
        type: 'error'
      })
      originalRequest._retry = true
      return Promise.reject(error)
    }
    if (error.response) {
      if (error.response.status == 401) {
        var curTime = new Date()
        var refreshTime = new Date(Date.parse(window.localStorage.refreshTime))
        // 在用户操作的活跃期内
        if (window.localStorage.refreshTime && (curTime <= refreshTime)) { 
          return store.dispatch('user/refreshToken').then((res) => {
            if (res) {
              error.config.__isRetryRequest = true
              error.config.headers.Authorization = 'Bearer ' + store.getters.token
              error.config.baseURL = '';
              return axios(error.config)
            } else {
              // 刷新token失败 清除token信息并跳转到登录页面
              store.dispatch('user/resetToken').then(() => {
                location.reload()
              })
            }
          }) 
          // return  refreshToken({token: window.localStorage.Token}).then((res) => {
          //   if (res.success) { 
          //     store.commit("SET_TOKEN", res.token);
          //     var curTime = new Date();
          //     var expireDate = new Date(curTime.setSeconds(curTime.getSeconds() + res.expires_in));
          //     store.commit("SET_TOKEN_EXPIRE", expireDate);

          //     error.config.__isRetryRequest = true;
          //     error.config.headers.Authorization = 'Bearer ' + res.token;
          //     error.config.baseURL = '';
          //     return service(error.config);
          //   }
          //   else {
          //     store.dispatch('user/resetToken').then(() => {
          //       location.reload()
          //     })
          //   }
          // });
        } else {
          // 返回 401，并且不知用户操作活跃期内 清除token信息并跳转到登录页面
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        }
      }
      // 403 无权限
      if (error.response.status == 403) { 
        Message({
          message: '失败！该操作无权限',
          type: 'error'
        })
        return Promise.reject(error)
      }else{
        Message({
          message: error.message,
          type: 'error',
          duration: 5 * 1000
        })
      }
    } 
    return Promise.reject(error)
  }
)

export default service
