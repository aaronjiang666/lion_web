<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <el-row>
        <el-col :span="24">
          <el-table :data="dataList" border header-cell-class-name="header-row">
            <el-table-column prop="channel.name" label="通道名称" header-align="center" align="center" />
            <el-table-column prop="channel.code" label="通道编号" header-align="center" align="center" />
            <el-table-column prop="channel.miniPayAmount" label="最低金额" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.channel.miniPayAmount | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="channel.maxPayAmount" label="最高金额" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.channel.maxPayAmount | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="channel.state" label="通道状态" header-align="center" align="center">
              <template slot-scope="scope">
                <span :class="stateClassShow(scope.row.channel.state)">{{ stateClassText(scope.row.channel.state) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="能否使用" header-align="center" align="center">
              <template slot-scope="scope">
                <span :class="{ 'state-normal': scope.row.status === 1, 'state-stop': scope.row.status===0 }">{{ scope.row.status === 1 ? '可用' : '关闭' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { getMarchantChannelInfoList } from '@/api/pay/channel'
import store from '@/store'

export default {
  data() {
    return {
      loading: false,
      dataList: []
    }
  },
  created() {
    this.pageInit()
  },
  methods: {
    pageInit() {
      this.loading = true
      let resources = store.getters.resources
      let read = resources.find(item => {
        return item.permission === 'admin:current_cashStream:read'
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
      getMarchantChannelInfoList().then(response => {
        this.dataList = response.data
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
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
