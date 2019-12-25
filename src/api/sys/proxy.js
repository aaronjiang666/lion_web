import request from '@/utils/request'

export function getProxyInfo() {
  return request({
    url: '/admin/proxy/getProxyInfo',
    method: 'get'
  })
}

export function getProxyList(parameter) {
  return request({
    url: '/admin/proxy/getProxyList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function stopProxy(id) {
  return request({
    url: '/admin/proxy/stopProxy?id=' + id,
    method: 'get'
  })
}

export function enableProxy(id) {
  return request({
    url: '/admin/proxy/enableProxy?id=' + id,
    method: 'get'
  })
}

export function saveProxy(parameter) {
  return request({
    url: '/admin/proxy/saveProxy',
    method: 'post',
    data: {
      loginName: parameter.loginName,
      name: parameter.name,
      userName: parameter.userName,
      password: parameter.password,
      phone: parameter.phone,
      email: parameter.email,
      qq: parameter.qq,
      state: parameter.state
    }
  })
}
