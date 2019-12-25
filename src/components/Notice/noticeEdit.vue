<template>
  <el-dialog
    v-loading="loading"
    :title="dialogProps.title"
    :visible.sync="dialogProps.visible"
    width="560px"
    @open="handleDialogOpen()"
    @close="handleDialogClose()"
  >
    <div slot="title" class="dialog-header">
      {{ dialogProps.title }}
    </div>
    <el-form
      ref="noticeForm"
      :model="noticeModel"
      :rules="rules"
      label-width="80px"
      label-position="right"
      size="small"
    >
      <el-form-item label="公告标题" prop="title">
        <el-col :span="16">
          <el-input ref="noticeTitle" v-model="noticeModel.title" :maxlength="100" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="公告内容" prop="content">
        <el-col :span="16">
          <el-input ref="noticeContent" v-model="noticeModel.content" type="textarea"/>
        </el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('noticeForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { saveNotice } from '@/api/sys/notice'

export default {
  name: 'notice-edit',
  data() {
    return {
      loading: false,
      noticeModel: {
        id: 0,
        title: '',
        content: '',
        state: 0
      },
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      rules: {
        noticeTitle: [
          { required: true, message: '请输入公告标题', trigger: 'blur' },
          { min: 4, max: 100, message: '长度在 4 到 100 个字符', trigger: 'blur' }
        ],
        noticeContent: [
          { required: true, message: '请输入公告内容', trigger: 'blur' },
          { min: 4, max: 1000, message: '长度在 4 到 1000 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openAddNoticeDialog', function() {
        this.dialogProps.action = 'add'
        this.dialogProps.title = '添加公告信息'
        this.dialogProps.visible = true
      })
    })
  },

  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.dialogProps.action === 'add') {
            this.doSave()
          }
        }
      })
    },
    doSave() {
      this.loading = true
      saveNotice(this.noticeModel)
        .then(response => {
          this.loading = false
          this.dialogProps.visible = false
          this.$emit('save-finished')
        }).catch(error => {
          this.outputError(error)
        })
    },

    handleDialogOpen() {
      this.$nextTick(() => {
        this.$refs['noticeForm'].clearValidate()
        this.$refs['noticeTitle'].focus()
      })
    },
    handleDialogClose() {
      this.dialogProps.visible = false
      this.$emit('save-finished')
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

<style scoped>

</style>
