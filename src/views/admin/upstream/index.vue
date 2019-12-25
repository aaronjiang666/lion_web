<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <upstream-edit ref="upstreamEdit" @save-finished="getDataList" />
      <el-row class="search-row">
        <el-col :span="14">
          <el-input v-model="search.condition.marchant_no" placeholder="商户号" size="mini">
            <el-button slot="append" icon="el-icon-search" @click="getDataList()" />
          </el-input>
        </el-col>
        <el-col :span="10" style="text-align: right;">
          <el-button v-show="permission.add" type="primary" icon="el-icon-plus" size="small" @click="handleCreate()">
            添加
          </el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table :data="dataList" border size="mini" header-cell-class-name="header-row">
            <el-table-column prop="name" label="平台名称" header-align="center" align="center" />
            <el-table-column prop="marchantNo" label="商户号" header-align="center" align="center" />
            <el-table-column :show-overflow-tooltip="true" prop="marchantKey" label="商户KEY" header-align="center" align="center" />
            <el-table-column :show-overflow-tooltip="true" prop="marchantToken" label="商户Token" header-align="center" align="center" />
            <el-table-column :show-overflow-tooltip="true" prop="apiUrl" label="请求网关" header-align="center" align="center" />
            <el-table-column :show-overflow-tooltip="true" prop="asynUrl" label="异步回调URL" header-align="center" align="center" />
            <el-table-column :show-overflow-tooltip="true" prop="syncUrl" label="同步回调URL" header-align="center" align="center" />
            <el-table-column prop="reqBeanName" label="请求处理类名" header-align="center" align="center" />
            <el-table-column prop="repBeanName" label="返回处理类名" header-align="center" align="center" />
            <el-table-column :show-overflow-tooltip="true" prop="remarks" label="备注" header-align="center" align="center" />
            <el-table-column label="操作" header-align="center" align="center" width="200">
              <template slot-scope="scope">
                <el-button v-show="permission.edit" type="primary" size="mini" @click="handleEdit(scope.$index, scope.row)">
                  编辑
                </el-button>
                <el-button v-show="permission.remove" type="danger" size="mini" @click="handleDelete(scope.$index, scope.row)">
                  删除
                </el-button>
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
            @current-change="handleCurrentChange"
          />
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { getList, getById, delUpstream } from '@/api/pay/upstream'
import UpstreamEdit from '@/components/Upstream/upstreamEdit'
import store from '@/store'

export default {
  name: 'UpstreamList',
  components: { UpstreamEdit },
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
      getList(this.search)
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
        return item.permission === 'admin:upstream:read'
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
      getList(this.search).then(response => {
        let data = response.data
        this.dataList = data.rows
        this.total = data.total
        this.pageNum = data.current
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:upstream:create'
        })
        this.permission.edit = resources.find(item => {
          return item.permission === 'admin:upstream:update'
        })
        this.permission.remove = resources.find(item => {
          return item.permission === 'admin:upstream:delete'
        })
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    handleCreate() {
      this.loading = true
      this.$refs.upstreamEdit.$emit('openAddUpstreamDialog')
      this.loading = false
    },
    async handleEdit(index, row) {
      this.loading = true
      getById(row.id)
        .then(response => {
          this.$refs.upstreamEdit.$emit('openEditUpstreamDialog', response.data)
          this.loading = false
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    handleDelete(index, row) {
      this.loading = true
      delUpstream(row.id).then(response => {
        this.getDataList()
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

<style lang="scss" scoped>
  .search-row {
    padding-bottom: 8px;

    .el-input {
      width: 260px;
    }
  }

</style>
