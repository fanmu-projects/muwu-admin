<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" placeholder="关键字" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 60px;" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加字典
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="ID" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="字典名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.dictName }}
        </template>
      </el-table-column>
      <el-table-column label="字典编码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.dictCode }}</span>
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
          <el-button type="text" @click="handleItem(scope.row)">字典项</el-button>
          <el-button type="text" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="queryDictsPage" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dictInfo" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dictInfo.status">
            <el-radio v-for="item in statusOptions" :label="item.value" :key="item.value">{{item.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="dictInfo.dictName" placeholder="字典名称" />
        </el-form-item>
        <el-form-item label="字典编码" prop="dictCode">
          <el-input v-model="dictInfo.dictCode" placeholder="字典编码" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="dictInfo.remark" placeholder="描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createDict():updateDict()">
          提交
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="字典项" :visible.sync="dialogFormVisibleItem">
      <item :dictId="dictInfo.id" v-if="dialogFormVisibleItem" />
    </el-dialog>
  </div>
</template>

<script>
import { queryDictsPage, addDict, updateDict, deleteDict } from '@/api/user/dict'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import Item from './Item' // secondary package based on el-pagination

export default {
  components: { Pagination, Item },
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
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        sort: undefined,
        keyword: undefined
      },
      dictInfo: {
        id: undefined,
        dictName: undefined,
        dictCode: undefined,
        status: undefined,
        remark: undefined
      },
      textMap: {
        update: '修改字典',
        create: '创建字典'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      dialogFormVisibleItem: false,
      statusOptions: undefined,
      rules: {
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        dictName: [{ required: true, message: '请填写名称', trigger: 'blur' }],
        dictCode: [{ required: true, message: '请填写编码', trigger: 'blur' }],
        remark: [{ required: false, message: '请填写备注', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getListDictItem(this.GlobalConstant.globalStatus).then(response => {
      this.statusOptions = response.result
    })
    this.queryDictsPage()
  },
  methods: {
    queryDictsPage () {
      this.listLoading = true
      queryDictsPage(this.listQuery).then(response => {
        this.list = response.result.data
        this.total = response.result.total
        this.listLoading = false
      })
    },
    handleFilter () {
      this.listQuery.pageNum = 1
      this.queryDictsPage()
    },
    // 数据状态字典翻译
    statusFormat (row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    clearDictInfo () {
      this.dictInfo = {
        id: undefined,
        dictName: undefined,
        dictCode: undefined,
        status: undefined,
        remark: undefined
      }
    },
    handleItem (row) {
      this.dictInfo = Object.assign({}, row) // copy obj
      this.dialogFormVisibleItem = true
    },
    handleCreate () {
      this.clearDictInfo()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createDict () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addDict(this.dictInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '创建字典成功',
                type: 'success'
              })
              // 刷新当前页面
              this.queryDictsPage()
            }
          })
        }
      })
    },
    handleUpdate (row) {
      this.dictInfo = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateDict () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateDict(this.dictInfo).then(response => {
            this.dialogFormVisible = false
            if (response.code === 200) {
              this.$notify({
                title: '成功',
                message: '编辑字典成功',
                type: 'success'
              })
              // 刷新当前页面
              this.queryDictsPage()
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
            message: '删除字典成功',
            type: 'success'
          })
          // 刷新当前页面
          this.queryDictsPage()
        }
      })
    }
  }
}
</script>
