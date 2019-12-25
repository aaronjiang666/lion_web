<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <el-row class="search-row">
        <el-col :span="24">
          <el-input v-model="search.condition.merchant_no" placeholder="商户号" size="mini" />
          <el-input v-model="search.condition.out_bill_no" placeholder="提现单号" size="mini" />
          <el-date-picker
            v-model="applyData"
            size="mini"
            type="datetimerange"
            start-placeholder="申请开始日期"
            end-placeholder="申请结束日期"
            :default-time="['00:00:00','23:59:59']"
          />
          <el-select v-model="outState" placeholder="拨款状态" size="mini">
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
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table :data="dataList" border size="mini" header-cell-class-name="header-row">
            <el-table-column prop="marchantNo" label="商户号" header-align="center" align="center" />
            <el-table-column prop="outBillNo" label="申请单号" header-align="center" align="center" />
            <el-table-column prop="applyMoney" label="申请金额(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.applyMoney | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="outMoney" label="拨款金额(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.outMoney | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="poundage" label="手续费(元)" header-align="center" align="center">
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
            <el-table-column prop="outState" label="拨款状态" header-align="center" align="center">
              <template slot-scope="scope">
                <span
                  :class="{ 'state-wait': scope.row.outState === 1,
                            'state-sussce': scope.row.outState===2,
                            'state-return': scope.row.outState===3
                  }"
                >{{ stateText(scope.row.outState) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="remarks" label="备注" header-align="center" align="center" />
            <el-table-column label="操作" header-align="center" align="center" width="180">
              <template slot-scope="scope">
                <el-button
                  v-show="permission.edit && scope.row.outState === 1"
                  style="margin-left: 0px;"
                  type="primary"
                  size="mini"
                  @click="appropriation(scope.$index, scope.row)"
                >
                  拨款
                </el-button>
                <el-button
                  v-show="permission.edit && scope.row.outState === 1"
                  style="margin-left: 0px;"
                  type="primary"
                  size="mini"
                  @click="revokeCashInApply(scope.$index, scope.row)"
                >
                  驳回
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
            :page-sizes="[5, 10, 20,50,100,200]"
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
    <el-col>
    <div>
      <el-dialog width="550px" :title="备注" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
        <el-input
          v-model="IntoData.remarks"
          type="textarea"
          :rows="4"
          placeholder="请输入备注"
        />
        <div slot="footer" class="dialog-footer">
          <el-button @click="cancelFun">
            取 消
          </el-button>
          <el-button type="primary" @click="submitForm">
            确 定
          </el-button>
        </div>
      </el-dialog>
    </div>
    </el-col>
  </el-row>
</template>

<script>
import { getAllCashInApply, saveApplyPayment, revokeCashInApply } from '@/api/pay/cashApply'
import { dateFormat } from '@/common/commonFun'
import store from '@/store'

export default {
  data() {
    return {
      loading: false,
      permission: {
        add: false,
        edit: false
      },
      IntoData: {
        id: '',
        remarks: ''
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
      outData: '',
      dialogFormVisible: false,
      IOrR: ''
    }
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
      getAllCashInApply(this.search)
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
        return item.permission === 'admin:cashApply:read'
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
      getAllCashInApply(this.search).then(response => {
        let data = response.data
        this.dataList = data.rows
        this.total = data.total
        this.pageNum = data.current
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:cashApply:create'
        })
        this.permission.edit = resources.find(item => {
          return item.permission === 'admin:cashApply:update'
        })
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    appropriation(index, row) {
      this.IOrR = 'save'
      this.IntoData.id = row.id
      this.dialogFormVisible = true
    },
    revokeCashInApply(index, row) {
      this.IOrR = 'revoke'
      this.IntoData.id = row.id
      this.dialogFormVisible = true
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
    cancelFun() {
      this.IntoData.remarks = ''
      this.dialogFormVisible = false
    },
    submitForm() {
      if (this.IOrR === 'save') {
        this.$confirm('确认拨款吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          saveApplyPayment(this.IntoData).then(response => {
            this.getDataList()
          }).catch(error => {
            this.outputError(error)
          })
          this.loading = false
        })
        this.dialogFormVisible = false
      }
      if (this.IOrR === 'revoke') {
        this.$confirm('确定要驳回吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          revokeCashInApply(this.IntoData).then(response => {
            this.getDataList()
            this.loading = false
          }).catch(error => {
            this.outputError(error)
          })
        })
        this.dialogFormVisible = false
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
      width: 150px;
    }

    .el-date-editor--daterange.el-input,
    .el-date-editor--daterange.el-input__inner,
    .el-date-editor--timerange.el-input,
    .el-date-editor--timerange.el-input__inner {
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
