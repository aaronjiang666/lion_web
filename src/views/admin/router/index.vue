<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <router-edit ref="routerEdit" :parent-router-list="parentRouterList" @save-finished="getRouterList()"/>
      <el-row class="search-row">
        <el-col :span="14">
          <el-input v-model="search.condition.name" placeholder="路由名称" size="small">
            <el-button slot="append" icon="el-icon-search" @click="getRouterList()"/>
          </el-input>
        </el-col>
        <el-col :span="10" style="text-align: right;">
          <el-button
            v-show="permission.add"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleCreateRouter()">添加</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table :data="routerList" border size="mini" header-cell-class-name="header-row">
            <el-table-column prop="id" label="路由Id" header-align="center" align="center"/>
            <el-table-column prop="groupName" label="路由组名" header-align="center" align="center"/>
            <el-table-column prop="component" label="组件路径" header-align="center" align="center"/>
            <el-table-column prop="name" label="路由名称" header-align="center" align="center"/>
            <el-table-column prop="parentId" label="父路由Id" header-align="center" align="center"/>
            <el-table-column prop="path" label="路径名称" header-align="center" align="center" />
            <el-table-column prop="redirect" label="预跳转路径" header-align="center" align="center"/>
            <el-table-column prop="meta" label="扩展属性" header-align="center" align="center"/>
            <el-table-column label="操作" header-align="center" align="center" width="200">
              <template slot-scope="scope">
                <el-button
                  v-show="permission.edit"
                  type="primary"
                  size="mini"
                  @click="handleEditRouter(scope.$index, scope.row)">编辑</el-button>
                <el-button
                  v-show="permission.remove"
                  type="danger"
                  size="mini"
                  @click="handleDeleteRouter(scope.$index, scope.row)">删除</el-button>
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
            :total="routerTotal"
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
import { routerList, getAllRouter, getRouterById, delRouter } from '@/api/sys/router'
import store from '@/store'
import RouterEdit from '@/components/Router/routerEdit'

export default {
  components: { RouterEdit },
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
      current_page: 1,
      routerTotal: 0,
      routerList: [],
      parentRouterList: []
    }
  },
  created() {
    this.pageInit()
  },
  methods: {
    getRouterList() {
      this.loading = true
      routerList(this.search)
        .then(response => {
          this.routerTotal = response.data.total
          this.current_page = response.data.current
          this.routerList = response.data.rows
          this.loading = false
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    handleSizeChange(val) {
      this.search.size = val
      this.getRouterList()
    },
    handleCurrentChange(val) {
      this.search.pageNum = val
      this.getRouterList()
    },

    async pageInit() {
      this.loading = true
      let resources = store.getters.resources
      let read = resources.find(item => {
        return item.permission === 'admin:routers:read'
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
      routerList(this.search).then(response => {
        let data = response.data
        this.routerList = data.rows
        this.routerTotal = data.total
        this.current_page = data.current
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:routers:create'
        })
        this.permission.edit = resources.find(item => {
          return item.permission === 'admin:routers:update'
        })
        this.permission.remove = resources.find(item => {
          return item.permission === 'admin:routers:delete'
        })
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    handleCreateRouter() {
      this.loading = true
      getAllRouter()
        .then(response => {
          let data = response.data
          this.parentRouterList = this.getParentRouterList(data)
          this.loading = false
          this.$refs.routerEdit.$emit('openAddRouterDialog')
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    async handleEditRouter(index, row) {
      this.loading = true
      try {
        let [getRouterResp, listRootRouterResp] = await Promise.all([
          getRouterById(row.id),
          getAllRouter()
        ])
        this.parentRouterList = this.getParentRouterList(listRootRouterResp.data)
        this.$refs.routerEdit.$emit('openEditRouterDialog', getRouterResp.data)
        this.loading = false
      } catch (error) {
        this.outputError(error)
      }
    },
    handleDeleteRouter(index, row) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          delRouter(row.id)
            .then(response => {
              this.loading = false
              this.getRouterList()
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
