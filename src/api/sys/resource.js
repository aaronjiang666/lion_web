import request from '@/utils/request'

export function getResourceList(parameter) {
  return request({
    url: '/admin/resource/getResourceList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function saveResource(parameter) {
  return request({
    url: '/admin/resource/saveResource',
    method: 'post',
    data: {
      code: parameter.code,
      name: parameter.name,
      permission: parameter.permission,
      routerId: parameter.routerId,
      url: parameter.url
    }
  })
}

export function editResource(parameter) {
  return request({
    url: '/admin/resource/editResource',
    method: 'post',
    data: {
      id: parameter.id,
      code: parameter.code,
      name: parameter.name,
      permission: parameter.permission,
      routerId: parameter.routerId,
      url: parameter.url
    }
  })
}

export function getResourceByRouterIds(parameter) {
  return request({
    url: '/admin/resource/getResourceByRouterIds',
    method: 'post',
    data: {
      ids: parameter.routerIds
    }
  })
}

export function delResource(id) {
  return request({
    url: '/admin/resource/delResource?id=' + id,
    method: 'get'
  })
}

export function getResourceById(id) {
  return request({
    url: '/admin/resource/getResourceById?id=' + id,
    method: 'get'
  })
}
