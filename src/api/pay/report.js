import request from '@/utils/request'


export function getMarchnatIntoAccount(parameter) {
  return request({
    url: '/admin/report/getMarchnatIntoAccount',
    method: 'post',
    data: {
      condition: parameter.condition
    }
  })
}

export function getMarchnatOutAccount(parameter) {
  return request({
    url: '/admin/report/getMarchnatOutAccount',
    method: 'post',
    data: {
      condition: parameter.condition
    }
  })
}

export function proxyIntoAccount(parameter) {
  return request({
    url: '/admin/report/proxyIntoAccount',
    method: 'post',
    data: {
      condition: parameter.condition
    }
  })
}

export function proxyOutAccount(parameter) {
  return request({
    url: '/admin/report/proxyOutAccount',
    method: 'post',
    data: {
      condition: parameter.condition
    }
  })
}


export function sysChannelMarchanatDayInto(parameter) {
  return request({
    url: '/admin/report/sysChannelMarchanatDayInto',
    method: 'post',
    data: {
      condition: parameter.condition
    }
  })
}

export function sysChannelDayInto(parameter) {
  return request({
    url: '/admin/report/sysChannelDayInto',
    method: 'post',
    data: {
      condition: parameter.condition
    }
  })
}

