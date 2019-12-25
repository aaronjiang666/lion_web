<template>
  <el-dialog
    v-loading="loading"
    :title="dialogProps.title"
    :visible.sync="dialogProps.visible"
    :close-on-click-modal = "false"
    width="550px"
    @open="handleDialogOpen()"
    @close="handleDialogClose()"
  >
    <div slot="title" class="dialog-header">
      {{ dialogProps.title }}
    </div>
    <el-form
      ref="marchantChannelForm"
      :model="channelModel"
      :rules="rules"
      label-width="120px"
      label-position="right"
      size="small"
    >
      <el-form-item label="通道名称" prop="name">
        <el-col :span="20">
          <el-input ref="channelName" v-model="channelModel.name" :readonly="true" :maxlength="11" class="proxy-channel-edit" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="通道编码" prop="code" hide-required-asterisk="true">
        <el-col :span="20">
          <el-input ref="channelCode" v-model="channelModel.code" :readonly="true" :maxlength="11" class="proxy-channel-edit" />
        </el-col>
      </el-form-item>
      <el-tooltip effect="dark" content="比例为千分之N. 默认使用系统费率" placement="bottom">
        <el-form-item label="手续费率(‰)" prop="brokerage">
          <el-col :span="8">
            <el-input ref="channelBrokerage" v-model="channelModel.brokerage" :maxlength="11" class="proxy-channel-edit" />
          </el-col>
          <el-col :span="14" :offset="1">
            <span>系统手续费率: {{ channelModel.sys_brokerage }}‰</span>
          </el-col>
        </el-form-item>
      </el-tooltip>
      <el-form-item label="能否使用" prop="status">
        <el-col :span="4">
          <el-switch v-model="channelModel.status" :inactive-value="0" :active-value="1" active-color="#13ce66" inactive-color="#ff4949" />
        </el-col>
      </el-form-item>
      <el-form-item label="备注" prop="remarks" hide-required-asterisk="true">
        <el-col :span="20">
          <el-input
            ref="channelRemarks"
            v-model="channelModel.remarks"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            :maxlength="200"
          />
        </el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('marchantChannelForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { editMarchantChannel } from '@/api/pay/channel'
import { brokerageConvert } from '@/common/commonFun'
export default {
  name: 'channel-edit',
  data() {
    let validatebrokerage = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入手续费率'))
      } else if (value > 0 && value < this.channelModel.sys_brokerage) {
        callback(new Error('不能小于系统手续费率'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      channelModel: {
        id: 0,
        code: 0,
        name: '',
        marchantId: '',
        brokerage: '0.0',
        sys_brokerage: '0.0',
        channelId: '',
        status: 1,
        remarks: ''
      },
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      rules: {
        brokerage: [
          { required: true, message: '请输入手续费比例', trigger: 'blur' },
          { validator: validatebrokerage, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openEditMarchantChannelDialog', function(channel) {
        this.channelModel.id = channel.id
        this.channelModel.code = channel.channel.code
        this.channelModel.name = channel.channel.name
        this.channelModel.status = channel.status
        this.channelModel.remarks = channel.remarks
        this.channelModel.marchantId = channel.marchantId
        this.channelModel.channelId = channel.channel.id
        this.channelModel.brokerage = brokerageConvert(channel.brokerage)
        this.channelModel.sys_brokerage = brokerageConvert(channel.channel.brokerage)
        this.dialogProps.action = 'edit'
        this.dialogProps.title = '修改商户支付通道信息'
        this.dialogProps.visible = true
      })
    })
  },

  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.doUpdate()
        }
      })
    },

    doUpdate() {
      this.loading = true
      editMarchantChannel(this.channelModel)
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
        this.$refs['marchantChannelForm'].clearValidate()
        this.$refs['channelBrokerage'].focus()
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

<style>
  .proxy-channel-edit{
    width: 100%
  }
.proxy-channel-edit input.el-input__inner {
    width: 100%
}
</style>
