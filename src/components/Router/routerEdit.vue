<template>
  <el-dialog
    v-loading="loading"
    :title="dialogProps.title"
    :visible.sync="dialogProps.visible"
    width="660px"
    @open="handleDialogOpen()">
    <div slot="title" class="dialog-header">{{ dialogProps.title }}</div>
    <el-form
      ref="routerForm"
      :inline="true"
      :model="routerModel"
      :rules="formRules"
      label-width="80px"
      label-position="right"
      size="small">
      <el-row>
        <el-col :span="12">
          <el-form-item label="路由组名">
            <el-input ref="groupName" :maxlength="50" v-model="routerModel.groupName" autofocus/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组件路径" prop="component">
            <el-input :maxlength="128" v-model="routerModel.component"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="路由名称">
            <el-input :maxlength="128" v-model="routerModel.name"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上级路由">
            <el-select v-model="routerModel.parentId" class="parent-router-select" placeholder="请选择">
              <el-option
                v-for="item in parentRouterList"
                :key="item.id"
                :label="item.title"
                :value="item.id"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="路径名称">
            <el-input :maxlength="128" v-model="routerModel.path"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="跳转路径">
            <el-input :maxlength="128" v-model="routerModel.redirect"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="扩展属性">
            <el-input :rows="5" v-model="routerModel.meta" class="properties-textarea" type="textarea"/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('routerForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { saveRouter, updateRouter } from '@/api/sys/router'

export default {
  name: 'router-edit',
  props: {
    parentRouterList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      loading: false,
      routerModel: {
        id: 0,
        component: '',
        groupName: '',
        meta: '',
        name: '',
        parentId: 0,
        path: '',
        redirect: ''
      },
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      formRules: {
        name: [
          { required: true, message: '请输入路由名称', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ]
      },
      parentRouters: [
        {
          value: 0,
          label: '请选择'
        }
      ]
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.$on('openEditRouterDialog', function(router) {
        this.routerModel = router
        this.dialogProps.action = 'edit'
        this.dialogProps.title = '修改路由'
        this.dialogProps.visible = true
      })
      this.$on('openAddRouterDialog', function() {
        this.dialogProps.action = 'add'
        this.dialogProps.title = '添加路由'
        this.routerModel = {}
        this.dialogProps.visible = true
      })
    })
  },
  methods: {
    handleDialogOpen() {
      this.$nextTick(() => {
        this.$refs['routerForm'].clearValidate()
        this.$refs['groupName'].focus()
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.dialogProps.action === 'add') {
            this.doSaveRouter()
          } else {
            this.doUpdateRouter()
          }
        } else {
          return false
        }
      })
    },
    handleDialogClose() {
      this.dialogProps.visible = false
    },
    doUpdateRouter() {
      this.loading = true
      updateRouter(this.routerModel)
        .then(response => {
          this.loading = false
          this.dialogProps.visible = false
          this.$emit('save-finished')
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    doSaveRouter() {
      this.loading = true
      saveRouter(this.routerModel)
        .then(response => {
          this.loading = false
          this.dialogProps.visible = false
          this.$emit('save-finished')
        })
        .catch(error => {
          this.outputError(error)
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

<style lang="scss" scoped>
  .parent-router-select {
    width: 188px;
  }
  .properties-textarea {
    width: 496px;
  }
</style>

