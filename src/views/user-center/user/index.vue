<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" placeholder="关键字" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 60px;" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加用户
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="ID" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="昵称" align="center">
        <template slot-scope="scope">
          {{ scope.row.nickname }}
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center" :formatter="sexFormat" />
      <el-table-column label="手机号" align="center">
        <template slot-scope="scope">
          {{ scope.row.mobile }}
        </template>
      </el-table-column>
      <el-table-column label="邮箱" align="center">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleResetPassword(scope.row)">重置密码</el-button>
          <el-button type="text" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="queryUsersPage" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="userInfo" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="userInfo.sex">
            <el-radio v-for="item in sexOptions" :label="item.value" :key="item.value">{{item.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userInfo.nickname" placeholder="昵称" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userInfo.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item v-if="userInfo.id == undefined" label="密码" prop="password">
          <el-input v-model="userInfo.password" type="password" autocomplete="off" placeholder="密码" show-password />
        </el-form-item>
        <el-form-item v-if="userInfo.id == undefined" label="确认密码" prop="checkPassword">
          <el-input v-model="userInfo.checkPassword" type="password" autocomplete="off" placeholder="确认密码" show-password />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="userInfo.mobile" placeholder="手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfo.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="remark">
          <el-select v-model="userInfo.roleInfos" multiple value-key="id" size="small" placeholder="请选择角色">
            <el-option v-for="item in roleOptions" :key="item.id" :label="item.roleName" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createUser():updateUser()">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { queryUsersPage, addUser, updateUser, deleteUser, resetUsertPassword, getUser } from '@/api/user/user'
import { listRole } from '@/api/user/role'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  components: { Pagination },
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
    var validateCheckPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.userInfo.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      list: null,
      listLoading: true,
      total: 0,
      roleOptions: undefined,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        sort: undefined,
        keyword: undefined
      },
      userInfo: {
        id: undefined,
        username: 1,
        password: undefined,
        checkPassword: undefined,
        nickname: undefined,
        source: undefined,
        sex: '',
        mobile: undefined,
        email: undefined,
        roleInfos: undefined
      },
      textMap: {
        update: '修改用户',
        create: '创建用户'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      sexOptions: undefined,
      rules: {
        sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
        nickname: [{ required: true, message: '请填写昵称', trigger: 'blur' }],
        username: [{ required: true, message: '请填写用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请填写密码', trigger: 'blur' }],
        checkPassword: [{ required: true, validator: validateCheckPassword, trigger: 'blur' }],
        mobile: [{ required: false, message: '请填写手机号', trigger: 'blur' }],
        email: [{ required: false, message: '请填写邮箱', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getListDictItem(this.GlobalConstant.globalSex).then(response => {
      this.sexOptions = response.result
    })
    this.queryUsersPage()
  },
  methods: {
    queryUsersPage () {
      this.listLoading = true
      queryUsersPage(this.listQuery).then(response => {
        this.list = response.result.data
        this.total = response.result.total
        this.listLoading = false
      })
    },
    handleFilter () {
      this.listQuery.pageNum = 1
      this.queryUsersPage()
    },
    // 数据性别字典翻译
    sexFormat (row, column) {
      return this.selectDictLabel(this.sexOptions, row.sex);
    },
    clearUserInfo () {
      this.userInfo = {
        id: undefined,
        username: undefined,
        password: undefined,
        nickname: undefined,
        source: undefined,
        sex: '',
        mobile: undefined,
        email: undefined,
        roleInfos: undefined
      }
    },
    handleCreate () {
      this.clearUserInfo()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.handleListRole()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createUser () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addUser(this.userInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '创建用户成功',
                type: 'success'
              })
              // 刷新当前页面
              this.queryUsersPage()
            }
          })
        }
      })
    },
    handleUpdate (row) {
      this.userInfo = Object.assign({}, row) // copy obj
      getUser(this.userInfo.id).then(response => {
        if (response.code === 200) {
          this.userInfo = response.result
        }
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.handleListRole()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateUser () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateUser(this.userInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '编辑用户成功',
                type: 'success'
              })
              // 刷新当前页面
              this.queryUsersPage()
            }
          })
        }
      })
    },
    handleDelete (id) {
      deleteUser(id).then(response => {
        if (response.code === 200) {
          this.$notify({
            title: '成功',
            message: '删除用户成功',
            type: 'success'
          })
          // 刷新当前页面
          this.queryUsersPage()
        }
      })
    },
    /** 重置密码按钮操作 */
    handleResetPassword (row) {
      this.$prompt('请输入"' + row.username + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.userInfo = Object.assign({}, row) // copy obj
        this.userInfo.password = value
        resetUsertPassword(this.userInfo).then(response => {
          if (response.code === 200) {
            this.$notify({
              title: '成功',
              message: '修改成功，新密码是：' + value,
              type: 'success'
            })
          }
        })
      }).catch(() => { })
    },
    handleListRole () {
      listRole().then(response => {
        if (response.code === 200) {
          this.roleOptions = response.result
        }
      })
    }
  }
}
</script>
