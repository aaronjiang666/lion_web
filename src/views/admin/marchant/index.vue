<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <marchant-edit ref="marchantEdit" @save-finished="getDataList" />
      <channel-edit ref="channelEdit" @save-finished="getDataList" />
      <account-edit ref="accountEdit" @save-finished="getDataList" />
      <el-row class="search-row">
        <el-col :span="14">
          <el-input v-model="search.condition.merchant_no" placeholder="商户号" size="mini" />
          <el-input v-model="search.condition.proxy_no" placeholder="代理商号" size="mini" />
          <el-button type="primary" size="mini" icon="el-icon-search" round @click="getDataList()">
            搜索
          </el-button>
          <el-button type="primary" size="mini" icon="el-icon-delete" round @click="queryReset()">
            重置
          </el-button>
        </el-col>
        <el-col :span="10" style="text-align: right;">
          <el-button
            v-show="permission.add"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleCreate()"
          >
            添加
          </el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table ref="refTable" :data="dataList" border size="mini" header-cell-class-name="header-row" @row-click="clickTable">
            <el-table-column type="expand" align="center">
              <template slot-scope="props">
                <el-table :data="props.row.channels">
                  <el-table-column label="系统通道信息" align="center">
                    <el-table-column prop="channel.name" label="通道名称" align="center">
                      <template slot-scope="scope">
                        <span>{{ scope.row.channel.name }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="channel.code" label="通道编码" align="center">
                      <template slot-scope="scope">
                        <span>{{ scope.row.channel.code }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="channel.brokerage" label="系统费率(‰)" align="center">
                      <template slot-scope="scope">
                        <span>{{ scope.row.channel.brokerage | brokerageConvert }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="channel.state" label="系统状态" header-align="center" align="center">
                      <template slot-scope="scope">
                        <span :class="stateClassShow(scope.row.channel.state)">{{ stateClassText(scope.row.channel.state) }}</span>
                      </template>
                    </el-table-column>
                  </el-table-column>
                  <el-table-column label="商户通道信息" align="center">
                    <el-table-column prop="brokerage" label="当前费率(‰)" align="center">
                      <template slot-scope="scope">
                        <span>{{ scope.row.brokerage | brokerageConvert }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="status" label="能否使用" header-align="center" align="center">
                      <template slot-scope="scope">
                        <span :class="{ 'state-normal': scope.row.status === 1, 'state-stop': scope.row.status===0 }">{{ scope.row.status === 1 ? '可用' : '关闭' }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="remarks" label="备注">
                      <template slot-scope="scope">
                        <span>{{ scope.row.remarks }}</span>
                      </template>
                    </el-table-column>
                  </el-table-column>
                  <el-table-column label="控制渠道" header-align="center" align="center">
                    <template slot-scope="scope">
                      <el-button type="primary" size="mini" @click="editChannel(scope.$index, scope.row)">
                        编辑
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-form label-position="left" inline class="proxy-table-expand">
                  <el-form-item label="电话">
                    <span> {{ props.row.phone }}</span>
                  </el-form-item>
                  <el-form-item label="邮件地址">
                    <span> {{ props.row.email }}</span>
                  </el-form-item>
                  <el-form-item label="QQ">
                    <span> {{ props.row.qq }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column prop="merchantNo" label="商户号" header-align="center" align="center" />
            <el-table-column prop="loginName" label="登录账号" header-align="center" align="center" />
            <el-table-column prop="userName" label="用户名称" header-align="center" align="center" />
            <el-table-column prop="proxy.name" label="代理商" header-align="center" align="center" />
            <el-table-column prop="proxy.proxyNo" label="代理商号" header-align="center" align="center" />
            <el-table-column prop="state" label="状态" header-align="center" align="center">
              <template slot-scope="scope">
                <span :class="{ 'state-normal': scope.row.state === 1, 'state-stop': scope.row.state===2 }">
                  {{ scope.row.state === 1 ? '正常' : '停用' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="注册时间" header-align="center" align="center" />
            <el-table-column prop="totalAccount.intoMoney" label="总收入(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.totalAccount.intoMoney | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalAccount.outMoney" label="总支出(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.totalAccount.outMoney | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalAccount.freezeMoney" label="冻结金额(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.totalAccount.freezeMoney | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalAccount.surplusMoney" label="余额(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.totalAccount.surplusMoney | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalAccount.totalPoundage" label="总手续费(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.totalAccount.totalPoundage | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column label="控制商户" header-align="center" align="center" width="260">
              <template slot-scope="scope">
                <el-button v-show="permission.edit && info.userType === 1" style="margin: 0px;" type="primary" size="mini" @click="editAccount(scope.$index, scope.row)">
                  修改账目
                </el-button>
                <el-button v-show="permission.edit && info.userType === 1" style="margin: 0px;" type="danger" size="mini" @click="resetMerchantKey(scope.$index, scope.row)">
                  重置KEY
                </el-button>
                <el-button v-show="permission.edit && scope.row.state === 2" style="margin: 0px;" type="primary" size="mini" @click="enableMarchant(scope.$index, scope.row)">
                  启用
                </el-button>
                <el-button v-show="permission.edit && scope.row.state === 1" style="margin: 0px;" type="danger" size="mini" @click="stopMarchant(scope.$index, scope.row)">
                  停用
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
import { resetMerchantKey, getMarchantList, stopMarchant, enableMarchant } from '@/api/pay/marchant'
import MarchantEdit from '@/components/Marchant/marchantEdit'
import ChannelEdit from '@/components/Marchant/channelEdit'
import AccountEdit from '@/components/Marchant/accountEdit'
import store from '@/store'
import { mapGetters } from 'vuex'

export default {
  components: { AccountEdit, MarchantEdit, ChannelEdit },
  computed: {
    ...mapGetters([
      'info'
    ])
  },
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
        size: 10
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
      getMarchantList(this.search)
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
        return item.permission === 'admin:marchant:read'
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
      getMarchantList(this.search).then(response => {
        let data = response.data
        this.dataList = data.rows
        this.total = data.total
        this.pageNum = data.current
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:marchant:create'
        })
        this.permission.edit = resources.find(item => {
          return item.permission === 'admin:marchant:update'
        })
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    resetMerchantKey(index, row) {
      this.$confirm('确定重置商户KEY吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        resetMerchantKey(row.id).then(response => {
          this.getDataList()
        }).catch(error => {
          this.outputError(error)
        })
        this.loading = false
      })
    },
    enableMarchant(index, row) {
      this.$confirm('确定启用吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        enableMarchant(row.id).then(response => {
          this.getDataList()
        }).catch(error => {
          this.outputError(error)
        })
        this.loading = false
      })
    },
    stopMarchant(index, row) {
      this.$confirm('确定停用吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        stopMarchant(row.id).then(response => {
          this.getDataList()
        }).catch(error => {
          this.outputError(error)
        })
        this.loading = false
      })
    },
    editAccount(index, row) {
      this.loading = true
      this.$refs.accountEdit.$emit('openEditAccountDialog', row)
      this.loading = false
    },
    handleCreate() {
      this.loading = true
      this.$refs.marchantEdit.$emit('openAddMarchantDialog')
      this.loading = false
    },
    editChannel(index, row) {
      this.loading = true
      this.$refs.channelEdit.$emit('openEditMarchantChannelDialog', row)
      this.loading = false
    },
    stateClassShow: (value) => {
      switch (value) {
        case 80001: // 待开通
          return 'state_wait'
        case 80002: // 已经开通
          return 'state_start'
        case 80003: // 维护中
          return 'state_maintain'
        case 80004: // 停止使用
          return 'state_stop'
        default:
          return ''
      }
    },
    stateClassText: (value) => {
      switch (value) {
        case 80001: // 待开通
          return '待开通'
        case 80002: // 已经开通
          return '已开通'
        case 80003: // 维护中
          return '维护中'
        case 80004: // 停止使用
          return '停止使用'
        default:
          return ''
      }
    },
    clickTable(row, index, e) {
      this.$refs.refTable.toggleRowExpansion(row)
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
  .proxy-table-expand{
    font-size: 0;
  }
  .proxy-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .proxy-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
<style lang="scss" scoped>
  .search-row {
    padding-bottom: 8px;

    .el-input {
      width: 260px;
    }
  }

  .state-normal {
    color: green;
  }

  .state-stop {
    color: red;
  }
  // 待开通
  .state_wait{
    color: #0000FF ;
  }
  // 已经开通
  .state_start{
    color: #009933 ;
  }
  // 维护中
  .state_maintain{
    color: #86754b;
  }
  // 停止使用
  .state_stop {
    color: #FF3300;
  }

</style>
