<template>
  <el-dialog
    v-loading="loading"
    :title="dialogProps.title"
    :visible.sync="dialogProps.visible"
    :close-on-click-modal = "false"
    width="560px"
    @open="handleDialogOpen()"
  >
    <div slot="title" class="dialog-header">
      {{ dialogProps.title }}
    </div>
    <el-form
      ref="marchantForm"
      :model="marchantModel"
      :rules="rules"
      label-width="80px"
      label-position="right"
      size="small"
    >
      <el-form-item label="商户账号" prop="loginName">
        <el-col :span="16">
          <el-input ref="loginName" v-model="marchantModel.loginName" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="商户名称" prop="userName">
        <el-col :span="16">
          <el-input ref="userName" v-model="marchantModel.userName" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-col :span="16">
          <el-input v-model="marchantModel.password" :maxlength="32" type="password" auto-complete="off" />
        </el-col>
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-col :span="16">
          <el-input ref="phone" v-model="marchantModel.phone" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="电子邮件" prop="email">
        <el-col :span="16">
          <el-input ref="email" v-model="marchantModel.email" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="QQ" prop="qq">
        <el-col :span="16">
          <el-input ref="qq" v-model="marchantModel.qq" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="状态">
        <el-switch
          v-model="marchantModel.state"
          :inactive-value="2"
          :active-value="1"
          active-color="#13ce66"
          inactive-color="#ff4949"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('marchantForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addMarchant } from '@/api/pay/marchant'
import { pwdFilter } from '@/common/commonFun'

export default {
  name: 'marchant-edit',
  data() {
    var loginNameValidator = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入用户名'))
      } else {
        callback()
      }
    }
    var validatePassword = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入密码'))
      } else if (!pwdFilter(value)) {
        callback('密码由数字、英文字母、下划线组成')
      } else {
        callback()
      }
    }
    return {
      loading: false,
      marchantModel: {
        id: 0,
        loginName: '',
        userName: '',
        password: '',
        phone: '',
        email: '',
        qq: '',
        idCard: '',
        state: 1
      },
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      activeTabName: 'marchantTab',
      rules: {
        loginName: [
          { required: true, message: '商户账号', trigger: 'blur' },
          { validator: loginNameValidator, trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { validator: loginNameValidator, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openAddMarchantDialog', function() {
        this.dialogProps.action = 'add'
        this.dialogProps.title = '添加商户'
        this.activeTabName = 'marchantTab'
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
      // editChannel(this.channelModel)
      //   .then(response => {
      //     this.loading = false
      //     this.dialogProps.visible = false
      //     this.$emit('save-finished')
      //   }).catch(error => {
      //     this.outputError(error)
      //   })
    },
    doSave() {
      this.loading = true
      addMarchant(this.marchantModel)
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
        this.$refs['marchantForm'].clearValidate()
        this.$refs['loginName'].focus()
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
