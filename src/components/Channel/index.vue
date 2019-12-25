<template>
  <el-dialog
    v-loading="loading"
    :title="dialogProps.title"
    :visible.sync="dialogProps.visible"
    width="560px"
    :close-on-click-modal = "false"
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
      label-width="80px"
      label-position="right"
      size="small"
    >
      <el-form-item label="通道名称" prop="name">
        <el-col :span="16">
          <el-input ref="channelName" v-model="channelModel.name" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="通道编码" prop="code" hide-required-asterisk="true">
        <el-col :span="16">
          <el-input ref="channelCode" v-model="channelModel.code" :maxlength="32" />
        </el-col>
      </el-form-item>
      <el-tooltip effect="dark" content="该通道每天0点到24点支付限额. 0为不限制额度" placement="bottom">
        <el-form-item label="单日限额" prop="maxLimitAmount" hide-required-asterisk="true">
          <el-col :span="16">
            <el-input ref="channelMaxLimitAmount" v-model="channelModel.maxLimitAmount" :maxlength="32" />
          </el-col>
        </el-form-item>
      </el-tooltip>
      <el-tooltip effect="dark" content="限制单笔最大的支付金额. 0为不限制额度" placement="bottom">
        <el-form-item label="最大限额" prop="maxPayAmount">
          <el-col :span="16">
            <el-input ref="channelMaxPayAmount" v-model="channelModel.maxPayAmount" :maxlength="32" />
          </el-col>
        </el-form-item>
      </el-tooltip>
      <el-tooltip effect="dark" content="限制单笔最小的支付金额. 0为不限制额度" placement="bottom">
        <el-form-item label="最小限额" prop="miniPayAmount">
          <el-col :span="16">
            <el-input ref="channelMiniPayAmount" v-model="channelModel.miniPayAmount" :maxlength="32" />
          </el-col>
        </el-form-item>hai
      </el-tooltip>
      <el-tooltip effect="dark" content="支付手续费,比例为千分之N. 0为不限制额度" placement="bottom">
        <el-form-item label="费率(‰)" prop="brokerage">
          <el-col :span="16">
            <el-input ref="channelBrokerage" v-model="channelModel.brokerage" :maxlength="32" />
          </el-col>
        </el-form-item>
      </el-tooltip>
      <el-form-item label="上游接入" prop="isDownstream">
        <el-col :span="16">
          <el-switch v-model="channelModel.isDownstream" :inactive-value="0" :active-value="1" active-color="#13ce66" inactive-color="#ff4949" />
        </el-col>
      </el-form-item>
      <el-tooltip effect="dark" content="对应上游代码" placement="bottom">
        <el-form-item label="上游代码" prop="upstreamCode">
          <el-col :span="18">
            <el-input ref="upstreamCode" v-model="channelModel.upstreamCode" :maxlength="32" :disabled="inputDisabled(channelModel.isDownstream)" />
          </el-col>
        </el-form-item>
      </el-tooltip>
      <el-form-item label="上游名称" prop="state">
        <el-col :span="16">
          <el-select v-model="channelModel.upstreamId" :disabled="inputDisabled(channelModel.isDownstream)" placeholder="请选择">
            <el-option v-for="item in upstreamInfoList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-col>
      </el-form-item>
      <el-form-item label="上游费率(‰)" prop="brokerage">
        <el-col :span="16">
          <el-input ref="upstreamBrokerage" v-model="channelModel.upstreamBrokerage" :maxlength="32" />
        </el-col>
      </el-form-item>
      <el-form-item label="通道状态" prop="state">
        <el-col :span="16">
          <el-select v-model="channelModel.state" placeholder="请选择">
            <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('channelForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { saveChannel, editChannel } from '@/api/pay/channel'
import * as Valide from '@/common/valide'
import { CentToDollars, brokerageConvert } from '@/common/commonFun'
export default {
  name: 'channel-edit',
  data() {
    var validateCode = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入支付通道代码'))
      } else {
        if (!Valide.isNumber(value)) {
          callback(new Error('支付通道代码必须为数字'))
        }
        if (value.length < 4) {
          callback(new Error('支付通道至少是4位数字'))
        }
        callback()
      }
    }
    var validateNumber = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入金额'))
      } else {
        if (!Valide.isNumber(value)) {
          callback(new Error('金额必须为数字'))
        }
        callback()
      }
    }
    var validatebrokerage = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入手续费比例'))
      } else {
        if (!Valide.isFloating(value)) {
          callback(new Error('比例必须为带小数点的数字'))
        }
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
        upstreamBrokerage: '0.0',
        isDownstream: 0,
        maxLimitAmount: 0,
        maxPayAmount: 0,
        miniPayAmount: 0,
        upstreamCode: '',
        state: 80001,
        upstreamId: ''
      },
      upstreamInfoList: [],
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      activeTabName: 'channelTab',
      stateOptions: [{
        value: 80001,
        label: '待开通'
      },
      {
        value: 80002,
        label: '已开通'
      },
      {
        value: 80003,
        label: '维护中'
      },
      {
        value: 80004,
        label: '停止使用'
      }],
      rules: {
        name: [
          { required: true, message: '请输入支付通道名称', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入支付通道代码', trigger: 'blur' },
          { validator: validateCode, trigger: 'blur' }
        ],
        maxLimitAmount: [
          { required: true, message: '请输入支付最大限额', trigger: 'blur' },
          { validator: validateNumber, trigger: 'blur' }
        ],
        maxPayAmount: [
          { required: true, message: '请输入支付支付限额', trigger: 'blur' },
          { validator: validateNumber, trigger: 'blur' }
        ],
        miniPayAmount: [
          { required: true, message: '请输入支付最小限额', trigger: 'blur' },
          { validator: validateNumber, trigger: 'blur' }
        ],
        brokerage: [
          { required: true, message: '请输入支付手续费比例', trigger: 'blur' },
          { validator: validatebrokerage, trigger: 'blur' }
        ],
        upstreamBrokerage: [
          { required: true, message: '请输入支付上游手续费比例', trigger: 'blur' },
          { validator: validatebrokerage, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openEditChannelDialog', function(channel, upstreams) {
        this.channelModel.id = channel.id
        this.channelModel.code = channel.code
        this.channelModel.name = channel.name
        this.channelModel.isDownstream = channel.isDownstream
        this.channelModel.maxLimitAmount = CentToDollars(channel.maxLimitAmount)
        this.channelModel.maxPayAmount = CentToDollars(channel.maxPayAmount)
        this.channelModel.miniPayAmount = CentToDollars(channel.miniPayAmount)
        this.channelModel.brokerage = brokerageConvert(channel.brokerage)
        this.channelModel.upstreamBrokerage = brokerageConvert(channel.upstreamBrokerage)
        this.channelModel.upstreamCode = channel.upstreamCode
        this.channelModel.state = channel.state
        this.channelModel.upstreamId = channel.upstreamId
        this.upstreamInfoList = upstreams
        this.dialogProps.action = 'edit'
        this.dialogProps.title = '修改支付通道'
        this.activeTabName = 'channelTab'
        this.dialogProps.visible = true
      })
      this.$on('openAddChannelDialog', function(upstreams) {
        this.upstreamInfoList = upstreams
        this.dialogProps.action = 'add'
        this.dialogProps.title = '添加支付通道'
        this.activeTabName = 'channelTab'
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
      editChannel(this.channelModel)
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
      saveChannel(this.channelModel)
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
        this.$refs['channelName'].focus()
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
    },

    inputDisabled: (val) => {
      if (val === 0) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style scoped>

</style>
