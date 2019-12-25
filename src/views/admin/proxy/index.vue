<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <proxy-edit ref="proxyEdit" @save-finished="getDataList" />
      <channel-edit ref="channelEdit" @save-finished="getDataList()" />
      <el-row class="search-row">
        <el-col :span="14">
          <el-input v-model="search.condition.name" placeholder="代理商名称" size="small">
            <el-button slot="append" icon="el-icon-search" @click="getDataList()" />
          </el-input>
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
          <el-table ref="refTable" :data="dataList" border size="mini" header-cell-class-name="header-row" @row-click="clickTable" @expand-change="getProxyChannels">
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-table :data="props.row.proxyChannels">
                  <el-table-column prop="payChannel.name" label="渠道名称" align="center">
                    <template slot-scope="scope">
                      <span>{{ scope.row.payChannel.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="payChannel.code" label="渠道编码" align="center">
                    <template slot-scope="scope">
                      <span>{{ scope.row.payChannel.code }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="sysBrokerage" label="基础费率(‰)" align="center">
                    <template slot-scope="scope">
                      <span>{{ scope.row.sysBrokerage | brokerageConvert }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="brokerage" label="费率(‰)" align="center">
                    <template slot-scope="scope">
                      <span>{{ scope.row.brokerage | brokerageConvert }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :show-overflow-tooltip="true" prop="maxLimitAmount" label="单日最大限额(元)" header-align="center" align="center" sortable>
                    <template slot-scope="scope">
                      <span>{{ scope.row.maxLimitAmount | CentToDollars }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :show-overflow-tooltip="true" prop="maxPayAmount" label="单笔最大限额(元)" header-align="center" align="center" sortable>
                    <template slot-scope="scope">
                      <span>{{ scope.row.maxPayAmount | CentToDollars }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :show-overflow-tooltip="true" prop="miniPayAmount" label="单笔最低限额(元)" header-align="center" align="center" sortable>
                    <template slot-scope="scope">
                      <span>{{ scope.row.miniPayAmount | CentToDollars }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="payChannel.state" label="渠道状态" header-align="center" align="center">
                    <template slot-scope="scope">
                      <span :class="stateClassShow(scope.row.payChannel.state)">{{ stateClassText(scope.row.payChannel.state) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" header-align="center" align="center" width="100">
                    <template slot-scope="scope">
                      <el-button v-show="permission.edit" style="margin: 0px;" type="primary" size="mini" @click="handleEdit(scope.$index, scope.row)">
                        编辑
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-form label-position="left" inline class="proxy-table-expand">
                  <el-form-item label="登录用户名">
                    <span> {{ props.row.loginName }}</span>
                  </el-form-item>
                  <el-form-item label="用户名称">
                    <span> {{ props.row.userName }}</span>
                  </el-form-item>
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
            <el-table-column prop="proxyNo" label="代理编号" header-align="center" align="center" />
            <el-table-column prop="name" label="代理名称" header-align="center" align="center" />
            <el-table-column prop="state" label="状态" header-align="center" align="center">
              <template slot-scope="scope">
                <span :class="{ 'state-normal': scope.row.state === 1, 'state-stop': scope.row.state===2 }">{{ scope.row.state === 1 ? '正常' : '停用' }}</span>
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
            <el-table-column label="操作" header-align="center" align="center" width="100">
              <template slot-scope="scope">
                <el-button v-show="permission.edit && scope.row.state === 0" style="margin: 0px;" type="primary" size="mini" @click="enableProxy(scope.$index, scope.row)">
                  启用
                </el-button>
                <el-button v-show="permission.edit && scope.row.state === 1" style="margin: 0px;" type="danger" size="mini" @click="stopProxy(scope.$index, scope.row)">
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
import { getProxyList, stopProxy, enableProxy } from '@/api/sys/proxy'
import { getProxyChannelList } from '@/api/proxy/channel'
import proxyEdit from '@/components/proxy/proxyEdit'
import ChannelEdit from '@/components/proxy/channelEdit'
import store from '@/store'

export default {
  components: { proxyEdit, ChannelEdit },
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
      getProxyList(this.search)
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
        return item.permission === 'admin:proxy:read'
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
      getProxyList(this.search).then(response => {
        let data = response.data
        this.dataList = data.rows
        this.total = data.total
        this.pageNum = data.current
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:proxy:create'
        })
        this.permission.edit = resources.find(item => {
          return item.permission === 'admin:proxy:update'
        })
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    enableProxy(index, row) {
      this.$confirm('确定启用吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        enableProxy(row.id).then(response => {
          this.getDataList()
        }).catch(error => {
          this.outputError(error)
        })
        this.loading = false
      })
    },
    stopProxy(index, row) {
      this.$confirm('确定停用吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        stopProxy(row.id).then(response => {
          this.getDataList()
        }).catch(error => {
          this.outputError(error)
        })
        this.loading = false
      })
    },
    handleCreate() {
      this.loading = true
      this.$refs.proxyEdit.$emit('openAddProxyDialog')
      this.loading = false
    },
    async handleEdit(index, row) {
      this.loading = true
      this.$refs.channelEdit.$emit('openEditProxyChannelDialog', row, 'admin')
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

    async getProxyChannels(row, expandedRows) {
      if (expandedRows.length > 0) {
        try {
          this.loading = true
          this.search.condition.proxyId = row.id
          let [channels] = await Promise.all([
            getProxyChannelList(this.search)
          ])
          row.proxyChannels = channels.data.rows
          this.loading = false
        } catch (error) {
          this.outputError(error)
        }
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
