<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <role-edit ref="roleEdit" @save-finished="getDataList()"/>
      <el-row class="search-row">
        <el-col :span="14">
          <el-input v-model="search.condition.name" placeholder="角色名称" size="small">
            <el-button slot="append" icon="el-icon-search" @click="getDataList()"/>
          </el-input>
        </el-col>
        <el-col :span="10" style="text-align: right;">
          <el-button
            v-show="permission.add"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleCreateRole()">添加</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table :data="dataList" border size="mini" header-cell-class-name="header-row">
            <el-table-column prop="name" label="角色名称" header-align="center" align="center"/>
            <el-table-column prop="code" label="角色代码" header-align="center" align="center"/>
            <el-table-column prop="createTime" label="创建日期" header-align="center" align="center"/>
            <el-table-column label="操作" header-align="center" align="center" width="200">
              <template slot-scope="scope">
                <el-button
                  v-show="permission.edit"
                  type="primary"
                  size="mini"
                  @click="handleEditRole(scope.$index, scope.row)">编辑</el-button>
                <el-button
                  v-show="permission.remove"
                  type="danger"
                  size="mini"
                  @click="handleDeleteRole(scope.$index, scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-pagination
            :current-page="search.pageNum"
            :page-sizes="[5, 10, 20]"
            :page-size="search.size"
            :total="total"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"/>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { getRoleList, delRole, getRoleById } from '@/api/sys/role'
import store from '@/store'
import RoleEdit from '@/components/Role/roleEdit'

export default {
  components: { RoleEdit },
  data() {
    return {
      loading: false,
      permission: {
        add: false,
        edit: false,
        remove: false
      },
      search: {
        condition: {},
        pageNum: 1,
        size: 20
      },
      total: 0,
      dataList: []
    }
  },
  created() {
    this.pageInit()
  },
  methods: {
    getDataList() {
      this.loading = true
      getRoleList(this.search)
        .then(response => {
          this.total = response.data.total
          this.pageNum = response.data.current
          this.dataList = response.data.rows
          this.loading = false
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    handleSizeChange(val) {
      this.search.size = val
      this.getDataList()
    },
    handleCurrentChange(val) {
      this.search.pageNum = val
      this.getDataList()
    },

    async pageInit() {
      this.loading = true
      let resources = store.getters.resources
      let read = resources.find(item => {
        return item.permission === 'admin:roles:read'
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
      getRoleList(this.search).then(response => {
        let data = response.data
        this.dataList = data.rows
        this.total = data.total
        this.pageNum = data.current
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:roles:create'
        })
        this.permission.edit = resources.find(item => {
          return item.permission === 'admin:roles:update'
        })
        this.permission.remove = resources.find(item => {
          return item.permission === 'admin:roles:delete'
        })
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    async handleCreateRole() {
      this.$refs.roleEdit.$emit('openAddRoleDialog')
    },
    async handleEditRole(index, row) {
      this.loading = true
      getRoleById(row.id)
        .then(response => {
          this.$refs.roleEdit.$emit('openEditRoleDialog', response.data)
          this.loading = false
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    handleDeleteRole(index, row) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          delRole(row.id)
            .then(response => {
              this.loading = false
              this.getDataList()
            })
            .catch(error => {
              this.outputError(error)
            })
        })
        .catch(() => {})
    },
    getParentRouterList(routers) {
      let result = []
      result.push(
        {
          id: 0,
          title: '根路由'
        }
      )
      for (let router of routers) {
        let meta = JSON.parse(router.meta)
        result.push({
          id: router.id,
          title: meta.title
        })
      }
      return result
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

<style lang="scss" scoped>
  .search-row {
    padding-bottom: 8px;
    .el-input {
      width: 260px;
    }
  }

  .router-locked {
    color: red;
  }
  .router-not-locked {
    color: green;
  }
</style>
