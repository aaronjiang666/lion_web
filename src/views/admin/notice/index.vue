<template>
  <el-row v-loading="loading">
    <el-col :span="24">
      <notice-edit ref="noticeEdit" @save-finished="getDataList" />
      <el-row class="search-row">
        <el-col :span="18">
          <el-input v-model="search.condition.title" placeholder="标题" size="small">
            <el-button slot="append" icon="el-icon-search" @click="getDataList()" />
          </el-input>
        </el-col>
        <el-col :span="6" style="text-align: right;">
          <el-button
            v-show="permission.add"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleCreate()"
          >
            添加公告
          </el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table
            ref="refTable"
            :data="dataList"
            border
            size="mini"
            header-cell-class-name="header-row"
            @row-click="clickTable"
          >
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-form label-position="left" inline>
                  <el-form-item label="公告内容">
                    <span> {{ props.row.content }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" header-align="center" align="center" />
            <el-table-column width="140" prop="createTime" label="创建日期" header-align="center" align="center" />
            <el-table-column width="100" label="操作" header-align="center" align="center">
              <template slot-scope="scope">
                <el-button
                  v-show="permission.remove"
                  style="margin-left: 0px;"
                  type="danger"
                  size="mini"
                  @click="deleteNotice(scope.$index, scope.row.id)"
                >
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
import { getNoticePageList, deleteNotice } from '@/api/sys/notice'
import NoticeEdit from '@/components/Notice/noticeEdit'
import store from '@/store'

export default {
  name: 'noticeList',
  components: { NoticeEdit },
  data() {
    return {
      loading: false,
      permission: {
        add: false,
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
      getNoticePageList(this.search)
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
        return item.permission === 'admin:notice:read'
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
      getNoticePageList(this.search).then(response => {
        this.dataList = response.data.rows
        this.total = response.data.total
        this.pageNum = response.data.current
        this.permission.add = resources.find(item => {
          return item.permission === 'admin:notice:create'
        })
        this.permission.remove = resources.find(item => {
          return item.permission === 'admin:notice:delete'
        })
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    deleteNotice(index, id) {
      this.$confirm('确定删除公告吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteNotice(id).then(response => {
          this.getDataList()
        }).catch(error => {
          this.outputError(error)
        })
      })
    },
    async handleCreate() { // 新建公告
      this.loading = true
      try {
        this.$refs.noticeEdit.$emit('openAddNoticeDialog')
        this.loading = false
      } catch (error) {
        this.outputError(error)
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

<style lang="scss" scoped>
  .search-row {
    padding-bottom: 8px;

    .el-input {
      width: 260px;
    }
  }
  .notice_yes{
    color: #009933
  }
  .notice_no{
    color: #FF3300;
  }

</style>
