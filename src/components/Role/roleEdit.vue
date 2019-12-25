<template>
  <el-dialog
    v-loading="loading"
    :title="dialogProps.title"
    :visible.sync="dialogProps.visible"
    width="700px"
    @open="handleDialogOpen()">
    <div slot="title" class="dialog-header">{{ dialogProps.title }}</div>
    <el-form
      ref="roleForm"
      :model="roleModel"
      :rules="formRules"
      :inline="true"
      label-width="80px"
      label-position="right"
      size="small">
      <el-container>
        <el-header>
          <el-form-item label="角色代码" prop="code">
            <el-col :span="24"><el-input  ref="code" :readonly="this.dialogProps.action=='edit'" :maxlength="32" v-model="roleModel.code" label="角色代码" /></el-col>
          </el-form-item>
          <el-form-item label="角色名" prop="name">
            <el-col :span="24"><el-input ref="name" :maxlength="32" v-model="roleModel.name" label="角色名"/></el-col>
          </el-form-item>
        </el-header>
        <el-container>
          <el-aside width="200px" >
            <!--路由列表-->
            <el-form-item prop="router">
              <el-tree
                ref="routerTree"
                :data="routerTreeNodes"
                :props="defaultProps"
                :default-checked-keys="checkedKeys"
                :highlight-current="true"
                :default-expand-all="false"
                :check-on-click-node="true"
                node-key="id"
                show-checkbox
                @check-change="handleNodeClick"
              />
            </el-form-item>
          </el-aside>
          <el-main>
            <!--资源列表-->
            <el-form-item prop="resource" >
              <el-col :span="24">
                <el-table
                  ref="resourceTable"
                  :data="resources"
                  tooltip-effect="dark"
                  border
                  @selection-change="tableChange">
                  <el-table-column type="selection" width="55"/>
                  <el-table-column label="资源名称" prop="name" width="180"/>
                  <el-table-column label="路由id" prop="routerId" width="80"/>
                </el-table>
              </el-col>
            </el-form-item>
          </el-main>
        </el-container>
      </el-container>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleDialogClose()">取 消</el-button>
      <el-button type="primary" size="small" @click="submitForm('roleForm')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { saveRole, editRole } from '@/api/sys/role'
import { getAllRouter } from '@/api/sys/router'
import { getResourceByRouterIds } from '@/api/sys/resource'
import { createRouterTree } from '@/utils/treeUtils'

export default {
  name: 'role-edit',
  data() {
    return {
      loading: false,
      roleModel: {
        id: 0,
        code: '',
        name: '',
        routerIds: [],
        resourceIds: []
      },
      routers: [],
      resources: [],
      dialogProps: {
        visible: false,
        action: '',
        title: ''
      },
      routerTreeNodes: [],
      checkedKeys: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      formRules: {
        code: [
          { required: true, message: '请输入角色代码', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.$on('openEditRoleDialog', function(role) {
        this.roleModel.id = role.id
        this.roleModel.code = role.code
        this.roleModel.name = role.name
        this.roleModel.routerIds = role.routerIds
        this.roleModel.resourceIds = role.resourceIds
        // this.routerTreeNodes = createRouterTree(role.routerList) // 树形数据
        this.resources = role.resourceList
        this.dialogProps.action = 'edit'
        this.dialogProps.title = '修改角色'
        this.dialogProps.visible = true
      })
      this.$on('openAddRoleDialog', function() {
        this.roleModel.id = 0
        this.roleModel.code = ''
        this.roleModel.name = ''
        this.roleModel.routerIds = []
        this.roleModel.resourceIds = []
        this.dialogProps.action = 'add'
        this.dialogProps.title = '添加角色'
        this.dialogProps.visible = true
      })
    })
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.dialogProps.action === 'add') {
            this.doSaveRole()
          } else {
            this.doUpdateRole()
          }
        } else {
          return false
        }
      })
    },
    doUpdateRole() {
      this.loading = true
      editRole(this.roleModel)
        .then(response => {
          this.loading = false
          this.dialogProps.visible = false
          this.$emit('save-finished')
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    doSaveRole() {
      this.loading = true
      saveRole(this.roleModel)
        .then(response => {
          this.loading = false
          this.dialogProps.visible = false
          this.$emit('save-finished')
        })
        .catch(error => {
          this.outputError(error)
        })
    },
    tableChange(val) {
      let ids = []
      val.forEach(item => {
        ids.push(item.id)
      })
      this.roleModel.resourceIds = ids
    },
    handleDialogClose() {
      this.dialogProps.visible = false
    },
    handleDialogOpen() {
      this.$nextTick(() => {
        this.loading = true
        this.$refs['roleForm'].clearValidate()
        this.$refs['code'].focus()
        getAllRouter().then(response => {
          this.routerTreeNodes = createRouterTree(response.data) // 树形数据
        }).catch(error => {
          this.outputError(error)
        })
        if (this.dialogProps.action === 'edit') {
          if (this.resources) {
            this.resources.forEach(row => {
              this.$refs.resourceTable.toggleRowSelection(row) // 默认选择表格数据
            })
          }
          this.$refs.routerTree.setCheckedKeys(this.roleModel.routerIds)
        }
        this.loading = false
      })
    },
    handleNodeClick(node) {
      let nodeIds = this.$refs.routerTree.getCheckedKeys()
      if (nodeIds && nodeIds.length > 0) {
        if (nodeIds.sort().toString() !== this.roleModel.routerIds.sort().toString()) {
          this.roleModel.routerIds = nodeIds
          getResourceByRouterIds(this.roleModel).then(response => {
            this.resources = response.data
          }).catch(error => {
            this.outputError(error)
          })
        }
      } else {
        this.roleModel.routerIds = []
        this.resources = []
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

