<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <channel-edit ref="channelEdit" @save-finished="getDataList()" />
      <el-row class="search-row">
        <el-col :span="24">
          <br>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table ref="refTable" :data="dataList" border size="mini" header-cell-class-name="header-row" @row-click="clickTable">
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-form label-position="left" label-width="200px" inline class="proxy-table-expand">
                  <el-form-item label="系统单日最大限额">
                    <span> {{ props.row.payChannel.maxLimitAmount | CentToDollars }}</span>
                  </el-form-item>
                  <el-form-item label="系统单笔最大限额">
                    <span> {{ props.row.payChannel.maxPayAmount | CentToDollars }}</span>
                  </el-form-item>
                  <el-form-item label="系统单笔最低限额">
                    <span> {{ props.row.payChannel.miniPayAmount | CentToDollars }}</span>
                  </el-form-item>
                  <el-form-item label="系统手续费比例(‰)">
                    <span> {{ props.row.payChannel.brokerage | brokerageConvert }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column prop="payChannel.name" label="通道名称" header-align="center" align="center" />
            <el-table-column prop="payChannel.code" label="通道编码" header-align="center" align="center" width="100" />
            <el-table-column :show-overflow-tooltip="true" prop="maxLimitAmount" label="单日最大限额" header-align="center" align="center" sortable>
              <template slot-scope="scope">
                <span>{{ scope.row.maxLimitAmount | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="maxPayAmount" label="单笔最大限额" header-align="center" align="center" sortable>
              <template slot-scope="scope">
                <span>{{ scope.row.maxPayAmount | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="miniPayAmount" label="单笔最低限额" header-align="center" align="center" sortable>
              <template slot-scope="scope">
                <span>{{ scope.row.miniPayAmount | CentToDollars }}</span>
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="sysBrokerage" label="基础费率(‰)" header-align="center" align="center" sortable>
              <template slot-scope="scope">
                <span>{{ scope.row.sysBrokerage | brokerageConvert }}</span>
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="brokerage" label="费率(‰)" header-align="center" align="center" sortable>
              <template slot-scope="scope">
                <span>{{ scope.row.brokerage | brokerageConvert }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="payChannel.state" label="渠道状态" header-align="center" align="center">
              <template slot-scope="scope">
                <span :class="stateClassShow(scope.row.payChannel.state)">{{ stateClassText(scope.row.payChannel.state) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建日期" header-align="center" align="center" />
            <el-table-column label="操作" header-align="center" align="center" width="100">
              <template slot-scope="scope">
                <el-button v-show="permission.edit" type="primary" size="mini" @click="handleEdit(scope.$index, scope.row)">
                  编辑
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
import { getProxyChannelList } from '@/api/proxy/channel'
import store from '@/store'
import ChannelEdit from '@/components/proxy/channelEdit'

export default {
  components: { ChannelEdit },
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
      getProxyChannelList(this.search)
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
        return item.permission === 'admin:proxy:channel:read'
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
      getProxyChannelList(this.search).then(response => {
        let data = response.data
        this.dataList = data.rows
        this.total = data.total
        this.pageNum = data.current
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:proxy:channel:update'
        })
        this.permission.edit = resources.find(item => {
          return item.permission === 'admin:proxy:channel:update'
        })
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    async handleEdit(index, row) {
      this.loading = true
      this.$refs.channelEdit.$emit('openEditProxyChannelDialog', row, 'proxy')
      this.loading = false
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
