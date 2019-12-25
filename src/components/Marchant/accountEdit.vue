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
      ref="editAccountForm"
      :model="accountModel"
      :rules="rules"
      label-width="120px"
      label-position="right"
      size="small"
    >
      <el-form-item label="金额" prop="money">
        <el-col :span="20">
          <el-input ref="editmoney" v-model="accountModel.money" :maxlength="11" class="proxy-channel-edit" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="手续费" prop="poundage">
        <el-col :span="20">
          <el-input ref="poundage" v-model="accountModel.poundage" :maxlength="11" class="proxy-channel-edit" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="类型" prop="intoOrOut">
        <el-radio v-model="accountModel.intoOrOut" :label="1">
          收入
        </el-radio>
        <el-radio v-model="accountModel.intoOrOut" :label="2">
          支出
        </el-radio>
      </el-form-item>
      <el-form-item label="备注" prop="remarks" hide-required-asterisk="true">
        <el-col :span="20">
          <el-input
            ref="channelRemarks"
            v-model="accountModel.remarks"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 8}"
            :maxlength="200"
          />
        </el-col>
      </el-form-item>
      <el-form-item label="Google验证码" prop="googleCode">
        <el-col :span="20">
          <el-input ref="googleCode" v-model="accountModel.googleCode" :maxlength="11" class="proxy-channel-edit" autofocus />
        </el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="doUpdate()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { editMerchantAccount } from '@/api/pay/marchant'

export default {
  name: 'account-edit',
  data() {
    let validatebrokerage = (rule, value, callback) => {
      if (value === '' || value === undefined || value === 0) {
        callback(new Error('请输入金额'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      accountModel: {
        merchantId: 0,
        intoOrOut: 0,
        remarks: '',
        money: 0,
        poundage: 0,
        googleCode: ''
      },
      dialogProps: {
        visible: false,
        action: '',
        title: '修改商户账目'
      },
      rules: {
        money: [
          { required: true, message: '请输入金额', trigger: 'blur' },
          { validator: validatebrokerage, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openEditAccountDialog', function(parameter) {
        this.accountModel.merchantId = parameter.id
        this.dialogProps.action = 'edit'
        this.dialogProps.title = '修改商户账目'
        this.dialogProps.visible = true
      })
    })
  },

  methods: {

    doUpdate() {
      this.loading = true
      editMerchantAccount(this.accountModel)
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
        this.$refs['editAccountForm'].clearValidate()
        this.$refs['editmoney'].focus()
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
