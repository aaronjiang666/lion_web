import request from '@/utils/request'

export function getAllRole() {
  return request({
    url: '/admin/roles/getAllRole',
    method: 'get'
  })
}

export function delRole(id) {
  return request({
    url: '/admin/roles/delRole?id=' + id,
    method: 'get'
  })
}

export function getRoleById(id) {
  return request({
    url: '/admin/roles/getRoleById?id=' + id,
    method: 'get'
  })
}

export function getRoleList(parameter) {
  return request({
    url: '/admin/roles/getRoleList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function saveRole(parameter) {
  return request({
    url: '/admin/roles/saveRole',
    method: 'post',
    data: {
      code: parameter.code,
      name: parameter.name,
      routerIds: parameter.routerIds,
      resourceIds: parameter.resourceIds
    }
  })
}

export function editRole(parameter) {
  return request({
    url: '/admin/roles/editRole',
    method: 'post',
    data: {
      id: parameter.id,
      code: parameter.code,
      name: parameter.name,
      routerIds: parameter.routerIds,
      resourceIds: parameter.resourceIds
    }
  })
}
