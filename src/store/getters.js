const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  info: state => state.user.info,
  roles: state => state.user.roles,
  routers: state => state.user.routers,
  resources: state => state.user.resources,
  menu: state => state.user.menu
}
export default getters
