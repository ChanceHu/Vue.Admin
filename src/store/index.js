import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'

Vue.use(Vuex)

// https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFiles = require.context('./modules', true, /\.js$/)

// 不需要像这样`import app from './modules/app'`中导入应用
// 它将自动获取模块文件中的所有vuex模块
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})
// Vuex五个对象
// （1）State：状态数（值）
// （2）Getter：类似store的计算属性
// （3）Mutation：用于改变状态（值）
// （4）actions:调用Mutation，而不是直接变更状态(可以包含任意异步操作)。
// （5）modules：集中多Vuex个为一个模块
// 详情：https://vuex.vuejs.org/zh/guide/actions.html
const store = new Vuex.Store({
  modules,
  getters
})

export default store
