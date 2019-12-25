<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <user-edit ref="userEdit" @save-finished="searchUser" />
      <change-password ref="changePassword" @save-finished="searchUser" />
      <el-row class="search-row">
        <el-col :span="8">
          <el-input v-model="search.condition.name" placeholder="用户名" size="small">
            <el-button slot="append" icon="el-icon-search" @click="searchUser()" />
          </el-input>
        </el-col>
        <el-col :span="12" style="text-align: right;">
          <el-button
            v-show="permission.add"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleCreateUser()"
          >
            添加
          </el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table
            :data="userList"
            stripe
            border
            header-cell-class-name="header-row"
          >
            <el-table-column prop="name" label="用户名" header-align="center" align="center" />
            <el-table-column prop="loginName" label="登录名称" header-align="center" align="center" />
            <el-table-column
              width="100"
              prop="userType"
              label="用户类型"
              header-align="center"
              align="center"
            >
              <template slot-scope="scope">
                <span>
                  {{ handleUserTypeText(scope.row.userType) }}</span>
              </template>
            </el-table-column>
            <el-table-column width="80" prop="locked" label="状态" header-align="center" align="center">
              <template slot-scope="scope">
                <span
                  :class="{ 'user-locked': scope.row.locked === '1',
                            'user-not-locked': scope.row.locked==='0' }"
                >
                  {{ scope.row.locked === '1' ? '锁定' : '可用' }}</span>
              </template>
            </el-table-column>
            <el-table-column
              width="80"
              prop="isVerify"
              label="验证器"
              header-align="center"
              align="center"
            >
              <template slot-scope="scope">
                <span
                  :class="handleisVerifyClass(scope.row.isVerify)"
                >
                  {{ handleisVerifyText(scope.row.isVerify) }}</span>
              </template>
            </el-table-column>
            <el-table-column width="160" prop="createTime" label="注册时间" header-align="center" align="center" />
            <el-table-column label="操作" header-align="center" align="center" width="360">
              <template slot-scope="scope">
                <el-button
                  v-show="permission.edit"
                  type="primary"
                  size="mini"
                  @click="handleEditUser(scope.$index, scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-show="permission.edit"
                  type="primary"
                  size="mini"
                  @click="handleChangePassword(scope.$index, scope.row)"
                >
                  重置密码
                </el-button>
                <el-button
                  v-show="permission.edit"
                  type="primary"
                  size="mini"
                  @click="resetGoogleAuth(scope.$index, scope.row)"
                >
                  重置验证器
                </el-button>
                <el-button
                  v-show="permission.edit"
                  type="primary"
                  size="mini"
                  @click="resetIpadder(scope.$index, scope.row)"
                >
                  重置IP
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-pagination
            :current-page="current_page"
            :page-sizes="[5, 10, 20]"
            :page-size="10"
            :total="userTotal"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { resetIpadder, resetGoogleAuth, userList, getUser, initiPassword } from '@/api/sys/user'
import { getAllRole } from '@/api/sys/role'
import UserEdit from '@/components/User/userEdit'
import ChangePassword from '@/components/User/changePassword'
import store from '@/store'

export default {
  name: 'UserList',
  components: { UserEdit, ChangePassword },
  data() {
    return {
      userList: [],
      permission: {
        add: false,
        edit: false,
        remove: false
      },
      userTotal: 0,
      current_page: 1,
      search: {
        condition: {},
        pageNum: 0,
        size: 0
      },
      loading: true
    }
  },
  created() {
    this.pageInit()
  },
  methods: {
    searchUser() { // 查询用户
      this.loading = true
      userList(this.search).then(response => {
        let data = response.data
        this.userList = data.rows
        this.userTotal = data.total
        this.current_page = data.current
      }).catch(error => {
        this.outputError(error)
      })
      this.loading = false
    },
    handleisVerifyClass(val) {
      if (val === 0) {
        return 'user-locked'
      } else {
        return 'user-not-locked'
      }
    },
    handleisVerifyText(val) {
      if (val === 0) {
        return '未绑定'
      } else {
        return '已绑定'
      }
    },
    handleUserTypeText(val) {
      if (val === 1) {
        return '平台管理'
      } else if (val === 2) {
        return '商户后台'
      } else if (val === 3) {
        return '代理用户'
      }
    },
    async handleCreateUser() { // 新建用户
      this.loading = true
      try {
        let [allRoleList] = await Promise.all([
          getAllRole()
        ])
        this.$refs.userEdit.$emit('openAddUserDialog', allRoleList.data)
        this.loading = false
      } catch (error) {
        this.outputError(error)
      }
    },

    async handleEditUser(index, row) {
      this.loading = true
      try {
        let [userResp, allRoleResp] = await Promise.all([
          getUser(row.id),
          getAllRole()
        ])
        this.$refs.userEdit.$emit('openEditUserDialog', userResp.data, allRoleResp.data)
        this.loading = false
      } catch (e) {
        this.outputError(e)
      }
    },

    async handleChangePassword(index, row) {
      this.loading = true
      this.$confirm('确定初始化该用户密码吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        initiPassword(row.id).then(response => {
          this.loading = false
        }).catch(error => {
          this.outputError(error)
        })
      }).catch(() => {})
      this.loading = false
    },
    async resetGoogleAuth(index, row) {
      this.loading = true
      this.$confirm('确定重置该用户Google验证器吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetGoogleAuth(row.id).then(response => {
          this.loading = false
        }).catch(error => {
          this.outputError(error)
        })
      }).catch(() => {})
      this.loading = false
    },

    async resetIpadder(index, row) {
      this.loading = true
      this.$confirm('确定重置该用户登录IP吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetIpadder(row.id).then(response => {
          this.loading = false
        }).catch(error => {
          this.outputError(error)
        })
      }).catch(() => {})
      this.loading = false
    },

    handleSizeChange(val) {
      this.search.size = val
      this.searchUser()
    },
    handleCurrentChange(val) {
      this.search.pageNum = val
      this.searchUser()
    },

    async pageInit() { // 初始化页面数据
      this.loading = true
      let resources = store.getters.resources
      let read = resources.find(item => {
        return item.permission === 'admin:users:read'
      })
      if (!read) {
        this.loading = false
        new Promise((resolve, reject) => {
          reject(new Error('没有访问权限'))
        }).catch(reason => {
          this.outputError(reason)
        })
        return
      }
      userList(this.search).then(response => {
        let data = response.data
        this.userList = data.rows
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:users:create'
        })
        this.permission.edit = resources.find(item => {
          return item.permission === 'admin:users:update'
        })
        this.permission.remove = resources.find(item => {
          return item.permission === 'admin:users:delete'
        })
        this.userTotal = data.total
        this.current_page = data.current
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    outputError(error) {
      console.log(error.response ? error.response : error.message)
      this.loading = false
      this.$message({
        showClose: true,
        message: error.message,
        type: 'error'
      })
    }
  }
}
</script>

<style scoped>
  .user-locked {
    color: red;
  }

  .user-not-locked {
    color: green;
  }
</style>
