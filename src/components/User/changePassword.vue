<template>
  <el-dialog
    v-loading="loading"
    :visible.sync="dialogVisible"
    title="修改密码"
    width="560px"
    append-to-body
    @open="handleDialogOpen()">
    <div slot="title" class="dialog-header">修改密码</div>
    <el-form
      ref="changePasswordForm"
      :model="userModel"
      :rules="rules"
      label-width="80px"
      label-position="right"
      size="small">
      <el-form-item label="用户名">
        <el-col :span="16"><el-input v-model="userModel.name" disabled/></el-col>
      </el-form-item>
      <el-form-item label="登录名">
        <el-col :span="16"><el-input v-model="userModel.loginName" disabled/></el-col>
      </el-form-item>
      <el-form-item label="原密码" prop="oldPassword">
        <el-col :span="16">
          <el-input ref="oldPassword" v-model="userModel.oldPassword" type="password" auto-complete="off"/>
        </el-col>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-col :span="16">
          <el-input ref="newPassword" v-model="userModel.newPassword" type="password" auto-complete="off"/>
        </el-col>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPassword">
        <el-col :span="16">
          <el-input v-model="userModel.checkPassword" type="password" auto-complete="off"/>
        </el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('changePasswordForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { changePwd } from '@/api/sys/user'
import { pwdFilter } from '@/common/commonFun'
export default {
  name: 'change-password',
  data() {
    var validateOldPassword = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }
    var validatePassword = (rule, value, callback) => {
      console.log(pwdFilter(value))
      if (value === '' || value === undefined) {
        callback(new Error('请输入密码'))
      } else if (!pwdFilter(value)) {
        callback('密码由数字、英文字母、下划线组成')
      } else {
        if (this.userModel.checkPassword !== '') {
          this.$refs.changePasswordForm.validateField('checkPassword')
        }
        callback()
      }
    }
    var validateCheckPassword = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.userModel.newPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      userModel: {
        id: 0,
        name: '',
        loginName: '',
        oldPassword: '',
        newPassword: ''
      },
      dialogVisible: false,
      rules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { validator: validateOldPassword, trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ],
        checkPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateCheckPassword, trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.$on('openChangePasswordDialog', function(user) {
        this.userModel = user
        this.dialogVisible = true
      })
    })
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.doChangePassword()
        } else {
          return false
        }
      })
    },
    doChangePassword() {
      this.loading = true
      changePwd(this.userModel)
        .then(response => {
          this.loading = false
          this.dialogVisible = false
          this.$emit('save-finished')
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    handleDialogClose() {
      this.dialogVisible = false
    },
    handleDialogOpen() {
      this.$nextTick(() => {
        this.$refs['changePasswordForm'].clearValidate()
        this.$refs['oldPassword'].focus()
      })
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

<style lang="scss">
  .el-dialog {
    text-align: left;
  }
  .dialog-header {
    width: 100%;
    font-weight: bold;
    padding-bottom: 8px;
    border-bottom: solid 1px #fefefe;
  }
</style>

