<template>
  <el-dialog title="分配权限" :visible.sync="visible">
    <el-card shadow="never">
      <div v-for="(category,index) in permissionCategoryList" :class="index===0?'top-line':null" :key="'category:'+category.id">
        <el-row class="table-layout" style="background: #F2F6FC;">
          <el-checkbox v-model="category.checked" @change="handlePermissionCategoryCheck(category)">
            {{category.categoryName}}
          </el-checkbox>
        </el-row>
        <el-row class="table-layout">
          <el-col :span="8" v-for="(permission,index) in category.permissionInfos" :key="permission.id" style="padding: 4px 0">
            <el-checkbox v-model="permission.checked" @change="handlePermissionCheck(permission)">
              {{permission.permissionName}}
            </el-checkbox>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">
        取消
      </el-button>
      <el-button type="primary" @click="updatePermissionRelation()">
        提交
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listPermissionCategory } from '@/api/user/permission-category'

export default {
  components: { Pagination },
  directives: { waves },
  props: {
    permissionDialogFormVisible: {
      type: Boolean,
      default: false
    },
    permissionInfos: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    permissionInfos: {
      deep: true,
      handler (val) {
        this.handlePermission()
      }
    }
  },
  data () {
    return {
      permissionCategoryList: null,
    }
  },
  computed: {
    visible: {
      get () {
        return this.permissionDialogFormVisible
      },
      set (val) {
        this.$emit('update:permissionDialogFormVisible', val)
      }
    }
  },
  methods: {
    handlePermissionCategoryCheck (category) {
      if (category.permissionInfos == null) {
        return
      }
      category.permissionInfos.forEach((item) => {
        item.checked = category.checked
      })
      this.$forceUpdate();
    },
    handlePermissionCheck (permission) {
      this.$forceUpdate();
    },
    updatePermissionRelation () {
      if (this.permissionCategoryList == null) {
        return
      }
      let permissionInfos = []
      this.permissionCategoryList.forEach((permissionCategory) => {
        if (permissionCategory.permissionInfos != null && permissionCategory.permissionInfos.length > 0) {
          permissionCategory.permissionInfos.forEach((permission) => {
            if (permission.checked) {
              permissionInfos.push(permission);
            }
          })
        }
      })
      this.visible = false
      this.$emit('update-permission-relation', permissionInfos)
    },
    handlePermission () {
      this.permissionCategoryList == null
      listPermissionCategory().then(response => {
        this.permissionCategoryList = response.result
        this.permissionCategoryList.forEach((permissionCategory) => {
          if (permissionCategory.permissionInfos == null || permissionCategory.permissionInfos.length <= 0) {
            permissionCategory.checked = false
          } else {
            permissionCategory.checked = true
            permissionCategory.permissionInfos.forEach((permission) => {
              permission.checked = false
              if (this.permissionInfos != null && this.permissionInfos.length > 0) {
                this.permissionInfos.forEach((permissionInfo) => {
                  if (permissionInfo.id == permission.id) {
                    permission.checked = true
                  }
                })
              }
              if (!permission.checked) {
                permissionCategory.checked = false
              }
            })
          }
        })
        this.$forceUpdate();
      })
    },
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
