import request from '@/utils/request'

export function passwordLogin(parameter) {
  return request({
    url: '/auth/passwordLogin',
    method: 'post',
    data: {
      userName: parameter.userName.trim(),
      password: parameter.password,
      vCode: parameter.vCode,
      loginType: parameter.loginType,
      clientId: parameter.clientId
    }
  })
}

export function googleAutLogin(parameter) {
  return request({
    url: '/auth/googleAutLogin',
    method: 'post',
    data: {
      userName: parameter.userName.trim(),
      loginType: parameter.loginType,
      googleCode: parameter.code
    }
  })
}

export function getInfo(token) {
  return request({
    url: '/auth/getCurrentUser',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'get'
  })
}

export function getVCodeImage() {
  return request({
    url: '/auth/getVCodeImage',
    method: 'get'
  })
}

