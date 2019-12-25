<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <el-row>
        <el-row class="search-row">
          <el-col :span="24">
            <el-date-picker
              v-model="queryDate"
              size="mini"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00','23:59:59']"
            />
            <el-select
              v-model="queryChannelId"
              size="mini"
              placeholder="支付通道"
            >
              <el-option
                v-for="item in orderChannel"
                :key="item.value"
                :readonly="false"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button type="primary" size="mini" icon="el-icon-search" round @click="DataList()">
              搜索
            </el-button>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-delete"
              round
              @click="QueryReset()"
            >
              重置
            </el-button>
          </el-col>
        </el-row>
        <el-col :span="24">
          <el-table
            :data="dataList"
            :summary-method="getSummaries"
            show-summary
            border
            header-cell-class-name="header-row"
          >
            <el-table-column width="180" prop="channelName" label="通道名称" header-align="center" align="center" />
            <el-table-column width="160" sortable prop="orderMoney" label="订单金额(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.orderMoney | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column
              width="160"
              sortable
              prop="balanceMoney"
              label="结算金额(元)"
              header-align="center"
              align="center"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.balanceMoney | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column width="120" sortable prop="poundage" label="手续费(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.poundage | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column width="160" sortable prop="mScale" label="商户费率(%)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ PercentRatioToInteger(scope.row.mScale) }}</span>
              </template>
            </el-table-column>
            <el-table-column width="160" sortable prop="uScale" label="上游费率(%)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ PercentRatioToInteger(scope.row.uScale) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              width="160"
              sortable
              prop="uPoundage"
              label="上游手续费(元)"
              header-align="center"
              align="center"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.uPoundage | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column width="160" sortable prop="myPoundage" label="盈利(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.myPoundage | CentToDollars }}</span>
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
    <el-col :space="24">
      <hr color="white" style="margin: 2.3em">
    </el-col>
    <el-col :space="24">
      <el-col :span="8">
        <el-input :value="totalAccount.intoMoney | CentToDollars" :readonly="true" class="totalAccount_info">
          <template slot="prepend">
            总收入：
          </template>
          <template slot="append">
            元
          </template>
        </el-input>
      </el-col>
      <el-col :offset="1" :span="8">
        <el-input :value="totalAccount.outMoney | CentToDollars" :readonly="true" class="totalAccount_info">
          <template slot="prepend">
            总支出：
          </template>
          <template slot="append">
            元
          </template>
        </el-input>
      </el-col>
      <el-col :space="24">
        <hr color="white" style="margin: 1.3em">
      </el-col>
      <el-row>
        <el-col :span="8">
          <el-input :value="totalAccount.freezeMoney | CentToDollars" :readonly="true" class="totalAccount_info">
            <template slot="prepend">
              待拨款：
            </template>
            <template slot="append">
              元
            </template>
          </el-input>
        </el-col>
        <el-col :offset="1" :span="8">
          <el-input :value="totalAccount.surplusMoney | CentToDollars" :readonly="true" class="totalAccount_info">
            <template slot="prepend">
              总余额：
            </template>
            <template slot="append">
              元
            </template>
          </el-input>
        </el-col>
      </el-row>
      <el-col :space="24">
        <hr color="white" style="margin: 1.3em">
      </el-col>
      <el-row>
        <el-col :span="8">
          <el-input :value="totalAccount.totalPoundage | CentToDollars" class="totalAccount_info">
            <template slot="prepend">
              总手续费：
            </template>
            <template slot="append">
              元
            </template>
          </el-input>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { sysChannelDayInto } from '@/api/pay/report'
import { dateFormat, dataPaging, DollarsToThousand, PercentRatioToInteger, CentToDollars } from '@/common/commonFun'
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
        size: 10
      },
      orderChannel: [],
      queryChannelId: '',
      totalAccount: {}
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
      sysChannelDayInto(this.search).then(response => {
        this.data = response.data.intoList
        this.totalAccount = response.data.totalAccount
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
      let tVal = PercentRatioToInteger(val)
      if (tVal) {
        // 保留两位小数
        return tVal.toFixed(2)
      } else {
        return tVal
      }

    },
    QueryReset() {
      this.queryChannelId = ''
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
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        switch (column.property) {
          case 'channelName':
            sums[index] = '总     计'
            break
          case 'orderMoney':
            sums[index] = CentToDollars(this.sumData(data, column.property))
            sums[index] += ' 元'
            break
          case 'balanceMoney':
            sums[index] = CentToDollars(this.sumData(data, column.property))
            sums[index] += ' 元'
            break
          case 'poundage':
            sums[index] = CentToDollars(this.sumData(data, column.property))
            sums[index] += ' 元'
            break
          case 'uPoundage':
            sums[index] = CentToDollars(this.sumData(data, column.property))
            sums[index] += ' 元'
            break
          case 'myPoundage':
            sums[index] = CentToDollars(this.sumData(data, column.property))
            sums[index] += ' 元'
            break
          case 'mScale':
            sums[index] = '---'
            break
          case 'uScale':
            sums[index] = '---'
            break
          case 'orderTime':
            sums[index] = '---'
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
<style>
  .totalAccount_info input.el-input__inner {
    border-top-color: #ffff;
    border-right-color: #ffff;
    border-left-color: #ffff;
    border-bottom-color: #0b5268;
    padding-left: 5px;
    align: left;
  }

  .totalAccount_info div.el-input-group__prepend {
    background-color: #ffff;
    border-color: #ffff;
    border-bottom-color: #0b5268;
    padding-right: 5px;
    color: #000;
  }

  .totalAccount_info div.el-input-group__append {
    background-color: #ffff;
    border-color: #ffff;
    border-bottom-color: #0b5268;
    color: #000;
  }

  .totalAccount_info div.el-input-group__append button.el-button {
    background-color: #13ce66
  }

  .totalAccount_info div.googleCode_input {
    height: 42px;
  }
</style>
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
