import Vue from 'vue'
import Router from 'vue-router'
import { setRouter, getRouter, removeRouter } from '@/utils/auth'

Vue.use(Router)

export const constantRouterMap = [
  { path: '/login', component: resolve => require(['@/views/login/index'], resolve), hidden: true, meta: { requiresAuth: false }},
  {
    path: '/',
    component: resolve => require(['@/views/layout/index'], resolve),
    redirect: '/dashboard',
    name: 'Dashboard',
    hidden: false,
    meta: { requiresAuth: true },
    children: [{
      path: 'dashboard',
      meta: { requiresAuth: true },
      component: resolve => require(['@/views/dashboard/index'], resolve)
    },
    { path: '/404', component: resolve => require(['@/views/404'], resolve), hidden: true, meta: { requiresAuth: false }}]
  }
]

export function setAsyncRouter(routers) {
  removeRouter()
  setRouter(JSON.stringify(routers))
}

// 生成路由列表
export function getAsyncRouter() {
  return convertRouter(JSON.parse(getRouter()))
}

// 生成路由列表

export function convertRouter(sourceRouter) {
  if (!sourceRouter || sourceRouter.length === 0) {
    return
  }
  let asyncRouter = []
  let parentId = 0
  sourceRouter.forEach((item, index) => {
    if (item.parentId === parentId) {
      let r = {}
      let p = JSON.parse(item.meta)
      r.path = item.path
      r.name = item.name
      r.component = resolve => require(['@/views/' + item.component + '/index'], resolve)
      if (p.redirect) {
        r.redirect = p.redirect
      }
      r.meta = {}
      r.meta.routerId = item.id
      r.meta.requiresAuth = p.requiresAuth
      r.meta.title = p.title
      r.meta.icon = p.icon
      convertChildRouter(sourceRouter, r, item.id)
      asyncRouter.push(r)
    }
  })
  asyncRouter.push({ path: '*', redirect: '/404', hidden: true })
  return asyncRouter
}

function convertChildRouter(sourceRouter, parentRouter, parentId) {
  sourceRouter.forEach(item => {
    if (item.parentId === parentId) {
      let r = {}
      let p = JSON.parse(item.meta)
      r.path = item.path
      r.name = item.name
      r.component = resolve => require(['@/views/' + item.component + '/index'], resolve)
      if (p.redirect) {
        r.redirect = p.redirect
      }
      r.meta = {}
      r.meta.routerId = item.id
      r.meta.requiresAuth = p.requiresAuth
      if (p.title) {
        r.meta.title = p.title
      }
      if (p.icon) {
        r.meta.icon = p.icon
      }
      if (!parentRouter.children) {
        parentRouter.children = []
      }
      parentRouter.children.push(r)
      convertChildRouter(sourceRouter, r, item.id)
    }
  })
  return parentRouter.children
}

export default new Router({
  // mode: 'history', // 后端支持可开
  // scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
