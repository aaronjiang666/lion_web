<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <el-row>
        <el-row class="search-row">
          <el-col :span="24">
            <el-input v-show="info.userType === 1 || info.userType === 2 " v-model="search.condition.merchant_no" placeholder="商户号" size="mini" />
            <el-input v-show="info.userType === 1 " v-model="search.condition.proxy_no" placeholder="代理商号" size="mini" />
            <el-date-picker v-model="queryDate" size="mini" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00','23:59:59']" />
            <el-button type="primary" size="mini" icon="el-icon-search" round @click="DataList()">
              搜索
            </el-button><el-button
              type="primary"
              size="mini"
              icon="el-icon-delete"
              round
              @click="QueryReset()"
            >
              重置
            </el-button>
          </el-col>
        </el-row><el-col :span="24">
          <el-table :data="dataList" border header-cell-class-name="header-row">
            <el-table-column width="120" prop="marchantNo" label="商户号" header-align="center" align="center" />
            <el-table-column header-align="center" label="时间段内账目">
              <el-table-column width="120" sortable prop="outCount" label="拨款次数" header-align="center"  align="center"/>
              <el-table-column width="160" sortable prop="applyMoney" label="申请金额(元)" header-align="center" >
                <template slot-scope="scope">
                  <span>{{ Math.abs(scope.row.applyMoney) | CentToDollars }}</span>
                </template>
              </el-table-column>
              <el-table-column width="160" sortable prop="outMoney" label="拨款金额(元)" header-align="center" >
                <template slot-scope="scope">
                  <span>{{ Math.abs(scope.row.outMoney) | CentToDollars }}</span>
                </template>
              </el-table-column>
              <el-table-column width="160" sortable prop="outPoundage" label="手续费(元)" header-align="center" >
                <template slot-scope="scope">
                  <span>{{ scope.row.outPoundage | CentToDollars }}</span>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column header-align="center" label="累计账目">
              <el-table-column width="160" sortable prop="addUpIntoMoney" label="总收入金额(元)" header-align="center" >
                <template slot-scope="scope">
                  <span>{{ scope.row.addUpIntoMoney | CentToDollars }}</span>
                </template>
              </el-table-column>
              <el-table-column width="160" sortable prop="addUpOutMoney" label="总支出金额(元)" header-align="center" >
                <template slot-scope="scope">
                  <span>{{ scope.row.addUpOutMoney | CentToDollars }}</span>
                </template>
              </el-table-column>
              <el-table-column width="160" sortable prop="addUpSurplusMoney" label="总余额(元)" header-align="center" >
                <template slot-scope="scope">
                  <span>{{ scope.row.addUpSurplusMoney | CentToDollars }}</span>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-pagination
            :current-page="search.pageNum"
            :page-sizes="[5, 10, 20, 30, 40, 50, 100]"
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
import { getMarchnatOutAccount } from '@/api/pay/report'
import { dateFormat, dataPaging } from '@/common/commonFun'
import store from '@/store'
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters([
      'info'
    ])
  },
  data() {
    return {
      loading: false,
      permission: {
        admin: false,
        proxy: false,
        marchant: false
      },
      queryDate: [],
      data: [],
      dataList: [],
      total: 0,
      search: {
        condition: {},
        pageNum: 1,
        size: 20
      }
    }
  },
  created() {
    this.pageInit()
  },
  methods: {
    DataList() {
      this.loading = true
      if (this.queryDate.length === 2) {
        this.search.condition.startTime = dateFormat(this.queryDate[0], 'yyyy-MM-dd hh:mm:ss')
        this.search.condition.endTime = dateFormat(this.queryDate[1], 'yyyy-MM-dd hh:mm:ss')
      }
      getMarchnatOutAccount(this.search).then(response => {
        this.data = response.data
        if (this.data) {
          this.total = this.data.length
          this.dataList = dataPaging(this.data
            , this.search.size
            , this.search.pageNum)
        }
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    QueryReset() {
      this.queryDate = []
      this.search.condition = {}
      this.DataList()
    },
    handleSizeChange(val) {
      this.dataList = []
      this.search.size = val
      this.dataList = dataPaging(this.data
        , this.search.size
        , this.search.pageNum)
    },
    handleCurrentChange(val) {
      this.dataList = []
      this.search.pageNum = val
      this.dataList = dataPaging(this.data
        , this.search.size
        , this.search.pageNum)
    },

    async pageInit() {
      this.loading = true
      let resources = store.getters.resources
      this.permission.admin = resources.find(item => {
        return item.permission === 'admin:marchnatIntoAccount:read'
      })
      this.permission.proxy = resources.find(item => {
        return item.permission === 'admin:proxy:marchnatIntoAccount:read'
      })
      this.permission.marchant = resources.find(item => {
        return item.permission === 'admin:marchnat:marchnatIntoAccount:read'
      })
      this.loading = false
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
    .el-date-editor--timerange.el-input__inner {
      width: 280px
    }
  }

</style>
