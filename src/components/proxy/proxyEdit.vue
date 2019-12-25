<template>
  <el-dialog
    v-loading="loading"
    :title="dialogProps.title"
    :visible.sync="dialogProps.visible"
    width="560px"
    @open="handleDialogOpen()"
  >
    <div slot="title" class="dialog-header">
      {{ dialogProps.title }}
    </div>
    <el-form
      ref="proxyForm"
      :model="proxyModel"
      :rules="rules"
      label-width="80px"
      label-position="right"
      size="small"
    >
      <el-form-item label="代理名称" prop="name">
        <el-col :span="16">
          <el-input ref="name" v-model="proxyModel.name" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="登录账号" prop="loginName">
        <el-col :span="16">
          <el-input ref="loginName" v-model="proxyModel.loginName" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="登录名称" prop="userName">
        <el-col :span="16">
          <el-input ref="userName" v-model="proxyModel.userName" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-col :span="16">
          <el-input v-model="proxyModel.password" :maxlength="32" type="password" auto-complete="off" />
        </el-col>
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-col :span="16">
          <el-input ref="phone" v-model="proxyModel.phone" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="电子邮件" prop="email">
        <el-col :span="16">
          <el-input ref="email" v-model="proxyModel.email" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="QQ" prop="qq">
        <el-col :span="16">
          <el-input ref="qq" v-model="proxyModel.qq" :maxlength="32" autofocus />
        </el-col>
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="proxyModel.state" :inactive-value="0" :active-value="1" active-color="#13ce66" inactive-color="#ff4949" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('proxyForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { saveProxy } from '@/api/sys/proxy'
import { pwdFilter } from '@/common/commonFun'
export default {
  name: 'proxy-edit',
  data() {
    var proxyNameValidator = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入代理名称'))
      } else {
        callback()
      }
    }
    var loginNameValidator = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入用户名'))
      } else {
        callback()
      }
    }
    var userNameValidator = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入用户名称'))
      } else {
        callback()
      }
    }
    var passwordValidator = (rule, value, callback) => {
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
      proxyModel: {
        id: 0,
        name: '',
        loginName: '',
        userName: '',
        password: '',
        phone: '',
        email: '',
        qq: '',
        state: 1
      },
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      activeTabName: 'proxyTab',
      rules: {
        name: [
          { required: true, message: '请输入代理名称', trigger: 'blur' },
          { validator: proxyNameValidator, trigger: 'blur' }
        ],
        loginName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: loginNameValidator, trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { validator: userNameValidator, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: passwordValidator, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openAddProxyDialog', function() {
        this.dialogProps.action = 'add'
        this.dialogProps.title = '添加代理'
        this.activeTabName = 'proxyTab'
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
      saveProxy(this.proxyModel)
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
        this.$refs['proxyForm'].clearValidate()
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
