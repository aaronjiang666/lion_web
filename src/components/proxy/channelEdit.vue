<template>
  <el-dialog
    v-loading="loading"
    :title="dialogProps.title"
    :visible.sync="dialogProps.visible"
    width="550px"
    @open="handleDialogOpen()"
    @close="handleDialogClose()"
  >
    <div slot="title" class="dialog-header">
      {{ dialogProps.title }}
    </div>
    <el-form
      ref="channelForm"
      :model="channelModel"
      :rules="rules"
      label-width="120px"
      label-position="right"
      size="small"
    >
      <el-form-item label="通道名称" prop="name">
        <el-col :span="16">
          <el-input ref="channelName" v-model="channelModel.name" :readonly="true" :maxlength="11" class="proxy-channel-edit" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="通道编码" prop="code" hide-required-asterisk="true">
        <el-col :span="16">
          <el-input ref="channelCode" v-model="channelModel.code" :readonly="true" :maxlength="11" class="proxy-channel-edit" />
        </el-col>
      </el-form-item>
      <el-form-item label="基础费率(‰)" prop="sysBrokerage" hide-required-asterisk="true">
        <el-col :span="8">
          <el-input ref="sysBrokerage" v-model="channelModel.sysBrokerage" :readonly="dialogProps.action !== 'admin' " :maxlength="11" class="proxy-channel-edit" />
        </el-col>
        <el-col :span="14" :offset="1">
          <span v-show="dialogProps.action === 'admin'">系统费率: {{ channelModel.baseBrokerage }} ‰</span>
        </el-col>
      </el-form-item>
      <el-tooltip effect="dark" content="该通道每天0点到24点支付限额. 默认使用系统限额" placement="bottom">
        <el-form-item label="每日限额" prop="maxLimitAmount" hide-required-asterisk="true">
          <el-col :span="8">
            <el-input ref="channelMaxLimitAmount" v-model="channelModel.maxLimitAmount" :readonly="dialogProps.action !== 'proxy' " :maxlength="11" class="proxy-channel-edit" />
          </el-col>
          <el-col :span="14" :offset="1">
            <span>系统每日限额: {{ channelModel.sys_maxLimitAmount }} 元</span>
          </el-col>
        </el-form-item>
      </el-tooltip>
      <el-tooltip effect="dark" content="单笔最大支付限额. 默认使用系统限额" placement="bottom">
        <el-form-item label="支付限额" prop="maxPayAmount">
          <el-col :span="8">
            <el-input ref="channelMaxPayAmount" v-model="channelModel.maxPayAmount" :readonly="dialogProps.action !== 'proxy' "  :maxlength="11" class="proxy-channel-edit" />
          </el-col>
          <el-col :span="14" :offset="1">
            <span>系统最大限额: {{ channelModel.sys_maxPayAmount }} 元</span>
          </el-col>
        </el-form-item>
      </el-tooltip>
      <el-tooltip effect="dark" content="单笔最小支付金额. 默认使用系统限额" placement="bottom">
        <el-form-item label="最小限额" prop="miniPayAmount">
          <el-col :span="8">
            <el-input ref="channelMiniPayAmount" v-model="channelModel.miniPayAmount" :readonly="dialogProps.action !== 'proxy' "  :maxlength="11" class="proxy-channel-edit" />
          </el-col>
          <el-col :span="14" :offset="1">
            <span>系统最小限额: {{ channelModel.sys_miniPayAmount }} 元</span>
          </el-col>
        </el-form-item>
      </el-tooltip>
      <el-tooltip effect="dark" content="比例为千分之N. 默认使用系统费率" placement="bottom">
        <el-form-item label="费率(‰)" prop="brokerage">
          <el-col :span="8">
            <el-input ref="channelBrokerage" v-model="channelModel.brokerage" :readonly="dialogProps.action !== 'proxy' "  :maxlength="11" class="proxy-channel-edit" />
          </el-col>
        </el-form-item>
      </el-tooltip>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('channelForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { editProxyChannel } from '@/api/proxy/channel'
import * as Valide from '@/common/valide'
import { CentToDollars, brokerageConvert } from '@/common/commonFun'
export default {
  name: 'channel-edit',
  data() {
    var maxLimitAmount = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入最大限额'))
      } else if (!Valide.isNumber(value)) {
        callback(new Error('金额必须为数字'))
      } else if (value > 0 && value < this.channelModel.sys_maxLimitAmount) {
        callback(new Error('不能小于系统单日最大限额'))
      } else {
        callback()
      }
    }
    var maxPayAmount = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入单笔最大限额'))
      } else if (!Valide.isNumber(value)) {
        callback(new Error('金额必须为数字'))
      } else if (value > 0 && value < this.channelModel.sys_maxPayAmount) {
        callback(new Error('不能小于系统单笔最大限额'))
      } else {
        callback()
      }
    }
    var miniPayAmount = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入单笔最小限额'))
      } else if (!Valide.isNumber(value)) {
        callback(new Error('金额必须为数字'))
      } else if (value > 0 && value < this.channelModel.sys_miniPayAmount) {
        callback(new Error('不能小于系统单笔最小限额'))
      } else {
        callback()
      }
    }
    var validatebrokerage = (rule, value, callback) => {
      if (this.dialogProps.action !== 'proxy') {
        callback()
      }
      if (value === '' || value === undefined) {
        callback(new Error('请输入费率'))
      } else if (!Valide.isNumber(value)) {
        callback(new Error('金额必须为数字'))
      } else if (value > 0 && value < this.channelModel.sysBrokerage) {
        callback(new Error('不能小于基础费率'))
      } else {
        callback()
      }
    }
    var validateSysbrokerage = (rule, value, callback) => {
      if (this.dialogProps.action !== 'admin') {
        callback()
      }
      if (value === '' || value === undefined) {
        callback(new Error('请输入手续费率'))
      } else if (value > 0 && value < this.channelModel.baseBrokerage) {
        callback(new Error('不能小于系统费率'))
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
        brokerage: '0.0',
        maxLimitAmount: 0,
        maxPayAmount: 0,
        miniPayAmount: 0,
        sysBrokerage: '0.0',
        baseBrokerage: '0.0',
        sys_maxLimitAmount: 0,
        sys_maxPayAmount: 0,
        sys_miniPayAmount: 0,
        channelId: ''
      },
      upstreamInfoList: [],
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      activeTabName: 'channelTab',
      rules: {
        maxLimitAmount: [
          { required: true, message: '请输入单日最大限额', trigger: 'blur' },
          { validator: maxLimitAmount, trigger: 'blur' }
        ],
        maxPayAmount: [
          { required: true, message: '请输入单笔最大限额', trigger: 'blur' },
          { validator: maxPayAmount, trigger: 'blur' }
        ],
        miniPayAmount: [
          { required: true, message: '请输入单笔最小限额', trigger: 'blur' },
          { validator: miniPayAmount, trigger: 'blur' }
        ],
        brokerage: [
          { required: true, message: '请输入手续费比例', trigger: 'blur' },
          { validator: validatebrokerage, trigger: 'blur' }
        ],
        sysBrokerage: [
          { required: true, message: '请输入手续费比例', trigger: 'blur' },
          { validator: validateSysbrokerage, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openEditProxyChannelDialog', function(channel, editSrc) {
        this.channelModel.id = channel.id
        this.channelModel.code = channel.payChannel.code
        this.channelModel.name = channel.payChannel.name
        this.channelModel.channelId = channel.payChannel.id
        this.channelModel.maxLimitAmount = CentToDollars(channel.maxLimitAmount)
        this.channelModel.maxPayAmount = CentToDollars(channel.maxPayAmount)
        this.channelModel.miniPayAmount = CentToDollars(channel.miniPayAmount)
        this.channelModel.brokerage = brokerageConvert(channel.brokerage)
        this.channelModel.sys_maxLimitAmount = CentToDollars(channel.payChannel.maxLimitAmount)
        this.channelModel.sys_maxPayAmount = CentToDollars(channel.payChannel.maxPayAmount)
        this.channelModel.sys_miniPayAmount = CentToDollars(channel.payChannel.miniPayAmount)
        this.channelModel.baseBrokerage = brokerageConvert(channel.payChannel.brokerage)
        this.channelModel.sysBrokerage = brokerageConvert(channel.sysBrokerage)
        this.channelModel.proxyId = channel.proxyId
        this.dialogProps.title = '修改支付通道信息'
        this.dialogProps.visible = true
        if (editSrc) {
          this.dialogProps.action = editSrc
        } else {
          this.dialogProps.action = 'proxy'
        }
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
      editProxyChannel(this.channelModel)
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
        this.$refs['channelForm'].clearValidate()
        if (this.dialogProps.action === 'proxy') {
          this.$refs['channelMaxLimitAmount'].focus()
        } else if (this.dialogProps.action === 'admin') {
          this.$refs['sysBrokerage'].focus()
        }
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
