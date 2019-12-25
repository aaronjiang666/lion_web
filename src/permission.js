import router from './router'
import { getAsyncRouter } from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth' // getToken from cookie

NProgress.configure({ showSpinner: false })// NProgress configuration
const whiteList = ['/login']

let isRouterLoader = true

router.onReady(() => {
  let r = getAsyncRouter()
  if (r) {
    router.addRoutes(r)
    isRouterLoader = false
  }
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (isRouterLoader) {
    let r = getAsyncRouter()
    if (r) {
      isRouterLoader = false
      router.addRoutes(r)
    }
  }
  if (getToken()) {
    if (to.path === '/login') {
      isRouterLoader = true
      next({ path: '/' })
      NProgress.done()
    } else {
      if (store.getters.roles.length === 0) {
        store.dispatch('GetInfo').then(res => { // 拉取用户信息
          next()
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})

