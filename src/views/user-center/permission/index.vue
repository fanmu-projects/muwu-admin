<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" placeholder="关键字" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 60px;" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加权限
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCategoryShow">
        添加分类
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleRefreshCache">
        刷新缓存
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleWhitelist">
        设置白名单
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleGeneratePermission">
        构建权限列表
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="ID" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="权限名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.permissionName }}
        </template>
      </el-table-column>
      <el-table-column label="权限编码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.permissionCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="URL" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" :formatter="statusFormat" />
      <el-table-column label="白名单" align="center" :formatter="whitelistFormat" />
      <el-table-column label="描述" align="center">
        <template slot-scope="scope">
          {{ scope.row.remark }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="queryPermissionsPage" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="permissionInfo" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="状态" prop="status">
          <!-- <el-select v-model="permissionInfo.status" class="filter-item" placeholder="请选择">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select> -->
          <el-radio-group v-model="permissionInfo.status">
            <el-radio v-for="item in statusOptions" :label="item.value" :key="item.value">{{item.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="白名单" prop="whitelist">
          <el-radio-group v-model="permissionInfo.whitelist">
            <el-radio v-for="item in whitelistOptions" :label="item.value" :key="item.value">{{item.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限名称" prop="permissionName">
          <el-input v-model="permissionInfo.permissionName" placeholder="权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="permissionCode">
          <el-input v-model="permissionInfo.permissionCode" placeholder="权限编码" />
        </el-form-item>
        <el-form-item label="菜单URL" prop="url">
          <el-input v-model="permissionInfo.url" placeholder="菜单URL" />
        </el-form-item>
        <el-form-item label="分类" prop="url">
          <el-select v-model="permissionInfo.permissionCategoryInfos" multiple filterable value-key="id" size="small" placeholder="请选择分类">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.categoryName" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="permissionInfo.remark" placeholder="描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createPermission():updatePermission()">
          提交
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="分类" :visible.sync="categoryShow">
      <div class="filter-container">
        <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCategoryCreate">
          添加分类
        </el-button>
      </div>
      <el-table v-loading="categoryListLoading" :data="categoryList" element-loading-text="Loading" border fit highlight-current-row>
        <el-table-column align="ID" label="ID" width="95">
          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column label="分类名称" align="center">
          <template slot-scope="scope">
            {{ scope.row.categoryName }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleCategoryUpdate(scope.row)">编辑</el-button>
            <el-button type="text" @click="handleCategoryDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog :title="categoryTextMap[categoryDialogStatus]" :visible.sync="categoryDialogFormVisible">
      <el-form ref="categoryDataForm" :rules="rules" :model="permissionCategoryInfo" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="permissionCategoryInfo.categoryName" placeholder="分类名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="categoryDialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="categoryDialogStatus==='create'?createPermissionCategory():updatePermissionCategory()">
          提交
        </el-button>
      </div>
    </el-dialog>

    <permission-relation :permissionDialogFormVisible.sync="permissionDialogFormVisible" :permissionInfos="permissionInfos" @update-permission-relation="updatePermissionRelation" />
  </div>
</template>

<script>
import { queryPermissionsPage, addPermission, updatePermission, deletePermission, getPermission, refreshCache, listPermission, batchUpdateWhitelist } from '@/api/user/permission'
import { listPermissionCategory, addPermissionCategory, updatePermissionCategory, deletePermissionCategory, generatePermission } from '@/api/user/permission-category'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
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
      categoryOptions: undefined,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        sort: undefined,
        keyword: undefined
      },
      permissionInfo: {
        id: undefined,
        permissionName: undefined,
        permissionCode: undefined,
        url: undefined,
        status: undefined,
        whitelist: undefined,
        remark: undefined,
        permissionCategoryInfos: undefined
      },
      textMap: {
        update: '修改权限',
        create: '创建权限'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      statusOptions: undefined,
      whitelistOptions: undefined,
      rules: {
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        whitelist: [{ required: true, message: '请选择白名单', trigger: 'change' }],
        permissionName: [{ required: true, message: '请填写名称', trigger: 'blur' }],
        permissionCode: [{ required: true, message: '请填写编码', trigger: 'blur' }],
        url: [{ required: true, message: '请填写URL', trigger: 'blur' }],
        remark: [{ required: false, message: '请填写备注', trigger: 'blur' }]
      },
      categoryShow: false,
      categoryList: null,
      categoryListLoading: false,
      permissionCategoryInfo: {
        id: undefined,
        categoryName: undefined
      },
      categoryTextMap: {
        update: '修改分类',
        create: '创建分类'
      },
      categoryDialogStatus: '',
      categoryDialogFormVisible: false,
      permissionDialogFormVisible: false,
      permissionInfos: null
    }
  },
  created () {
    this.getListDictItem(this.GlobalConstant.globalStatus).then(response => {
      this.statusOptions = response.result
    })
    this.getListDictItem(this.GlobalConstant.permissionWhitelist).then(response => {
      this.whitelistOptions = response.result
    })
    this.queryPermissionsPage()
  },
  methods: {
    queryPermissionsPage () {
      this.listLoading = true
      queryPermissionsPage(this.listQuery).then(response => {
        this.list = response.result.data
        this.total = response.result.total
        this.listLoading = false
      })
    },
    handleFilter () {
      this.listQuery.pageNum = 1
      this.queryPermissionsPage()
    },
    // 数据状态字典翻译
    statusFormat (row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    whitelistFormat (row, column) {
      return this.selectDictLabel(this.whitelistOptions, row.whitelist);
    },
    clearPermissionInfo () {
      this.permissionInfo = {
        id: undefined,
        permissionName: undefined,
        permissionCode: undefined,
        url: undefined,
        status: undefined,
        whitelist: undefined,
        remark: undefined,
        permissionCategoryInfos: undefined
      }
    },
    handleCreate () {
      this.clearPermissionInfo()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.handleListCategory()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createPermission () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addPermission(this.permissionInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '创建权限成功',
                type: 'success'
              })
              // 刷新当前页面
              this.queryPermissionsPage()
            }
          })
        }
      })
    },
    handleUpdate (row) {
      this.permissionInfo = Object.assign({}, row) // copy obj
      getPermission(this.permissionInfo.id).then(response => {
        if (response.code === 200) {
          this.permissionInfo = response.result
        }
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.handleListCategory()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updatePermission () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updatePermission(this.permissionInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '编辑权限成功',
                type: 'success'
              })
              // 刷新当前页面
              this.queryPermissionsPage()
            }
          })
        }
      })
    },
    handleDelete (id) {
      deletePermission(id).then(response => {
        if (response.code === 200) {
          this.$notify({
            title: '成功',
            message: '删除权限成功',
            type: 'success'
          })
          // 刷新当前页面
          this.queryPermissionsPage()
        }
      })
    },

    handleListCategory () {
      listPermissionCategory().then(response => {
        this.categoryOptions = response.result
      })
    },
    // 分类
    handleCategoryShow () {
      this.categoryShow = true
      this.listPermissionCategory()
    },
    listPermissionCategory () {
      this.categoryListLoading = true
      listPermissionCategory().then(response => {
        this.categoryList = response.result
        this.categoryListLoading = false
      })
    },
    clearPermissionCategoryInfo () {
      this.permissionCategoryInfo = {
        id: undefined,
        categoryName: undefined
      }
    },
    handleCategoryCreate () {
      this.clearPermissionCategoryInfo()
      this.categoryDialogStatus = 'create'
      this.categoryDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['categoryDataForm'].clearValidate()
      })
    },
    createPermissionCategory () {
      this.$refs['categoryDataForm'].validate((valid) => {
        if (valid) {
          addPermissionCategory(this.permissionCategoryInfo).then(response => {
            this.categoryDialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '创建分类成功',
                type: 'success'
              })
              // 刷新当前页面
              this.listPermissionCategory()
            }
          })
        }
      })
    },
    handleCategoryUpdate (row) {
      this.permissionCategoryInfo = Object.assign({}, row) // copy obj
      this.categoryDialogStatus = 'update'
      this.categoryDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['categoryDataForm'].clearValidate()
      })
    },
    updatePermissionCategory () {
      this.$refs['categoryDataForm'].validate((valid) => {
        if (valid) {
          updatePermissionCategory(this.permissionCategoryInfo).then(response => {
            this.categoryDialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '编辑分类成功',
                type: 'success'
              })
              // 刷新当前页面
              this.listPermissionCategory()
            }
          })
        }
      })
    },
    handleCategoryDelete (id) {
      deletePermissionCategory(id).then(response => {
        if (response.code === 200) {
          this.$notify({
            title: '成功',
            message: '删除分类成功',
            type: 'success'
          })
          // 刷新当前页面
          this.listPermissionCategory()
        }
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
    handleWhitelist () {
      this.permissionDialogFormVisible = true
      listPermission({ whitelist: 1 }).then(response => {
        this.permissionInfos = response.result
      })
    },
    updatePermissionRelation (permissionInfos) {
      permissionInfos.forEach(permissionInfo => {
        permissionInfo.whitelist = 1
      });
      batchUpdateWhitelist(permissionInfos).then(response => {
        this.permissionDialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '设置白名单成功',
          type: 'success'
        })
        // 刷新当前页面
        this.queryPermissionsPage()
      })
    },
    handleGeneratePermission () {
      generatePermission().then(response => {
        this.$notify({
          title: '成功',
          message: '构建权限列表成功',
          type: 'success'
        })
      })
    }
  }
}
</script>
