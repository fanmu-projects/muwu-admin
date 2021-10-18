<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" placeholder="关键字" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 60px;" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加角色
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleRefreshCache">
        刷新缓存
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleSharePermission">
        添加共享权限
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="ID" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="角色名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.roleName }}
        </template>
      </el-table-column>
      <el-table-column label="角色编码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.roleCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" :formatter="statusFormat" />
      <el-table-column label="描述" align="center">
        <template slot-scope="scope">
          {{ scope.row.remark }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="text" @click="handlePermission(scope.row)">分配权限</el-button>
          <el-button type="text" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="queryRolesPage" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="roleInfo" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleInfo.status">
            <el-radio v-for="item in statusOptions" :label="item.value" :key="item.value">{{item.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleInfo.roleName" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="roleInfo.roleCode" placeholder="角色编码" />
        </el-form-item>
        <el-form-item label="角色菜单" prop="roleCode">
          <el-tree ref="menu" :data="menuTree" :props="defaultProps" show-checkbox node-key="id" empty-text="加载中，请稍后" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="roleInfo.remark" placeholder="描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createRole():updateRole()">
          提交
        </el-button>
      </div>
    </el-dialog>

    <permission-relation :permissionDialogFormVisible.sync="permissionDialogFormVisible" :permissionInfos="permissionInfos" @update-permission-relation="updatePermission" />
  </div>
</template>

<script>
import { queryRolesPage, addRole, updateRole, deleteRole, getRole, updateRolePermission, refreshCache } from '@/api/user/role'
import { listMenuTree } from '@/api/user/menu'
import { listPermission, batchUpdateRoleSharePermission } from '@/api/user/permission'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination.
import PermissionRelation from './../components/PermissionRelation'

export default {
  components: { Pagination, PermissionRelation },
  directives: { waves },
  filters: {
    statusFilter (status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data () {
    return {
      list: null,
      listLoading: true,
      total: 0,
      menuTree: null,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        sort: undefined,
        keyword: undefined
      },
      roleInfo: {
        id: undefined,
        roleName: undefined,
        roleCode: undefined,
        status: undefined,
        remark: undefined,
        permissionInfos: undefined
      },
      textMap: {
        update: '修改角色',
        create: '创建角色'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      statusOptions: undefined,
      rules: {
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        roleName: [{ required: true, message: '请填写名称', trigger: 'blur' }],
        roleCode: [{ required: true, message: '请填写编码', trigger: 'blur' }],
        remark: [{ required: false, message: '请填写备注', trigger: 'blur' }]
      },
      defaultProps: {
        children: 'children',
        label: 'menuName'
      },

      permissionDialogFormVisible: false,
      permissionInfos: null,
      permissionDialogStatus: ''
    }
  },
  created () {
    this.getListDictItem(this.GlobalConstant.globalStatus).then(response => {
      this.statusOptions = response.result
    })
    this.queryRolesPage()
  },
  methods: {
    queryRolesPage () {
      this.listLoading = true
      queryRolesPage(this.listQuery).then(response => {
        this.list = response.result.data
        this.total = response.result.total
        this.listLoading = false
      })
    },
    handleFilter () {
      this.listQuery.pageNum = 1
      this.queryRolesPage()
    },
    // 数据状态字典翻译
    statusFormat (row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    clearRoleInfo () {
      this.roleInfo = {
        id: undefined,
        roleName: undefined,
        roleCode: undefined,
        status: undefined,
        remark: undefined,
        permissionInfos: undefined
      }
    },
    handleCreate () {
      this.clearRoleInfo()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.handleMenuTree()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createRole () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.roleInfo.menuInfos = this.getMenuAllCheckedNodes()
          addRole(this.roleInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '创建角色成功',
                type: 'success'
              })
              // 刷新当前页面
              this.queryRolesPage()
            }
          })
        }
      })
    },
    handleUpdate (row) {
      this.roleInfo = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.handleMenuTree()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateRole () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.roleInfo.menuInfos = this.getMenuAllCheckedNodes()
          updateRole(this.roleInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '编辑角色成功',
                type: 'success'
              })
              // 刷新当前页面
              this.queryRolesPage()
            }
          })
        }
      })
    },
    handleDelete (id) {
      deleteRole(id).then(response => {
        if (response.code === 200) {
          this.$notify({
            title: '成功',
            message: '删除角色成功',
            type: 'success'
          })
          // 刷新当前页面
          this.queryRolesPage()
        }
      })
    },
    // 处理菜单树
    handleMenuTree () {
      this.menuTree = null
      listMenuTree().then(response => {
        if (response.code === 200) {
          this.menuTree = response.result
          // 修改时获取已选节点
          if (this.roleInfo.id !== undefined) {
            getRole(this.roleInfo.id).then(response => {
              if (response.code === 200) {
                this.roleInfo = response.result
                this.$refs.menu.setCheckedNodes(this.roleInfo.menuInfos)
              }
            })
          }
        }
      })
    },
    // 所有菜单节点数据
    getMenuAllCheckedNodes () {
      // 目前被选中的菜单节点
      const checkedNodes = this.$refs.menu.getHalfCheckedNodes()
      // 半选中的菜单节点
      const halfCheckedNodes = this.$refs.menu.getCheckedNodes()
      checkedNodes.unshift.apply(checkedNodes, halfCheckedNodes)
      return checkedNodes
    },

    updatePermission (permissionInfos) {
      if (this.permissionDialogStatus == 'permission') {
        this.updatePermissionRelation(permissionInfos)
      } else {
        this.batchUpdateRoleSharePermission(permissionInfos)
      }
    },
    handlePermission (row) {
      this.permissionDialogFormVisible = true
      this.permissionDialogStatus = 'permission'
      getRole(row.id).then(response => {
        this.roleInfo = response.result
        this.permissionInfos = response.result.permissionInfos;
      })
    },
    updatePermissionRelation (permissionInfos) {
      this.roleInfo.permissionInfos = permissionInfos
      updateRolePermission(this.roleInfo).then(response => {
        this.permissionDialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '编辑角色成功',
          type: 'success'
        })
        // 刷新当前页面
        this.queryRolesPage()
      })
    },
    handleRefreshCache () {
      refreshCache().then(response => {
        this.$notify({
          title: '成功',
          message: '刷新缓存成功',
          type: 'success'
        })
      })
    },

    handleSharePermission (row) {
      this.permissionDialogFormVisible = true
      this.permissionDialogStatus = 'sharePermission'
      listPermission({ roleSharePermission: 1 }).then(response => {
        this.permissionInfos = response.result;
      })
    },
    batchUpdateRoleSharePermission (permissionInfos) {
      permissionInfos.forEach(permissionInfo => {
        permissionInfo.roleSharePermission = 1
      });
      batchUpdateRoleSharePermission(permissionInfos).then(response => {
        this.permissionDialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '编辑角色成功',
          type: 'success'
        })
        // 刷新当前页面
        this.queryRolesPage()
      })
    }
  }
}
</script>

<style scoped>
.table-layout {
  padding: 20px;
  border-left: 1px solid #dcdfe6;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
}

.top-line {
  border-top: 1px solid #dcdfe6;
}
</style>
