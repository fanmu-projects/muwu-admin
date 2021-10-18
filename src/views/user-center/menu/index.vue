<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" placeholder="关键字" style="width: 200px;" class="filter-item" @keyup.enter.native="listMenuTree" />
      <el-button v-waves class="filter-item" style="margin-left: 60px;" type="primary" icon="el-icon-search" @click="listMenuTree">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加菜单
      </el-button>
    </div>

    <el-table v-if="render" ref="dragTable" v-loading="listLoading" :data="list" element-loading-text="Loading" row-key="id" :tree-props="{ children: 'children'}" border fit highlight-current-row>
      <el-table-column label="菜单名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.menuName }}
        </template>
      </el-table-column>
      <el-table-column label="菜单编码" align="center">
        <template slot-scope="scope">
          {{ scope.row.menuCode }}
        </template>
      </el-table-column>
      <el-table-column label="图标" align="center">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column label="地址" align="center">
        <template slot-scope="scope">
          {{ scope.row.url }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" :formatter="statusFormat" />
      <el-table-column label="隐藏" align="center" :formatter="hiddenFormat" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="text" @click="handlePermission(scope.row)">分配权限</el-button>
          <el-button type="text" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="menuInfo" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="父节点" prop="parentId">
          <treeselect v-model="menuInfo.parentId" :options="menuOptions" :show-count="true" placeholder="选择上级菜单" />
        </el-form-item>
        <el-form-item label="菜单状态" prop="status">
          <el-radio-group v-model="menuInfo.status">
            <el-radio v-for="item in statusOptions" :label="item.value" :key="item.value">{{item.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否隐藏" prop="hidden">
          <el-radio-group v-model="menuInfo.hidden">
            <el-radio v-for="item in hiddenOptions" :label="item.value" :key="item.value">{{item.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="menuInfo.menuName" placeholder="菜单名称" />
        </el-form-item>
        <el-form-item label="菜单编码" prop="menuCode">
          <el-input v-model="menuInfo.menuCode" placeholder="菜单编码" />
        </el-form-item>
        <el-form-item label="菜单URL" prop="url">
          <el-input v-model="menuInfo.url" placeholder="菜单URL" />
        </el-form-item>
        <el-form-item label="菜单组件" prop="component">
          <el-input v-model="menuInfo.component" placeholder="菜单组件" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
            <IconSelect ref="iconSelect" @selected="selected" />
            <el-input slot="reference" v-model="menuInfo.icon" placeholder="点击选择图标" readonly>
              <svg-icon v-if="menuInfo.icon" slot="prefix" :icon-class="menuInfo.icon" class="el-input__icon" style="height: 32px;width: 16px;" />
              <i v-else slot="prefix" class="el-icon-search el-input__icon" />
            </el-input>
          </el-popover>
        </el-form-item>
        <!-- <el-form-item label="菜单权限" prop="remark">
          <el-select v-model="menuInfo.permissionInfos" multiple filterable value-key="id" size="small" placeholder="请选择权限">
            <el-option v-for="item in permissionOptions" :key="item.id" :label="item.permissionName" :value="item" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="菜单描述" prop="remark">
          <el-input v-model="menuInfo.remark" placeholder="菜单描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createMenu():updateMenu()">
          提交
        </el-button>
      </div>
    </el-dialog>

    <permission-relation :permissionDialogFormVisible.sync="permissionDialogFormVisible" :permissionInfos="permissionInfos" @update-permission-relation="updatePermissionRelation" />
  </div>
</template>

<script>
import { listMenuTree, addMenu, updateMenu, deleteMenu, sortMenu, getMenu, updateMenuPermission } from '@/api/user/menu'
import { listPermission } from '@/api/user/permission'
import waves from '@/directive/waves' // waves directive
import Sortable from 'sortablejs'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'
import PermissionRelation from './../components/PermissionRelation'

export default {
  directives: { waves },
  components: { Treeselect, IconSelect, PermissionRelation },
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
      list: [],
      listLoading: true,
      oldList: undefined,
      render: true,
      menuOptions: undefined,
      permissionOptions: undefined,
      permissionProps: {
        multiple: true,
        value: 'id'
      },
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        sort: undefined,
        keyword: undefined
      },
      menuInfo: {
        id: undefined,
        menuName: undefined,
        menuCode: undefined,
        url: undefined,
        icon: undefined,
        status: undefined,
        hidden: undefined,
        remark: undefined,
        parentId: undefined,
        permissionInfos: undefined
      },
      permissionIds: [],
      textMap: {
        update: '修改角色',
        create: '创建角色'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      statusOptions: undefined,
      hiddenOptions: undefined,
      rules: {
        parentId: [{ required: true, message: '请选择父节点', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        hidden: [{ required: true, message: '请选择是否隐藏', trigger: 'change' }],
        menuName: [{ required: true, message: '请填写名称', trigger: 'blur' }],
        menuCode: [{ required: true, message: '请填写编码', trigger: 'blur' }],
        url: [{ required: true, message: '请填写URL', trigger: 'blur' }],
        component: [{ required: true, message: '请填写组件', trigger: 'blur' }],
        icon: [{ required: true, message: '请填写图标', trigger: 'blur' }],
        remark: [{ required: false, message: '请填写备注', trigger: 'blur' }]
      },

      permissionDialogFormVisible: false,
      permissionInfos: null
    }
  },
  created () {
    this.getListDictItem(this.GlobalConstant.globalStatus).then(response => {
      this.statusOptions = response.result
    })
    this.getListDictItem(this.GlobalConstant.menuHidden).then(response => {
      this.hiddenOptions = response.result
    })
    this.listMenuTree()
  },
  methods: {
    listMenuTree () {
      this.listLoading = true
      listMenuTree().then(response => {
        this.list = response.result[0].children
        this.listLoading = false
        this.oldList = this.treeFormat(this.list)
        this.render = false
        this.menuOptions = this.treeRecursion(response.result)
        this.$nextTick(() => {
          this.render = true
          this.$nextTick(() => {
            this.setSort()
          })
        })
      })
    },
    // 数据状态字典翻译
    statusFormat (row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    hiddenFormat (row, column) {
      return this.selectDictLabel(this.hiddenOptions, row.hidden);
    },
    setSort () {
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function (dataTransfer, dragEl) {
          // to avoid Firefox bug
          // Detail see : https://github.com/RubaXa/Sortable/issues/1012
          // dataTransfer.setData('Text', dragEl.textContent);
        },
        onEnd: evt => {
          if (this.oldList[evt.oldIndex].parentId !== this.oldList[evt.newIndex].parentId) {
            this.$message.error('暂不支持跨节点拖拽！')
            this.listMenuTree()
          } else {
            // for show the changes, you can delete in you code
            const tempIndex = this.oldList.splice(evt.oldIndex, 1)[0]
            this.oldList.splice(evt.newIndex, 0, tempIndex)
            const newList = []
            this.oldList.map((it, index) => {
              if (tempIndex.parentId === it.parentId) {
                newList.push({ id: it.id, number: newList.length })
              }
            })
            sortMenu(newList).then(response => {
              if (response.code !== 200) {
                this.listMenuTree()
              }
            })
            // 父节点排序对子节点有影响，遗漏BUG
            if (tempIndex.parentId === 1) {
              this.listMenuTree()
            }
          }
        }
      })
    },
    treeRecursion (data) {
      if (!Array.isArray(data)) return []
      let ids = []
      ids = data.map((it, index) => {
        if (it.children && it.children.length) {
          return { id: it.id, label: it.menuName, children: this.treeRecursion(it.children) }
        } else {
          return { id: it.id, label: it.menuName }
        }
      })
      return ids
    },
    treeFormat (data) {
      if (!Array.isArray(data)) return []
      const ids = []
      function deep (data) {
        data.map((it, index) => {
          ids.push({ id: it.id, parentId: it.parentId, order: it.order })
          if (it.children && it.children.length) {
            deep(it.children)
          }
        })
      }
      deep(data)
      return ids
    },
    clearMenuInfo () {
      this.menuInfo = {
        id: undefined,
        menuName: undefined,
        menuCode: undefined,
        url: undefined,
        icon: undefined,
        status: undefined,
        hidden: undefined,
        remark: undefined,
        parentId: undefined,
        permissionInfos: undefined
      }
    },
    handleCreate () {
      this.clearMenuInfo()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.handleListPermission()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createMenu () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addMenu(this.menuInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '创建菜单成功',
                type: 'success'
              })
              // 刷新当前表格
              this.listMenuTree()
            }
          })
        }
      })
    },
    handleUpdate (row) {
      this.menuInfo = Object.assign({}, row) // copy obj
      getMenu(this.menuInfo.id).then(response => {
        if (response.code === 200) {
          this.menuInfo = response.result
        }
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.handleListPermission()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateMenu () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateMenu(this.menuInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '编辑菜单成功',
                type: 'success'
              })
              // 刷新当前表格
              this.listMenuTree()
            }
          })
        }
      })
    },
    handleDelete (id) {
      deleteMenu(id).then(response => {
        if (response.code === 200) {
          this.$notify({
            title: '成功',
            message: '删除菜单成功',
            type: 'success'
          })
          // 刷新当前表格
          this.listMenuTree()
        }
      })
    },
    handleListPermission () {
      listPermission().then(response => {
        if (response.code === 200) {
          this.permissionOptions = response.result
        }
      })
    },
    // 选择图标
    selected (name) {
      this.menuInfo.icon = name
    },

    handlePermission (row) {
      this.permissionDialogFormVisible = true
      getMenu(row.id).then(response => {
        this.menuInfo = response.result
        this.permissionInfos = response.result.permissionInfos;
      })
    },
    updatePermissionRelation (permissionInfos) {
      this.menuInfo.permissionInfos = permissionInfos
      updateMenuPermission(this.menuInfo).then(response => {
        this.$notify({
          title: '成功',
          message: '编辑菜单成功',
          type: 'success'
        })
        // 刷新当前表格
        this.listMenuTree()
      })
    }
  }
}
</script>
