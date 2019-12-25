<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <channel-edit ref="channelEdit" @save-finished="getDataList()" />
      <el-row class="search-row">
        <el-col :span="14">
          <el-input v-model="search.condition.name" placeholder="通道名称" size="small">
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
          <el-table :data="dataList" border size="mini" header-cell-class-name="header-row">
            <el-table-column prop="name" label="通道名称" header-align="center" align="center" />
            <el-table-column prop="code" label="通道编码" header-align="center" align="center" />
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
            <el-table-column :show-overflow-tooltip="true" prop="brokerage" label="费率(‰)" header-align="center" align="center" sortable>
              <template slot-scope="scope">
                <span>{{ scope.row.brokerage | brokerageConvert }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="state" label="渠道状态" header-align="center" align="center">
              <template slot-scope="scope">
                <span :class="stateClassShow(scope.row.state)">{{ stateClassText(scope.row.state) }}</span>
              </template>
            </el-table-column>
            <el-table-column v-show="info.userType === 1" :show-overflow-tooltip="true" prop="isDownstream" label="接入上游支付" header-align="center" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.isDownstream | YesNoToText }}</span>
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="upstreamBrokerage" label="上游费率(‰)" header-align="center" align="center" sortable>
              <template slot-scope="scope">
                <span>{{ scope.row.upstreamBrokerage | brokerageConvert }}</span>
              </template>
            </el-table-column>
            <el-table-column v-show="info.userType === 1" prop="upstreamInfo.name" label="上游平台名称" header-align="center" align="center" />
            <el-table-column v-show="info.userType === 1" prop="upstreamCode" label="上游通道代码" header-align="center" align="center" />
            <el-table-column v-show="info.userType === 1" prop="updateTime" label="修改日期" header-align="center" align="center" />
            <el-table-column prop="createTime" label="创建日期" header-align="center" align="center" />
            <el-table-column label="操作" header-align="center" align="center" width="200">
              <template slot-scope="scope">
                <el-button v-show="permission.edit" type="primary" size="mini" @click="handleEdit(scope.$index, scope.row)">
                  编辑
                </el-button>
                <el-button v-show="permission.remove" type="danger" size="mini" @click="handleDeleteRole(scope.$index, scope.row)">
                  删除
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
import { getChannelList, getChannelById, deleteChannel } from '@/api/pay/channel'
import { getAllList } from '@/api/pay/upstream'
import store from '@/store'
import ChannelEdit from '@/components/Channel'
import { mapGetters } from 'vuex'

export default {
  components: { ChannelEdit },
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
        edit: false,
        remove: false
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
      getChannelList(this.search)
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
        return item.permission === 'admin:channel:read'
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
      getChannelList(this.search).then(response => {
        let data = response.data
        this.dataList = data.rows
        this.total = data.total
        this.pageNum = data.current
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:channel:create'
        })
        this.permission.edit = resources.find(item => {
          return item.permission === 'admin:channel:update'
        })
        this.permission.remove = resources.find(item => {
          return item.permission === 'admin:channel:delete'
        })
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    async handleCreate() {
      this.loading = true
      let [upstreams] = await Promise.all([
        getAllList()
      ])
      this.$refs.channelEdit.$emit('openAddChannelDialog', upstreams.data)
    },
    async handleEdit(index, row) {
      this.loading = true
      let [upstreams] = await Promise.all([
        getAllList()
      ])
      getChannelById(row.id)
        .then(response => {
          this.$refs.channelEdit.$emit('openEditChannelDialog', response.data, upstreams.data)
          this.loading = false
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    handleDeleteRole(index, row) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          deleteChannel(row.id)
            .then(response => {
              this.loading = false
              this.getDataList()
            })
            .catch(error => {
              this.outputError(error)
            })
        })
        .catch(() => {
          this.loading = false
        })
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
