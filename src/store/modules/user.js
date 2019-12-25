import { passwordLogin, googleAutLogin, logout, getInfo } from '@/api/sys/login'
import { getToken, setToken, removeToken, removeRouter } from '@/utils/auth'
import { convertRouter, constantRouterMap, setAsyncRouter } from '@/router'

const user = {
  state: {
    token: getToken(),
    avatar: '',
    roles: [],
    routers: [],
    resources: [],
    info: {},
    menu: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_ROUTERS: (state, routers) => {
      state.routers = routers
    },
    SET_RESOURCES: (state, resources) => {
      state.resources = resources
    },
    SET_MENU: (state, data) => {
      state.menu = data
    },
    SET_INFO: (state, data) => {
      state.info = data
    }
  },

  actions: {
    // 用户名密码登录登录
    NamePwdLogin({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        passwordLogin(userInfo).then(response => {
          const data = response.data
          setToken(data.token)
          commit('SET_TOKEN', data.token)
          if (data.routerList && data.routerList.length > 0) {
            setAsyncRouter(data.routerList)
            let r = constantRouterMap.concat(convertRouter(data.routerList))
            commit('SET_MENU', r)
          } else {
            reject('getInfo: router must be a non-null array !')
          }
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // Google身份验证器登录
    GoogleAutLogin({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        googleAutLogin(userInfo).then(response => {
          const data = response.data
          setToken(data.token)
          commit('SET_TOKEN', data.token)
          if (data.routerList && data.routerList.length > 0) {
            setAsyncRouter(data.routerList)
            let r = constantRouterMap.concat(convertRouter(data.routerList))
            commit('SET_MENU', r)
          } else {
            reject('getInfo: router must be a non-null array !')
          }
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo(state.token).then(response => {
          const result = response.data
          if (result.roleList && result.roleList.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', result.roleList)
            commit('SET_RESOURCES', result.resourceList)
          } else {
            reject('getInfo: roles must be a non-null array !')
          }
          commit('SET_INFO', result)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_ROUTERS', [])
          removeToken()
          removeRouter()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_ROUTERS', [])
        removeToken()
        removeRouter()
        resolve()
      })
    }
  }
}

export default user
