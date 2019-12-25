import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import 'babel-polyfill'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import * as filters from './common/filters'
import '@/icons' // icon
import '@/permission' // permission control

Object.keys(filters).forEach(k => Vue.filter(k, filters[k])) // 注册过滤器

Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
