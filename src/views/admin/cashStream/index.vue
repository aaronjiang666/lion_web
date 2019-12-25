<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <el-row class="search-row">
        <el-col :span="20">
          <el-input v-model="search.condition.merchant_no" placeholder="商户号" size="mini" />
          <el-input v-model="search.condition.bill_no" placeholder="单号" size="mini" />
          <el-date-picker
            size="mini"
            v-model="outData"
            type="datetimerange"
            start-placeholder="入账开始日期"
            end-placeholder="入账结束日期"
            :default-time="['00:00:00','23:59:59']"
          />
          <el-button type="primary" size="mini" icon="el-icon-search" round @click="getDataList()">
            搜索
          </el-button>
          <el-button type="primary" size="mini" icon="el-icon-delete" round @click="queryReset()">
            重置
          </el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table :data="dataList" border stripe size="mini" header-cell-class-name="header-row">
            <el-table-column prop="marchantNo" label="商户号" header-align="center" align="center" />
            <el-table-column prop="marchantType" label="明细类型" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ handleUserTypeText(scope.row.marchantType) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="billNo" label="单号" header-align="center" align="center" />
            <el-table-column label="收入" header-align="center">
              <el-table-column prop="orderMoney" label="原始金额" header-align="center" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.orderMoney | CentToDollars }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="intoMoney" label="结算金额" header-align="center" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.intoMoney | CentToDollars }}</span>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column prop="poundage" label="手续费" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.poundage | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column label="支出" header-align="center">
              <el-table-column prop="applyMoney" label="提现金额" header-align="center" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.applyMoney | CentToDollars }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="outMoney" label="实际到账金额" header-align="center" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.outMoney | CentToDollars }}</span>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column prop="surplusMoney" label="余额" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.surplusMoney | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="isAccount" label="入账状态" header-align="center" align="center">
              <template slot-scope="scope">
                <span :class="{ 'state-normal': scope.row.isAccount === 0, 'state-stop': scope.row.isAccount===1 }">
                  {{ scope.row.isAccount === 0 ? '未入账' : '已入账' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="accountTime" label="入账时间" header-align="center" align="center" />
            <el-table-column prop="createTime" label="创建时间" header-align="center" align="center" />
            <el-table-column prop="remark" label="备注" header-align="center" align="center" />
          </el-table>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-pagination
            :current-page="search.pageNum"
            :page-sizes="[5, 10, 20, 30, 40, 50, 100, 200]"
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
import { getCashStreamAllList } from '@/api/pay/cashStream'
import { dateFormat } from '@/common/commonFun'
import store from '@/store'

export default {
  data() {
    return {
      loading: false,
      search: {
        condition: {},
        pageNum: 1,
        size: 10
      },
      total: 0,
      dataList: [],
      outData: ''
    }
  },
  created() {
    this.pageInit()
  },
  methods: {
    getDataList() {
      this.loading = true
      if (this.outData.length === 2) {
        this.search.condition.startTime = dateFormat(this.outData[0], 'yyyy-MM-dd hh:mm:ss')
        this.search.condition.endTime = dateFormat(this.outData[1], 'yyyy-MM-dd hh:mm:ss')
      }
      getCashStreamAllList(this.search)
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
    queryReset() {
      this.outData = ''
      this.search.condition = {}
      this.getDataList()
    },
    async pageInit() {
      this.loading = true
      let resources = store.getters.resources
      let read = resources.find(item => {
        return item.permission === 'admin:cashStream:read'
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
      getCashStreamAllList(this.search).then(response => {
        let data = response.data
        this.dataList = data.rows
        this.total = data.total
        this.pageNum = data.current
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    handleUserTypeText(val) {
      if (val === 1) {
        return '平台'
      } else if (val === 2) {
        return '商户账'
      } else if (val === 3) {
        return '代理账'
      }
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
      width: 140px;
    }
    .el-date-editor--daterange.el-input,
    .el-date-editor--daterange.el-input__inner,
    .el-date-editor--timerange.el-input,
    .el-date-editor--timerange.el-input__inner{
      width: 280px
    }
  }

</style>
