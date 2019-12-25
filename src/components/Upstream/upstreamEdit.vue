/* eslint-disable */
<template>
  <el-dialog v-loading="loading" :title="dialogProps.title" :visible.sync="dialogProps.visible" width="560px" @open="handleDialogOpen()">
    <div slot="title" class="dialog-header">
      {{ dialogProps.title }}
    </div>
    <el-form ref="upstreamForm" :model="upstreamModel" label-width="160px" label-position="right" size="small">
      <el-tabs v-model="activeTabName" type="border-card">
        <el-form-item label="平台名称" prop="name">
          <el-col :span="16">
            <el-input ref="name" v-model="upstreamModel.name" :maxlength="32" autofocus />
          </el-col>
        </el-form-item>
        <el-form-item label="商户号" prop="marchantNo">
          <el-col :span="16">
            <el-input ref="marchantNo" v-model="upstreamModel.marchantNo" :maxlength="32" autofocus />
          </el-col>
        </el-form-item>
        <el-form-item label="商户Key" prop="marchantKey">
          <el-col :span="16">
            <el-input ref="marchantKey" v-model="upstreamModel.marchantKey" :maxlength="256" autofocus />
          </el-col>
        </el-form-item>
        <el-form-item label="商户Token" prop="marchantToken">
          <el-col :span="16">
            <el-input ref="marchantToken" v-model="upstreamModel.marchantToken" :maxlength="256" autofocus />
          </el-col>
        </el-form-item>
        <el-form-item label="请求URL" prop="apiUrl">
          <el-col :span="16">
            <el-input ref="apiUrl" v-model="upstreamModel.apiUrl" :maxlength="1024" autofocus />
          </el-col>
        </el-form-item>
        <el-form-item label="异步回调URL" prop="asynUrl">
          <el-col :span="16">
            <el-input ref="asynUrl" v-model="upstreamModel.asynUrl" :maxlength="1024" autofocus />
          </el-col>
        </el-form-item>
        <el-form-item label="同步回调URL" prop="syncUrl">
          <el-col :span="16">
            <el-input ref="syncUrl" v-model="upstreamModel.syncUrl" :maxlength="1024" autofocus />
          </el-col>
        </el-form-item>
        <el-form-item label="请求处理类名" prop="reqBeanName">
          <el-col :span="16">
            <el-input ref="reqBeanName" v-model="upstreamModel.reqBeanName" :maxlength="128" autofocus />
          </el-col>
        </el-form-item>
        <el-form-item label="返回处理类名" prop="repBeanName">
          <el-col :span="16">
            <el-input ref="repBeanName" v-model="upstreamModel.repBeanName" :maxlength="128" autofocus />
          </el-col>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-col :span="16">
            <el-input ref="remarks" v-model="upstreamModel.remarks" :maxlength="1024" autofocus />
          </el-col>
        </el-form-item>
      </el-tabs>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('upstreamForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addUpstream, editUpstream } from '@/api/pay/upstream'

export default {
  name: 'upstream-edit',
  data() {
    return {
      loading: false,
      upstreamModel: {
        id: 0,
        name: '',
        marchantNo: '',
        marchantKey: '',
        marchantToken: '',
        apiUrl: '',
        asynUrl: '',
        syncUrl: '',
        repBeanName: '',
        reqBeanName: '',
        remarks: ''
      },
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      activeTabName: 'upstreamInfoTab'
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openEditUpstreamDialog', function(upstream) {
        this.upstreamModel = upstream
        this.dialogProps.action = 'edit'
        this.dialogProps.title = '修改平台信息'
        this.activeTabName = 'upstreamInfoTab'
        this.dialogProps.visible = true
      })
      this.$on('openAddUpstreamDialog', function() {
        this.dialogProps.action = 'add'
        this.dialogProps.title = '添加平台信息'
        this.activeTabName = 'upstreamInfoTab'
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
          } else {
            this.doUpdate()
          }
        }
      })
    },

    doUpdate() {
      this.loading = true
      editUpstream(this.upstreamModel)
        .then(response => {
          this.loading = false
          this.dialogProps.visible = false
          this.$emit('save-finished')
        }).catch(error => {
          this.outputError(error)
        })
    },

    doSave() {
      this.loading = true
      addUpstream(this.upstreamModel)
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
        this.$refs['upstreamForm'].clearValidate()
        this.$refs['name'].focus()
      })
    },

    handleDialogClose() {
      this.dialogProps.visible = false
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
