 
import validate from '@/utils/validate' // 公共验证方法
import initRules from '@/utils/initRules' // 初始化验证规则 
import handleAPI from '@/utils/handleApi' // 基本操作API的方法 
import utils from '@/utils/utils' // 公共方法
import initPermsBtn  from '@/utils/initPermsBtn'

export default {
  install (Vue, options) { 
    Vue.prototype.$validate = validate
    Vue.prototype.$initRules = initRules 
    Vue.prototype.$handleAPI = handleAPI 
    Vue.prototype.$fn = utils
    Vue.prototype.$initDataPerms = initPermsBtn
  }
}
