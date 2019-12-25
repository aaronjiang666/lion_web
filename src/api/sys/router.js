import request from '@/utils/request'

export function routerList(parameter) {
  return request({
    url: '/admin/routers/getRouterList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function getAllRouter() {
  return request({
    url: '/admin/routers/getAllRouter',
    method: 'get'
  })
}

export function getRouterById(id) {
  return request({
    url: '/admin/routers/getRouterById?id=' + id,
    method: 'get'
  })
}

export function delRouter(id) {
  return request({
    url: '/admin/routers/delRouter?id=' + id,
    method: 'get'
  })
}

export function saveRouter(parameter) {
  return request({
    url: '/admin/routers/saveRouter',
    method: 'post',
    data: {
      component: parameter.component,
      groupName: parameter.groupName,
      meta: parameter.meta,
      name: parameter.name,
      parentId: parameter.parentId,
      path: parameter.path,
      redirect: parameter.redirect
    }
  })
}

export function updateRouter(parameter) {
  return request({
    url: '/admin/routers/editRouter',
    method: 'post',
    data: {
      id: parameter.id,
      component: parameter.component,
      groupName: parameter.groupName,
      meta: parameter.meta,
      name: parameter.name,
      parentId: parameter.parentId,
      path: parameter.path,
      redirect: parameter.redirect
    }
  })
}
