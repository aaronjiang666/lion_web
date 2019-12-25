<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <el-row class="search-row">
        <el-col :span="14">
          <el-input v-model="search.condition.merchant_no" placeholder="商户号" size="small">
            <el-button slot="append" icon="el-icon-search" @click="getDataList()"/>
          </el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table :data="dataList" border size="mini" header-cell-class-name="header-row">
            <el-table-column prop="marchantNo" label="商户号" header-align="center" align="center"/>
            <el-table-column prop="bankName" label="银行名称" header-align="center" align="center"/>
            <el-table-column prop="accountName" label="开户名" header-align="center" align="center"/>
            <el-table-column prop="accountNumber" label="账号" header-align="center" align="center"/>
            <el-table-column prop="branchName" label="支行名称" header-align="center" align="center"/>
            <el-table-column prop="branchAddr" label="支行地址" header-align="center" align="center"/>
            <el-table-column prop="state" label="状态" header-align="center" align="center">
              <template slot-scope="scope">
                <span :class="{ 'state-normal': scope.row.state === 1, 'state-stop': scope.row.state===2 }">{{ scope.row.state === 1 ? '待审核' : '已审核' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" header-align="center" align="center" width="100">
              <template slot-scope="scope">
                <el-button v-show="permission.edit && scope.row.state === 1" style="margin-left: 0px;" type="primary" size="mini" @click="auditing(scope.$index, scope.row)">审核</el-button>
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
import { getAllBankInfoList, bankInfoAuditing } from '@/api/pay/bankinfo'
import store from '@/store'

export default {
  data() {
    return {
      loading: false,
      permission: {
        add: false,
        edit: false
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
      getAllBankInfoList(this.search)
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
        return item.permission === 'admin:bankinfo:read'
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
      getAllBankInfoList(this.search).then(response => {
        let data = response.data
        this.dataList = data.rows
        this.total = data.total
        this.pageNum = data.current
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:bankinfo:create'
        })
        this.permission.edit = resources.find(item => {
          return item.permission === 'admin:bankinfo:update'
        })
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    auditing(index, row) {
      this.$confirm('确定审核通过吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        bankInfoAuditing(row.id).then(response => {
          this.getDataList()
        }).catch(error => {
          this.outputError(error)
        })
        this.loading = false
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

  .state-normal {
    color: red;
  }

  .state-stop {
    color: green;
  }

</style>
