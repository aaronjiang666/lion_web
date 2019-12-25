<template>
  <el-dialog
    v-loading="loading"
    :title="dialogProps.title"
    :visible.sync="dialogProps.visible"
    width="560px"
    :close-on-click-modal = "false"
    @open="handleDialogOpen()"
  >
    <div slot="title" class="dialog-header">
      {{ dialogProps.title }}
    </div>
    <el-form
      ref="bankInfoForm"
      :model="bankModel"
      label-width="80px"
      label-position="right"
      size="small"
    >
          <el-form-item label="银行名称" prop="bankName">
            <el-col :span="16">
              <el-input ref="bankName" v-model="bankModel.bankName" :maxlength="32" autofocus />
            </el-col>
          </el-form-item>
          <el-form-item label="开户名" prop="accountName">
            <el-col :span="16">
              <el-input ref="accountName" v-model="bankModel.accountName" :maxlength="32" autofocus />
            </el-col>
          </el-form-item>
          <el-form-item label="账号" prop="accountNumber">
            <el-col :span="16">
              <el-input ref="accountNumber" v-model="bankModel.accountNumber" :maxlength="32" autofocus />
            </el-col>
          </el-form-item>
          <el-form-item label="支行名称" prop="branchName">
            <el-col :span="16">
              <el-input ref="branchName" v-model="bankModel.branchName" :maxlength="32" autofocus />
            </el-col>
          </el-form-item>
          <el-form-item label="支行地址" prop="branchAddr">
            <el-col :span="16">
              <el-input ref="branchAddr" v-model="bankModel.branchAddr" :maxlength="32" autofocus />
            </el-col>
          </el-form-item>
          <el-form-item label="备注" prop="remarks">
            <el-col :span="16">
              <el-input ref="remarks" v-model="bankModel.remarks" :maxlength="32" autofocus />
            </el-col>
          </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('bankInfoForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { saveBankInfo, editBankInfo } from '@/api/pay/bankinfo'

export default {
  name: 'bank-info-edit',
  data() {
    return {
      loading: false,
      bankModel: {
        id: 0,
        accountName: '', // 开户名
        accountNumber: '', // 账号
        bankName: '', // 银行名称
        branchAddr: '', // 支行地址
        branchName: '', // 支行名称
        remarks: '' // 备注
      },
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      activeTabName: 'bankInfoTab'
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openEditBankDialog', function(bankInfo) {
        this.bankModel = bankInfo
        this.dialogProps.action = 'edit'
        this.dialogProps.title = '修改银行卡'
        this.activeTabName = 'bankInfoTab'
        this.dialogProps.visible = true
      })
      this.$on('openAddBankDialog', function() {
        this.dialogProps.action = 'add'
        this.dialogProps.title = '添加银行卡'
        this.activeTabName = 'bankInfoTab'
        this.dialogProps.visible = true
      })
    })
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.dialogProps.action === 'add') {
            this.doSaveUser()
          } else {
            this.doUpdateUser()
          }
        }
      })
    },

    doUpdateUser() {
      this.loading = true
      editBankInfo(this.bankModel)
        .then(response => {
          this.loading = false
          this.dialogProps.visible = false
          this.$emit('save-finished')
        }).catch(error => {
          this.outputError(error)
        })
    },

    doSaveUser() {
      this.loading = true
      saveBankInfo(this.bankModel)
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
        this.$refs['bankInfoForm'].clearValidate()
        this.$refs['bankName'].focus()
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
