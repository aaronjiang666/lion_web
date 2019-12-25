<template>
  <el-dialog
    v-loading="loading"
    :title="dialogProps.title"
    :visible.sync="dialogProps.visible"
    width="560px"
    @open="handleDialogOpen()">
    <div slot="title" class="dialog-header">{{ dialogProps.title }}</div>
    <el-form
      ref="resourceForm"
      :model="resourceModel"
      :rules="formRules"
      label-width="80px"
      label-position="right"
      size="small">
      <el-form-item label="路由">
        <el-col :span="16">
          <el-input v-show="dialogProps.action === 'add'" :readonly="true" v-model="resourceModel.routerName"/>
          <el-select v-show="dialogProps.action === 'edit'" v-model="resourceModel.routerId" class="parent-router-select" placeholder="请选择">
            <el-option
              v-for="item in routerList"
              :key="item.id"
              :label="item.title"
              :value="item.id"/>
          </el-select>
        </el-col>
      </el-form-item>
      <el-form-item label="资源名称" prop="name">
        <el-col :span="16"><el-input ref="name" :maxlength="32" v-model="resourceModel.name"/></el-col>
      </el-form-item>
      <el-form-item label="资源代码" prop="code">
        <el-col :span="16"><el-input :maxlength="32" v-model="resourceModel.code" autofocus/></el-col>
      </el-form-item>
      <el-form-item label="Url" prop="url">
        <el-col :span="16"><el-input :maxlength="64" v-model="resourceModel.url"/></el-col>
      </el-form-item>
      <el-form-item label="权限代码" prop="permission">
        <el-col :span="16"><el-input :maxlength="32" v-model="resourceModel.permission"/></el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('resourceForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { saveResource, editResource } from '@/api/sys/resource'

export default {
  name: 'resource-edit',
  data() {
    return {
      loading: false,
      resourceModel: {
        id: 0,
        code: '',
        name: '',
        url: '',
        permssion: '',
        routerId: 0
      },
      routerList: [],
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      formRules: {
        code: [
          { required: true, message: '请输入资源代码', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入资源名称', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入url', trigger: 'blur' },
          { min: 6, max: 64, message: '长度在 6 到 64 个字符', trigger: 'blur' }
        ],
        permission: [
          { required: true, message: '请输入权限代码', trigger: 'blur' },
          { min: 6, max: 50, message: '长度在 6 到 50 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.$on('openEditResourceDialog', function(resource, routerList) {
        this.resourceModel = resource
        this.routerList = routerList
        this.dialogProps.action = 'edit'
        this.dialogProps.title = '修改资源'
        this.dialogProps.visible = true
      })
      this.$on('openAddResourceDialog', function(router) {
        this.dialogProps.action = 'add'
        this.dialogProps.title = '添加资源'
        this.resourceModel = {
          routerId: router.id,
          routerName: router.name
        }
        this.dialogProps.visible = true
      })
    })
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.dialogProps.action === 'add') {
            this.doSaveResource()
          } else {
            this.doUpdateResource()
          }
        } else {
          return false
        }
      })
    },
    doUpdateResource() {
      this.loading = true
      editResource(this.resourceModel)
        .then(response => {
          this.loading = false
          this.dialogProps.visible = false
          this.$emit('save-finished')
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    doSaveResource() {
      this.loading = true
      saveResource(this.resourceModel)
        .then(response => {
          this.loading = false
          this.dialogProps.visible = false
          this.$emit('save-finished')
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    handleDialogClose() {
      this.dialogProps.visible = false
    },
    handleDialogOpen() {
      this.$nextTick(() => {
        this.$refs['resourceForm'].clearValidate()
        this.$refs['name'].focus()
      })
    },
    outputError(error) {
      console.log(error.response ? error.response : error.message)
      this.loading = false
      this.$message({
        showClose: true,
        message: '出错了，请按F12查看浏览器日志。',
        type: 'error'
      })
    }
  }
}
</script>

