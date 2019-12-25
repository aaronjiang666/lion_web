import request from '@/utils/request'

export function userList(parameter) {
  return request({
    url: '/admin/user/userList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function changePwd(parameter) {
  return request({
    url: '/admin/user/changePwd',
    method: 'post',
    data: {
      userId: parameter.id,
      oldPassword: parameter.oldPassword,
      newPassword: parameter.newPassword
    }
  })
}

export function saveUser(user) {
  return request({
    url: '/admin/user/saveUser',
    method: 'post',
    data: {
      locked: user.locked,
      userName: user.name,
      loginName: user.loginName,
      password: user.password,
      roleIds: user.roleIds,
      userType: user.userType,
      marchantNo: user.marchantNo
    }
  })
}

export function getGooleSecret() {
  return request({
    url: '/admin/user/getGooleSecret',
    method: 'get'
  })
}

export function bindGoogleAuthenticator(parameter) {
  return request({
    url: '/admin/user/bindGoogleAuthenticator',
    method: 'post',
    data: {
      secret: parameter.secret,
      googleCode: parameter.googleCode
    }
  })
}

export function bindIpadder(ipAdder) {
  return request({
    url: '/admin/user/bindIpAdder?ipAdder=' + ipAdder,
    method: 'get'
  })
}

export function resetIpadder(userId) {
  return request({
    url: '/admin/user/resetIpadder?userId=' + userId,
    method: 'get'
  })
}

export function getUser(userId) {
  return request({
    url: '/admin/user/getUser?userId=' + userId,
    method: 'get'
  })
}

export function initiPassword(userId) {
  return request({
    url: '/admin/user/initiPassword?id=' + userId,
    method: 'get'
  })
}

export function resetGoogleAuth(userId) {
  return request({
    url: '/admin/user/resetGoogleAuth?userId=' + userId,
    method: 'get'
  })
}

export function editUser(user) {
  return request({
    url: '/admin/user/editUser',
    method: 'post',
    data: {
      id: user.id,
      locked: user.locked,
      userName: user.name,
      roleIds: user.roleIds
    }
  })
}

