<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <cash-in-apply-edit ref="cashInApplyEdit" @save-finished="getDataList" />
      <el-row class="search-row">
        <el-col :span="22">
          <el-date-picker
            v-model="applyData"
            size="mini"
            type="datetimerange"
            start-placeholder="申请开始日期"
            end-placeholder="申请结束日期"
            :default-time="['00:00:00','23:59:59']"
          />
          <el-select v-model="outState" size="mini" placeholder="拨款状态">
            <el-option v-for="item in appOutState" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-date-picker
            v-model="outData"
            size="mini"
            type="datetimerange"
            start-placeholder="打款开始日期"
            end-placeholder="打款结束日期"
            :default-time="['00:00:00','23:59:59']"
          />
          <el-button type="primary" size="mini" icon="el-icon-search" round @click="getDataList()">
            搜索
          </el-button>
          <el-button type="primary" size="mini" icon="el-icon-delete" round @click="queryReset()">
            重置
          </el-button>
        </el-col>
        <el-col :span="2" style="text-align: right;">
          <el-button v-show="permission.add" type="primary" icon="el-icon-plus" size="small" @click="handleCreate()">
            添加
          </el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table :data="dataList" :summary-method="getSummaries" show-summary border size="mini" header-cell-class-name="header-row">
            <el-table-column width="220" prop="outBillNo" label="申请单号" header-align="center" align="center" />
            <el-table-column width="80" prop="outState" label="拨款状态" header-align="center" align="center">
              <template slot-scope="scope">
                <span
                  :class="{ 'state-wait': scope.row.outState === 1,
                            'state-sussce': scope.row.outState===2,
                            'state-return': scope.row.outState===3}"
                >
                  {{ stateText(scope.row.outState) }}</span>
              </template>
            </el-table-column>
            <el-table-column width="80" prop="applyMoney" label="申请金额" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.applyMoney | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column width="80" prop="outMoney" label="拨款金额" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.outMoney | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column width="80" prop="poundage" label="手续费" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.poundage | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="bankInfo.bankName" label="银行名称" header-align="center" align="center" />
            <el-table-column prop="bankInfo.accountName" label="户名" header-align="center" align="center" />
            <el-table-column prop="bankInfo.branchName" label="支行名称" header-align="center" align="center" />
            <el-table-column prop="bankInfo.accountNumber" label="账号" header-align="center" align="center" />
            <el-table-column prop="applyTime" label="申请日期" header-align="center" align="center" />
            <el-table-column prop="outDate" label="拨款日期" header-align="center" align="center" />
            <el-table-column prop="remarks" label="备注" header-align="center" align="center" />

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
import { getCashInApplyList } from '@/api/pay/cashApply'
import { getAllBankInfo } from '@/api/pay/bankinfo'
import { getMarchantInfo } from '@/api/pay/marchant'
import { getProxyInfo } from '@/api/sys/proxy'
import { dateFormat, CentToDollars } from '@/common/commonFun'
import cashInApplyEdit from '@/components/Apply/applyEdit'
import store from '@/store'
import { mapGetters } from 'vuex'
export default {
  name: 'cashInApplyList',
  components: { cashInApplyEdit },
  data() {
    return {
      loading: false,
      permission: {
        add: false,
        remove: false
      },
      applyData: '',
      search: {
        condition: {},
        pageNum: 1,
        size: 20
      },
      total: 0,
      dataList: [],
      appOutState: [{
        value: 1,
        label: '待打款'
      }, {
        value: 2,
        label: '已打款'
      }, {
        value: 3,
        label: '已驳回'
      }],
      outState: '',
      outData: ''
    }
  },
  computed: {
    ...mapGetters([
      'info'
    ])
  },
  created() {
    this.pageInit()
  },
  methods: {
    getDataList() {
      this.loading = true
      if (this.applyData.length === 2) {
        this.search.condition.applyStartTime = dateFormat(this.applyData[0], 'yyyy-MM-dd hh:mm:ss')
        this.search.condition.applyEndTime = dateFormat(this.applyData[1], 'yyyy-MM-dd hh:mm:ss')
      }
      if (this.outData.length === 2) {
        this.search.condition.outStartTime = dateFormat(this.outData[0], 'yyyy-MM-dd hh:mm:ss')
        this.search.condition.outEndTime = dateFormat(this.outData[1], 'yyyy-MM-dd hh:mm:ss')
      }
      if (this.outState) {
        this.search.condition.out_state = this.outState
      }
      getCashInApplyList(this.search)
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
    queryReset() {
      this.applyData = ''
      this.outData = ''
      this.outState = ''
      this.search.condition = {}
      this.getDataList()
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
        return item.permission === 'admin:current_cashApply:read'
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
      getCashInApplyList(this.search).then(response => {
        let data = response.data
        this.dataList = data.rows
        this.total = data.total
        this.pageNum = data.current
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:current_cashApply:create'
        })
        this.permission.remove = resources.find(item => {
          return item.permission === 'admin:current_cashApply:delete'
        })
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    async handleCreate() {
      this.loading = true
      try {
        if (this.info.userType === 2) {
          let [allBankInfoList, marchantInfo] = await Promise.all([
            getAllBankInfo(),
            getMarchantInfo()
          ])
          this.$refs.cashInApplyEdit.$emit('openAddApplyDialog', allBankInfoList, marchantInfo)
        } else if (this.info.userType === 3) {
          let [allBankInfoList, proxyInfo] = await Promise.all([
            getAllBankInfo(),
            getProxyInfo()
          ])
          this.$refs.cashInApplyEdit.$emit('openAddApplyDialog', allBankInfoList, proxyInfo)
        }
        this.loading = false
      } catch (error) {
        this.outputError(error)
      }
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        switch (column.property) {
          case 'outBillNo':
            sums[index] = '总     计'
            break
          case 'outMoney':
            sums[index] = CentToDollars(this.sumData(data, column.property))
            sums[index] += ' 元'
            break
          case 'applyMoney':
            sums[index] = CentToDollars(this.sumData(data, column.property))
            sums[index] += ' 元'
            break
          case 'poundage':
            sums[index] = CentToDollars(this.sumData(data, column.property))
            sums[index] += ' 元'
            break
        }
      })
      return sums
    },
    sumData(data, property) {
      let values = data.map(item => Number(item[property]))
      let result = 0
      for (let i = 0, l = values.length; i < l; i++) {
        result += values[i]
      }
      return result
    },
    stateText(val) {
      switch (val) {
        case 1:
          return '待拨款'
        case 2:
          return '已拨款'
        case 3:
          return '已驳回'
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
      width: 260px;
    }
    .el-date-editor--daterange.el-input,
    .el-date-editor--daterange.el-input__inner,
    .el-date-editor--timerange.el-input,
    .el-date-editor--timerange.el-input__inner{
      width: 280px
    }
  }
  .state-wait {
    color: red;
  }

  .state-sussce {
    color: green;
  }
  .state-return {
    color: darkviolet;
  }
</style>
