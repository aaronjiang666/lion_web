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
      ref="userForm"
      :model="userModel"
      :rules="dialogProps.action === 'add' ? addRules : editRules"
      label-width="80px"
      label-position="right"
      size="small"
    >
      <el-tabs v-model="activeTabName" type="border-card">
        <el-tab-pane name="userInfoTab" label="基本信息" class="user-info-tab-pane">
          <el-form-item label="用户名" prop="name">
            <el-col :span="16">
              <el-input ref="username" v-model="userModel.name" :maxlength="32" autofocus />
            </el-col>
          </el-form-item>
          <el-form-item v-show="dialogProps.action === 'add'" label="登录名" prop="loginName">
            <el-col :span="16">
              <el-input v-model="userModel.loginName" :maxlength="32" />
            </el-col>
          </el-form-item>
          <el-form-item v-show="dialogProps.action === 'add'" label="密码" prop="password">
            <el-col :span="16">
              <el-input v-model="userModel.password" :maxlength="32" type="password" auto-complete="off" />
            </el-col>
          </el-form-item>
          <el-form-item v-show="dialogProps.action === 'add'" label="确认密码" prop="checkPassword">
            <el-col :span="16">
              <el-input v-model="userModel.checkPassword" :maxlength="32" type="password" auto-complete="off" />
            </el-col>
          </el-form-item>
          <el-form-item label="禁用">
            <el-switch v-model="userModel.locked" inactive-value="0" active-value="1" />
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="角色设置">
          <el-col :span="16">
            <el-form-item label="用户类型">
            <el-select v-model="userModel.userType" @change="inputShowFun()">
              <el-option
                v-for="item in userTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="商户号" prop="marchantNo">
              <el-input v-model="userModel.marchantNo" :disabled="inputShow"  :maxlength="16" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-checkbox
              v-model="roleCheckboxList.checkAll"
              :indeterminate="roleCheckboxList.isIndeterminate"
              @change="handleCheckAllChange"
            >
              全选
            </el-checkbox>
          </el-col>
          <div style="margin: 15px 0;" />
          <el-col :span="16">
            <el-checkbox-group v-model="userModel.roleIds">
              <el-checkbox
                v-for="role in roleCheckboxList.roles"
                :key="role.id"
                :label="role.id"
                border
                @change="handleCheckedRolesChange(role.id)"
              >
                {{ role.name }}
              </el-checkbox>
            </el-checkbox-group>
          </el-col>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('userForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { saveUser, editUser } from '@/api/sys/user'
import { pwdFilter } from '@/common/commonFun'

export default {
  name: 'user-edit',
  data() {
    var validatePassword = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入密码'))
      } else {
        if (this.userModel.checkPassword !== '') {
          this.$refs.userForm.validateField('checkPassword')
        }
        callback()
      }
    }
    var validateCheckPassword = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请再次输入密码'))
      } else if (!pwdFilter(value)) {
        callback('密码由数字、英文字母、下划线组成')
      } else if (value !== this.userModel.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      inputShow: true,
      userModel: {
        id: 0,
        locked: '0',
        name: '',
        loginName: '',
        password: '',
        roleIds: [],
        userType: 1,
        marchantNo: ''
      },
      roleCheckboxList: {
        checkAll: false,
        isIndeterminate: false,
        roles: []
      },
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      userTypeList: [
        {
          value: 1,
          label: '系统用户'
        },
        {
          value: 2,
          label: '商户用户'
        },
        {
          value: 3,
          label: '代理用户'
        }
      ],
      activeTabName: 'userInfoTab',
      addRules: {
        name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ],
        loginName: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ],
        checkPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateCheckPassword, trigger: 'blur' }
        ]
      },
      editRules: {
        name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on('openEditUserDialog', function(user, roles) {
        this.userModel = user
        if (!this.userModel.roleIds) {
          this.userModel.roleIds = []
        }
        this.roleCheckboxList.roles = roles
        this.dialogProps.action = 'edit'
        this.dialogProps.title = '修改用户'
        this.activeTabName = 'userInfoTab'
        this.dialogProps.visible = true
      })
      this.$on('openAddUserDialog', function(roles) {
        this.userModel = {
          roleIds: []
        }
        this.roleCheckboxList.roles = roles
        this.dialogProps.action = 'add'
        this.dialogProps.title = '添加用户'
        this.activeTabName = 'userInfoTab'
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
    inputShowFun() {
      if (this.userModel.userType === 2 && this.dialogProps.action === 'add') {
        this.inputShow = false
        this.roleCheckboxList.roles.find(item => {
          if (item.code === 'DefaultPayRole') { // 查找商户默认绑定角色
            this.userModel.roleIds.push(item.id)
          }
        })
      }
    },
    doUpdateUser() {
      this.loading = true
      editUser(this.userModel)
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
      saveUser(this.userModel)
        .then(response => {
          this.loading = false
          this.dialogProps.visible = false
          this.$emit('save-finished')
        }).catch(error => {
          this.outputError(error)
        })
    },

    getAllRoleId() {
      let allRoleId = []
      for (let role of this.roleCheckboxList.roles) {
        allRoleId.push(role.id)
      }
      return allRoleId
    },

    handleDialogOpen() {
      this.$nextTick(() => {
        this.$refs['userForm'].clearValidate()
        this.$refs['username'].focus()
      })
    },

    handleCheckAllChange(val) {
      this.userModel.roleIds = (val ? this.getAllRoleId() : [])
      this.roleCheckboxList.isIndeterminate = false
    },

    handleCheckedRolesChange(value) {
      let checkedCount = value.length
      this.roleCheckboxList.checkAll = checkedCount === this.roleCheckboxList.roles.length
      this.roleCheckboxList.isIndeterminate = checkedCount > 0 && checkedCount < this.roleCheckboxList.roles.length
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
