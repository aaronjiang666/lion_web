<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="700px"
    @close="handleDialogClose()"
  >
    <div>
      <h1 align="center">
        {{ noticeModel.title }}
      </h1>
      <br>
      <div style="text-indent: 2em; word-wrap:break-word">{{ noticeModel.content }}</div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>

export default {
  name: 'notice-show',
  data() {
    return {
      noticeModel: {
        title: '',
        content: ''
      },
      dialogVisible: false,
      dialogTitle: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openNoticeShowDialog', function(notice) {
        this.noticeModel = notice
        this.dialogVisible = true
        this.dialogTitle = '公告'
      })
    })
  },
  methods: {
    handleDialogClose() {
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>

</style>
