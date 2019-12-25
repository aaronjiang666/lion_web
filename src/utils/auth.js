const TokenKey = 'Admin-Token'
const RouterKey = 'RouterKey'

export function getToken() {
  return sessionStorage.getItem(TokenKey)
}

export function setToken(token) {
  return sessionStorage.setItem(TokenKey, token)
}

export function removeToken() {
  return sessionStorage.removeItem(TokenKey)
}

export function getRouter() {
  return sessionStorage.getItem(RouterKey)
}

export function setRouter(routers) {
  return sessionStorage.setItem(RouterKey, routers)
}

export function removeRouter() {
  return sessionStorage.removeItem(RouterKey)
}
