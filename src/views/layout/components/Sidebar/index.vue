<template>
<div>
  <el-scrollbar wrap-class="scrollbar-wrapper">
    <el-menu
      :show-timeout="200"
      :default-active="$route.path"
      :collapse="isCollapse"
      :background-color="variables.menuBg"
      :text-color="variables.menuText"
      :active-text-color="variables.menuActiveText"
      mode="horizontal"
    >
      <sidebar-item v-for="route in menu" :key="route.path" :item="route" :base-path="route.path"/>

      <el-dropdown class="avatar-container" style="float: right;margin: 8px;" trigger="click">
        <div class="avatar-wrapper">
          <img src="@/assets/logo.png" class="user-avatar" style="border-radius: 8px;">
          <i class="el-icon-caret-bottom" style="color: #fff;"/>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link class="inlineBlock" to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided>
            <span style="display:block;" @click="changePwd">密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-menu>
    
    <changePwd ref="changePassword" @save-finished="logout" />
  </el-scrollbar>
  
  <navbar/>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import Navbar from '../Navbar'
import variables from '@/styles/variables.scss'
import SidebarItem from './SidebarItem'
import ChangePwd from '@/components/User/changePassword'

export default {
  components: { SidebarItem, ChangePwd, Navbar },
  data() {
    return {
      user: {
        id: 0,
        name: '',
        loginName: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'menu',
      'sidebar',
      'avatar',
      'info'
    ]),
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        this.$router.push({ path: '/' })
        location.reload() // Ϊ������ʵ����vue-router���� ����bug
      })
    },
    changePwd() {
      this.user.id = this.info.id
      this.user.name = this.info.name
      this.user.loginName = this.info.loginName
      this.$refs.changePassword.$emit('openChangePasswordDialog', this.user)
    }
  }
}
</script>
