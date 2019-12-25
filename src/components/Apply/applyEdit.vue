<template>
  <el-dialog
    v-loading="loading"
    :title="dialogProps.title"
    :visible.sync="dialogProps.visible"
    :close-on-click-modal="false"
    width="560px"
    @open="handleDialogOpen()"
  >
    <div slot="title" class="dialog-header">
      {{ dialogProps.title }}
    </div>
    <el-form ref="cashInApplyForm" :model="applyModel" :rules="applyRules" label-width="120px" label-position="right" size="small">
      <el-form-item label="提现金额" prop="applyMoney">
        <el-col :span="8">
          <el-input ref="applyMoney" v-model="applyModel.applyMoney" autofocus>
            <template slot="append">
              元
            </template>
          </el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="银行卡" prop="bankId">
        <el-select v-model="applyModel.bankId" placeholder="请选择">
          <el-option v-for="item in allBankInfoList" :key="item.id" :label="item.value" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="showGoogleCodeInput" label="验证器Code" prop="googleCode">
        <el-col :span="8">
          <el-input ref="googleCode" v-model="applyModel.googleCode" autofocus />
        </el-col>
      </el-form-item>
      <br>
      <span class="el-form-item__label surplusMoney"> 当前余额: {{ surplusMoney | CentToDollars }} 元</span>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('cashInApplyForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { saveCashApply } from '@/api/pay/cashApply'
import { isNumber } from '@/common/valide'
import { DollarsToCent } from '@/common/commonFun'
import { mapGetters } from 'vuex'
export default {
  name: 'cash-in-apply-edit',
  computed: {
    ...mapGetters([
      'info'
    ])
  },
  data() {
    const validataApplyMoney = (rule, value, callback) => {
      if (!isNumber(value)) {
        callback('提现金额必须为整数')
      } else if (DollarsToCent(value) > this.surplusMoney) {
        callback('余额不足')
      } else {
        callback()
      }
    }
    const validataGoogleCode = (rule, value, callback) => {
      if (this.info.isVerify === 0) {
        callback()
      }
      if (!isNumber(value)) {
        callback('验证器Code必须为数字')
      } else if (value.length < 6 || value.length > 6) {
        callback('验证器Code为6位数字')
      } else {
        callback()
      }
    }
    const validataBankId = (rule, value, callback) => {
      if (this.applyModel.bankId === 0) {
        callback('请选择拨款银行')
      } else {
        callback()
      }
    }
    return {
      loading: false,
      applyModel: {
        applyMoney: 0,
        bankId: '',
        googleCode: ''
      },
      surplusMoney: 0,
      showGoogleCodeInput: false,
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      allBankInfoList: [],
      applyRules: {
        applyMoney: [{ required: true, trigger: 'blur', validator: validataApplyMoney }],
        googleCode: [{ required: true, trigger: 'blur', validator: validataGoogleCode }],
        bankId: [{ required: true, trigger: 'blur', validator: validataBankId }]
      }

    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openAddApplyDialog', function(allBankInfoList, marchantInfo) {
        this.splitBankInfo(allBankInfoList.data)
        this.surplusMoney = marchantInfo.data.totalAccount.surplusMoney
        this.dialogProps.action = 'add'
        this.dialogProps.title = '新建提现申请'
        this.activeTabName = 'cashInApplyTab'
        this.dialogProps.visible = true
        if (this.info.isVerify === 1) {
          this.showGoogleCodeInput = true
        }
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
      saveCashApply(this.applyModel)
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
        this.$refs['cashInApplyForm'].clearValidate()
        this.$refs['applyMoney'].focus()
      })
    },

    handleDialogClose() {
      this.dialogProps.visible = false
    },

    splitBankInfo(val) {
      let length = val.length
      for (let i = 0; i < length; i++) {
        let bankInfo = {}
        bankInfo.id = val[i].id
        let str = val[i].accountName + '    ' +
                  val[i].bankName + '    ' +
                  val[i].accountNumber + '    ' +
                  val[i].branchName + '    ' +
                  val[i].branchAddr
        bankInfo.value = str
        this.allBankInfoList[i] = bankInfo
      }
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
  .surplusMoney{
    font-size: 1.1em;
    font-weight:bold;
  }
</style>
