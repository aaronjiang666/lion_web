<template>
  <el-container v-loading="loading">
    <el-aside width="200px">
      <el-tree
        :data="routerTreeNodes"
        :props="defaultProps"
        :highlight-current="true"
        :default-expand-all="true"
        @node-click="handleNodeClick"/>
    </el-aside>
    <el-main>
      <el-row>
        <el-col :span="24">
          <resource-edit ref="resourceEdit" @save-finished="getResourceList()"/>
          <el-row class="search-row">
            <el-col :span="14">
              <el-input v-model="search.condition.name" placeholder="资源名称" size="small">
                <el-button slot="append" icon="el-icon-search" @click="getRouterList()"/>
              </el-input>
            </el-col>
            <el-col :span="10" style="text-align: right;">
              <el-button
                v-show="permission.add"
                type="primary"
                icon="el-icon-plus"
                size="small"
                @click="handleCreateResource()">添加
              </el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-table :data="resourceList" border size="mini" header-cell-class-name="header-row">
                <el-table-column prop="name" label="资源名称" header-align="center" align="center"/>
                <el-table-column prop="code" label="资源代码" header-align="center" align="center"/>
                <el-table-column prop="permission" label="权限代码" header-align="center" align="center"/>
                <el-table-column prop="url" label="后端url" header-align="center" align="center"/>
                <el-table-column label="操作" header-align="center" align="center" width="200">
                  <template slot-scope="scope">
                    <el-button
                      v-show="permission.edit"
                      type="primary"
                      size="mini"
                      @click="handleEditResource(scope.$index, scope.row)">编辑
                    </el-button>
                    <el-button
                      v-show="permission.remove"
                      type="danger"
                      size="mini"
                      @click="handleDeleteRouter(scope.$index, scope.row)">删除
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
                :total="total"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"/>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import { getResourceList, getResourceById, delResource } from '@/api/sys/resource'
import { getAllRouter } from '@/api/sys/router'
import { createRouterTree } from '@/utils/treeUtils'
import store from '@/store'
import ResourceEdit from '@/components/Resource/resourceEdit'

export default {
  components: { ResourceEdit },
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
      total: 0,
      routerNode: {
        id: 0,
        name: ''
      },
      resourceList: [],
      routerList: [],
      routerTreeNodes: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  created() {
    this.pageInit()
    this.getResourceList()
  },
  methods: {
    handleNodeClick(data) {
      this.routerNode = data
      this.search.condition.router_id = data.id
      this.getResourceList()
    },
    getResourceList() {
      this.loading = true
      getResourceList(this.search)
        .then(response => {
          this.total = response.data.total
          this.current_page = response.data.current
          this.resourceList = response.data.rows
          this.loading = false
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    handleSizeChange(val) {
      this.search.size = val
      this.getResourceList()
    },
    handleCurrentChange(val) {
      this.search.pageNum = val
      this.getResourceList()
    },

    async pageInit() {
      this.loading = true
      let resources = store.getters.resources
      let read = resources.find(item => {
        return item.permission === 'admin:resources:read'
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
      this.permission.add = resources.find(item => {
        return item.permission === 'admin:resources:create'
      })
      this.permission.edit = resources.find(item => {
        return item.permission === 'admin:resources:update'
      })
      this.permission.remove = resources.find(item => {
        return item.permission === 'admin:resources:delete'
      })
      getAllRouter().then(response => { // 获取所有路由,创建路由树
        this.routerTreeNodes = createRouterTree(response.data)
      }).catch(error => {
        this.outputError(error)
      })
      this.loading = false
    },
    handleCreateResource() {
      this.loading = true
      if (this.routerNode.id === 0) {
        this.$message({
          showClose: true,
          message: '请选择路由！',
          type: 'error'
        })
        this.loading = false
        return
      }
      this.loading = false
      this.$refs.resourceEdit.$emit('openAddResourceDialog', this.routerNode)
    },

    async handleEditResource(index, row) {
      this.loading = true
      try {
        let [resource, routers] = await Promise.all([
          getResourceById(row.id),
          getAllRouter()
        ])
        this.loading = false
        this.routerList = this.getRouterList(routers.data)
        this.$refs.resourceEdit.$emit('openEditResourceDialog', resource.data, this.getRouterList(routers.data))
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
          delResource(row.id)
            .then(response => {
              this.loading = false
              this.getResourceList()
            })
            .catch(error => {
              this.outputError(error)
            })
        })
        .catch(() => {
        })
    },
    getRouterList(routers) {
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
</style>
