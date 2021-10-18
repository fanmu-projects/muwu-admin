<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" placeholder="关键字" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 60px;" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加字典项
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="ID" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="字典项文本" align="center">
        <template slot-scope="scope">
          {{ scope.row.itemText }}
        </template>
      </el-table-column>
      <el-table-column label="字典项值" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.itemValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="序号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.number }}</span>
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
          <el-button type="text" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="queryDictItemsPage" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" append-to-body>
      <el-form ref="dataForm" :rules="rules" :model="dictItemInfo" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dictItemInfo.status">
            <el-radio v-for="item in statusOptions" :label="item.value" :key="item.value">{{item.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="字典项文本" prop="itemText">
          <el-input v-model="dictItemInfo.itemText" placeholder="字典项文本" />
        </el-form-item>
        <el-form-item label="字典项值" prop="itemValue">
          <el-input v-model="dictItemInfo.itemValue" placeholder="字典项值" />
        </el-form-item>
        <el-form-item label="序号" prop="number">
          <el-input v-model="dictItemInfo.number" placeholder="序号" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="dictItemInfo.remark" placeholder="描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createDictItem():updateDictItem()">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { queryDictItemsPage, addDictItem, updateDictItem, deleteDictItem } from '@/api/user/dictItem'
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
  props: {
    dictId: {
      required: true,
      type: Number
    }
  },
  data () {
    return {
      list: null,
      listLoading: true,
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        sort: undefined,
        keyword: undefined,
        dictId: this.dictId
      },
      dictItemInfo: {
        id: undefined,
        dictId: this.dictId,
        itemText: undefined,
        itemValue: undefined,
        number: undefined,
        status: undefined,
        remark: undefined
      },
      textMap: {
        update: '修改字典项',
        create: '创建字典项'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      statusOptions: undefined,
      rules: {
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        itemText: [{ required: true, message: '请填写名称', trigger: 'blur' }],
        itemValue: [{ required: true, message: '请填写编码', trigger: 'blur' }],
        number: [{ required: true, message: '请填写序号', trigger: 'blur' }],
        remark: [{ required: false, message: '请填写备注', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getListDictItem(this.GlobalConstant.globalStatus).then(response => {
      this.statusOptions = response.result
    })
    this.queryDictItemsPage()
  },
  methods: {
    queryDictItemsPage () {
      this.listLoading = true
      queryDictItemsPage(this.listQuery).then(response => {
        this.list = response.result.data
        this.total = response.result.total
        this.listLoading = false
      })
    },
    handleFilter () {
      this.listQuery.pageNum = 1
      this.queryDictItemsPage()
    },
    // 数据状态字典翻译
    statusFormat (row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    clearDictItemInfo () {
      this.dictItemInfo = {
        id: undefined,
        dictId: this.dictId,
        itemText: undefined,
        itemValue: undefined,
        number: undefined,
        status: undefined,
        remark: undefined
      }
    },
    handleCreate () {
      this.clearDictItemInfo()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createDictItem () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addDictItem(this.dictItemInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '创建字典项成功',
                type: 'success'
              })
              // 刷新当前页面
              this.queryDictItemsPage()
            }
          })
        }
      })
    },
    handleUpdate (row) {
      this.dictItemInfo = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateDictItem () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateDictItem(this.dictItemInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '编辑字典项成功',
                type: 'success'
              })
              // 刷新当前页面
              this.queryDictItemsPage()
            }
          })
        }
      })
    },
    handleDelete (id) {
      deleteDict(id).then(response => {
        if (response.code === 200) {
          this.$notify({
            title: '成功',
            message: '删除字典项成功',
            type: 'success'
          })
          // 刷新当前页面
          this.queryDictItemsPage()
        }
      })
    }
  }
}
</script>
