<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <el-row>
        <el-row class="search-row">
          <el-col :span="24">
            <el-input v-model="search.condition.merchant_no" placeholder="商户号" size="mini" />
            <el-input v-model="search.condition.proxy_no" placeholder="代理商号" size="mini" />
            <el-date-picker
              v-model="queryDate"
              size="mini"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00','23:59:59']"
            />
            <el-select v-model="queryChannelId" size="mini" placeholder="支付通道">
              <el-option v-for="item in orderChannel" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
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
            <el-table-column width="180" prop="channelName" label="通道名称" header-align="center" align="center" />
              <el-table-column width="160" sortable prop="orderMoney" label="订单金额(元)" header-align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.orderMoney | CentToDollars }}</span>
                </template>
              </el-table-column>
              <el-table-column width="160" sortable prop="balanceMoney" label="结算金额(元)" header-align="center" >
                <template slot-scope="scope">
                  <span>{{ scope.row.balanceMoney | CentToDollars }}</span>
                </template>
              </el-table-column>
              <el-table-column width="120" sortable prop="poundage" label="手续费(元)" header-align="center" >
                <template slot-scope="scope">
                  <span>{{ scope.row.poundage | CentToDollars }}</span>
                </template>
              </el-table-column>
              <el-table-column width="160" sortable prop="mScale" label="商户费率(%)" header-align="center" align="center" >
                <template slot-scope="scope">
                  <span>{{ PercentRatioToInteger(scope.row.mScale) }}</span>
                </template>
              </el-table-column>
              <el-table-column width="160" sortable prop="uPoundage" label="上游手续费(元)" header-align="center" >
                <template slot-scope="scope">
                  <span>{{ scope.row.uPoundage | CentToDollars }}</span>
                </template>
              </el-table-column>
              <el-table-column width="160" sortable prop="uScale" label="上游费率(%)" header-align="center" align="center" >
                <template slot-scope="scope">
                  <span>{{ PercentRatioToInteger(scope.row.uScale) }}</span>
                </template>
              </el-table-column>
              <el-table-column width="120" sortable prop="orderTime" label="账目日期" header-align="center" align="center" />
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
import { sysChannelMarchanatDayInto } from '@/api/pay/report'
import { dateFormat, dataPaging, DollarsToThousand } from '@/common/commonFun'
import { getAllChannel } from '@/api/pay/channel'
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
      },
      orderChannel: [],
      queryChannelId: ''
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
      if (this.queryChannelId) {
        this.search.condition.channel_id = this.queryChannelId
      }
      sysChannelMarchanatDayInto(this.search).then(response => {
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
    DollarsToThousand(val) {
      return DollarsToThousand(val)
    },
    PercentRatioToInteger(val) {
      return val.toFixed(2)
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
      getAllChannel().then(response => {
        let data = response.data
        if (data.length > 0) {
          for (let i = 0, l = data.length; i < l; i++) {
            let tempObj = {}
            tempObj.value = data[i].id
            tempObj.label = data[i].name
            this.orderChannel.push(tempObj)
          }
        }
      }).catch(error => {
        this.outputError(error)
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
