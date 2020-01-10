import Vue from 'vue'
import Router from 'vue-router'
import globalFn from '@/utils/utils'
Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
import componentsRouter from './modules/components'
import chartsRouter from './modules/charts'
import tableRouter from './modules/table'
import nestedRouter from './modules/nested'

const _import = require('@/router/_import_' + process.env.NODE_ENV)// 获取组件的方法

/**
 * 注意:子菜单只在路由子菜单时出现 children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                  如果设置为true，项目将不会显示在侧栏(默认为false)
 * alwaysShow: true              如果设置为true，将始终显示根菜单,如果不设置alwaysShow，当项目有多个子路由时，它将成为嵌套模式，否则不显示根菜单
 * redirect: noRedirect          如果设置noRedirect将不会在面包屑中重定向(404)
 * name:'router-name'            名称由(必须设置!!)
 * meta : {
    roles: ['admin','editor']    控制页面角色(可以设置多个角色)
    title: 'title'               名称显示在侧栏和面包屑(推荐设置)
    icon: 'svg-name'             图标显示在侧栏中
    noCache: true                如果设置为true，页面将不会被缓存(默认为false)
    affix: true                  如果设置为真，则标记将附加在tags-view中
    breadcrumb: false            如果设置为false，则该项将隐藏在breadcrumb中(默认为true)
    activeMenu: '/example/list'  如果设置路径，侧栏将突出显示您设置的路径
  }
 */

/**
 * constantRoutes
 * 没有权限要求的基页所有角色都可以访问
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/documentation',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/documentation/index'),
        name: 'Documentation',
        meta: { title: 'Documentation', icon: 'documentation', affix: true }
      }
    ]
  },
  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/guide/index'),
        name: 'Guide',
        meta: { title: 'Guide', icon: 'guide', noCache: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  }

]

/**
 * 异步路由
 * 需要根据用户角色动态加载的路由
 */
export const asyncRoutes = [
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: 'Permission',
      icon: 'lock',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'page',
        component: () => import('@/views/permission/page'),
        name: 'PagePermission',
        meta: {
          title: 'Page Permission',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'directive',
        component: () => import('@/views/permission/directive'),
        name: 'DirectivePermission',
        meta: {
          title: 'Directive Permission'
          // if do not set roles, means: this page does not require permission
        }
      },
      {
        path: 'role',
        component: () => import('@/views/permission/role'),
        name: 'RolePermission',
        meta: {
          title: 'Role Permission',
          roles: ['admin']
        }
      }
    ]
  },

  /** 当你的路由图太长时，你可以把它分成小模块 **/
  componentsRouter,
  chartsRouter,
  nestedRouter,
  tableRouter,

  {
    path: '/example',
    component: Layout,
    redirect: '/example/list',
    name: 'Example',
    meta: {
      title: 'Example',
      icon: 'example'
    },
    children: [
      {
        path: 'create',
        component: () => import('@/views/example/create'),
        name: 'CreateArticle',
        meta: { title: 'Create Article', icon: 'edit' }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/example/edit'),
        name: 'EditArticle',
        meta: { title: 'Edit Article', noCache: true, activeMenu: '/example/list' },
        hidden: true
      },
      {
        path: 'list',
        component: () => import('@/views/example/list'),
        name: 'ArticleList',
        meta: { title: 'Article List', icon: 'list' }
      }
    ]
  },

  {
    path: '/tab',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/tab/index'),
        name: 'Tab',
        meta: { title: 'Tab', icon: 'tab' }
      }
    ]
  },

  {
    path: '/error',
    component: Layout,
    redirect: 'noRedirect',
    name: 'ErrorPages',
    meta: {
      title: 'Error Pages',
      icon: '404'
    },
    children: [
      {
        path: '401',
        component: () => import('@/views/error-page/401'),
        name: 'Page401',
        meta: { title: '401', noCache: true }
      },
      {
        path: '404',
        component: () => import('@/views/error-page/404'),
        name: 'Page404',
        meta: { title: '404', noCache: true }
      }
    ]
  },
  {
    path: '/excel',
    component: Layout,
    redirect: '/excel/export-excel',
    name: 'Excel',
    meta: {
      title: 'Excel',
      icon: 'excel'
    },
    children: [
      {
        path: 'export-excel',
        component: () => import('@/views/excel/export-excel'),
        name: 'ExportExcel',
        meta: { title: 'Export Excel' }
      },
      {
        path: 'export-selected-excel',
        component: () => import('@/views/excel/select-excel'),
        name: 'SelectExcel',
        meta: { title: 'Export Selected' }
      },
      {
        path: 'export-merge-header',
        component: () => import('@/views/excel/merge-header'),
        name: 'MergeHeader',
        meta: { title: 'Merge Header' }
      },
      {
        path: 'upload-excel',
        component: () => import('@/views/excel/upload-excel'),
        name: 'UploadExcel',
        meta: { title: 'Upload Excel' }
      }
    ]
  },

  {
    path: '/zip',
    component: Layout,
    redirect: '/zip/download',
    alwaysShow: true,
    name: 'Zip',
    meta: { title: 'Zip', icon: 'zip' },
    children: [
      {
        path: 'download',
        component: () => import('@/views/zip/index'),
        name: 'ExportZip',
        meta: { title: 'Export Zip' }
      }
    ]
  },

  {
    path: '/pdf',
    component: Layout,
    redirect: '/pdf/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/pdf/index'),
        name: 'PDF',
        meta: { title: 'PDF', icon: 'pdf' }
      }
    ]
  },
  {
    path: '/pdf/download',
    component: () => import('@/views/pdf/download'),
    hidden: true
  },
  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://github.com/ChanceHu/Vue.Admin',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  },

  // 404重定向页必须放在末尾！
  { path: '*', redirect: '/404', hidden: true }
]
// 创建路由数据Array<RouteConfig>
const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  // matcher用来替换现有router的routes
  // 主要用来动态修改路由的时候重置路由为只有公共的路由导航
  router.matcher = newRouter.matcher // 重置路由器
}

function getPath(arr, child, code) {
  const pItem = arr.find(item => child.Pid === item.Id)
  // 当前元素还存在父节点, 且父节点不为根节点
  if (arr.find(item => pItem.Pid === item.Id && item.Pid > -1)) {
    getPath(arr, pItem, `${pItem.Code}/${code}`)
  } else {
    return `${pItem.Code}/${code}`
  }
}
export function filterAsyncRouter(asyncRouterMap) {
  let baseMenu = []; let treeMenu = []
  baseMenu = asyncRouterMap.map((item, index) => {
    // 对基础数据的处理
    item.meta = {}
    item.meta.requireAuth = true
    item.meta.NoTabPage = !!item.IsHide
    item.meta.title = item.Name
    item.meta.code = item.Code
    item.meta.icon = item.Icon
    item.meta.id = item.Id
    // 使路由名字具有唯一性
    item.name = item.Code
    // 设置对应的页面路径
    item.path = '/' + item.Code
    // 设置页面对应的组件 对应组件: -1. 根节点 1. 页面组件 2.默认布局 3456...扩展布局
    switch (item.ComponentType) {
      case -1:
        console.log('根节点，已经过滤掉了')
        break
      case 1:
        item.component = resolve => require([`@/views/${getPath(asyncRouterMap, item, item.Code)}/index`], resolve)
        break
      case 2:
        item.component = Layout
        break
      default:
        item.component = resolve => require(['@/views/error-page/404'], resolve)
        break
    }
    return {
      id: item.Id,
      pid: item.Pid,
      path: item.path,
      component: item.component,
      name: item.name,
      meta: item.meta,
      sort: item.OrderSort
    }
  })
  // 数据排序
  baseMenu = baseMenu.sort((a, b) => a.sort - b.sort)
  // 得到树状数组
  treeMenu = globalFn.getTreeArr({ key: 'id', pKey: 'pid', data: baseMenu, jsonData: false })
  // 404重定向页必须放在末尾！
  treeMenu.push({ path: '*', redirect: '/404', hidden: true })
  return treeMenu
}

export default router
